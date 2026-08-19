/**
 * dsh-workspace-hub — host half.
 *
 * Serves the token-usage and per-model cost endpoints used by the browser
 * half's sidebar panel (workspace folders, token overview, cost stats):
 *
 *   POST /api/wsfm/tokens   per-session provider tokenUsage (4 buckets)
 *   POST /api/wsfm/cost     per-session per-model token buckets (peak/off-peak)
 *
 * Both routes are loopback-only (browser same-origin fence), read JSON bodies
 * and answer JSON. No third-party runtime dependencies — everything rides the
 * dsh host services (sessionProjectionCache, sessionProjections, sessions,
 * sessionQuery).
 */
import type { Context } from '@deepseek-ai/cordis'
import type { IncomingMessage, ServerResponse } from 'node:http'
import type { WebRoute } from '@deepseek-ai/dsh-host-webserver'

/** Stable cordis plugin name. */
export const name = 'workspace-hub'

/** Services required before the routes can mount. */
export const inject = ['webServer']

/** Cap on JSON request bodies (session id lists are small). */
const MAX_JSON_BODY_BYTES = 512 * 1024

/** Normalized per-session token usage view returned by /api/wsfm/tokens. */
interface TokenUsageView {
  uncachedInputTokens: number
  outputTokens: number
  cacheReadTokens: number
  cacheWriteTokens: number
}

/** Per-model accumulated token buckets with peak/off-peak split. */
interface ModelBuckets {
  uncachedInputTokens: number
  outputTokens: number
  cacheReadTokens: number
  cacheWriteTokens: number
  peakUncachedInputTokens: number
  peakOutputTokens: number
  peakCacheReadTokens: number
  peakCacheWriteTokens: number
}

/** IPv4 127/8 predicate (four decimal octets, first == 127). */
function isIPv4Loopback(v4: string) {
  const parts = v4.split('.')
  return parts.length === 4 && parts[0] === '127'
    && parts.every((p) => /^\d{1,3}$/.test(p) && Number(p) <= 255)
}

/** Whether a socket remote address names the loopback range. */
function isLoopbackAddress(address: string | undefined) {
  if (address === undefined) return false
  const normalized = address.toLowerCase()
  if (normalized === '::1') return true
  if (normalized.startsWith('::ffff:')) return isIPv4Loopback(normalized.slice('::ffff:'.length))
  return isIPv4Loopback(normalized)
}

/** Whether a normalized URL hostname names the loopback authority. */
function isLoopbackHostname(hostname: string) {
  if (hostname === 'localhost' || hostname === '[::1]') return true
  return isIPv4Loopback(hostname)
}

/** Request-level trust fence: loopback socket + Host header + same-origin markers. */
function isLoopbackRequest(request: IncomingMessage) {
  if (!isLoopbackAddress(request.socket.remoteAddress)) return false
  const host = request.headers.host
  if (typeof host !== 'string') return false
  let hostUrl
  try {
    hostUrl = new URL('http://' + host)
  } catch {
    return false
  }
  if (!isLoopbackHostname(hostUrl.hostname)) return false
  if (request.headers['sec-fetch-site'] === 'cross-site') return false
  const origin = request.headers.origin
  if (origin === undefined) return true
  try {
    return new URL(origin).host === hostUrl.host
  } catch {
    return false
  }
}

/** One JSON response. */
function writeJson(res: ServerResponse, status: number, body: unknown) {
  const payload = JSON.stringify(body)
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'referrer-policy': 'no-referrer' })
  res.end(payload)
}

/** Read a JSON request body (undefined when too large or unparseable). */
async function readJsonBody(req: IncomingMessage): Promise<Record<string, unknown> | undefined> {
  const chunks = []
  let size = 0
  for await (const chunk of req) {
    const buffer = chunk
    size += buffer.length
    if (size > MAX_JSON_BODY_BYTES) return undefined
    chunks.push(buffer)
  }
  try {
    const parsed = JSON.parse(Buffer.concat(chunks).toString('utf8'))
    return typeof parsed === 'object' && parsed !== null ? parsed : undefined
  } catch {
    return undefined
  }
}

/** Beijing hour for a Unix-epoch-ms timestamp (UTC+8, no DST). */
function bjHour(t: number) {
  const h = new Date(t).getUTCHours() + 8
  return h >= 24 ? h - 24 : h
}

/** Filtered session id list from a request body. */
function sessionIdsOf(body: Record<string, unknown> | undefined): string[] {
  const raw = body && Array.isArray(body.sessionIds) ? body.sessionIds : []
  return raw.filter((x) => typeof x === 'string')
}

/**
 * Mount the two /api/wsfm routes.
 * @param ctx - host plugin context carrying webServer (and optionally the
 *   session projection services).
 */
export function apply(ctx: Context) {
  const webServer = ctx.get('webServer')
  if (webServer === undefined) return
  const cache = ctx.get('sessionProjectionCache')
  const projections = ctx.get('sessionProjections')
  const sessions = ctx.get('sessions')
  const query = ctx.get('sessionQuery')
  const costCache = new Map<string, { at: number; models: Record<string, ModelBuckets> }>()
  const COST_TTL = 30000

  const routes = [
    {
      kind: 'exact',
      path: '/api/wsfm/tokens',
      handler: async (req, res) => {
        if (!isLoopbackRequest(req)) return writeJson(res, 403, { error: 'forbidden: loopback-only' })
        const body = await readJsonBody(req)
        const ids = sessionIdsOf(body)
        const out: Record<string, TokenUsageView | null> = {}
        for (const id of ids) {
          let usage = null
          try {
            if (cache && typeof cache.coldSnapshot === 'function') {
              const snap = await cache.coldSnapshot(id)
              const v = snap && snap.values && snap.values.tokenUsage
              if (v) usage = v
            }
            if (!usage && projections && sessions && typeof sessions.get === 'function') {
              const live = sessions.get(id)
              if (live) {
                const snap = projections.snapshot(live)
                const v = snap && snap.values && snap.values.tokenUsage
                if (v) usage = v
              }
            }
          } catch (err) {
            console.error('wsfm: tokens for ' + id + ' failed', err)
          }
          out[id] = usage
            ? {
                // tokenUsage rows carry { totals, last } in the current projection
                // cache format; fall back to legacy flat fields for older caches.
                uncachedInputTokens: usage.totals?.uncachedInputTokens ?? usage.uncachedInputTokens ?? 0,
                outputTokens: usage.totals?.outputTokens ?? usage.outputTokens ?? 0,
                cacheReadTokens: usage.totals?.cacheReadTokens ?? usage.cacheReadTokens ?? 0,
                cacheWriteTokens: usage.totals?.cacheWriteTokens ?? usage.cacheWriteTokens ?? 0,
              }
            : null
        }
        writeJson(res, 200, out)
      },
    },
    {
      kind: 'exact',
      path: '/api/wsfm/cost',
      handler: async (req, res) => {
        if (!isLoopbackRequest(req)) return writeJson(res, 403, { error: 'forbidden: loopback-only' })
        const body = await readJsonBody(req)
        const ids = sessionIdsOf(body)
        const now = Date.now()
        const out: Record<string, Record<string, ModelBuckets> | null> = {}
        for (const id of ids) {
          const hit = costCache.get(id)
          if (hit && now - hit.at < COST_TTL) {
            out[id] = hit.models
            continue
          }
          try {
            let events = null
            const live = sessions && typeof sessions.get === 'function' ? sessions.get(id) : undefined
            if (live && Array.isArray(live.events)) {
              events = live.events
            } else if (query && typeof query.readSession === 'function') {
              const log = await query.readSession(id)
              events = log && Array.isArray(log.events) ? log.events : []
            }
            const models: Record<string, ModelBuckets> = {}
            if (events) {
              for (const ev of events) {
                if (!ev || ev.type !== 'assistant/message') continue
                const data = ev.data
                if (!data || !data.usage) continue
                const src = data.message && data.message.source
                if (!src || !src.model) continue
                const key = (src.provider ? src.provider + '/' : '') + src.model
                let m: ModelBuckets | undefined = models[key]
                if (!m) m = models[key] = {
                  uncachedInputTokens: 0, outputTokens: 0, cacheReadTokens: 0, cacheWriteTokens: 0,
                  peakUncachedInputTokens: 0, peakOutputTokens: 0, peakCacheReadTokens: 0, peakCacheWriteTokens: 0,
                }
                const u = data.usage
                const peak = bjHour(ev.time) >= 9 && bjHour(ev.time) < 14
                if (peak) {
                  m.peakUncachedInputTokens += u.uncachedInputTokens || 0
                  m.peakOutputTokens += u.outputTokens || 0
                  m.peakCacheReadTokens += u.cacheReadTokens || 0
                  m.peakCacheWriteTokens += u.cacheWriteTokens || 0
                } else {
                  m.uncachedInputTokens += u.uncachedInputTokens || 0
                  m.outputTokens += u.outputTokens || 0
                  m.cacheReadTokens += u.cacheReadTokens || 0
                  m.cacheWriteTokens += u.cacheWriteTokens || 0
                }
              }
            }
            costCache.set(id, { at: now, models })
            out[id] = models
          } catch (err) {
            console.error('wsfm: cost for ' + id + ' failed', err)
            out[id] = null
          }
        }
        writeJson(res, 200, out)
      },
    },
  ] satisfies WebRoute[]

  const disposers = routes.map((route) => webServer.register(route))
  ctx.effect(() => () => { for (const d of disposers) d() }, 'wsfm: routes')
}

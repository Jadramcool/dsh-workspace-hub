import { readFileSync } from 'node:fs';
import { join } from 'node:path';
/** Stable cordis plugin name. */
export const name = 'workspace-hub';
/** Services required before the routes can mount. */
export const inject = ['webServer'];
/** Cap on JSON request bodies (session id lists are small). */
const MAX_JSON_BODY_BYTES = 512 * 1024;
/** IPv4 127/8 predicate (four decimal octets, first == 127). */
function isIPv4Loopback(v4) {
    const parts = v4.split('.');
    return parts.length === 4 && parts[0] === '127'
        && parts.every((p) => /^\d{1,3}$/.test(p) && Number(p) <= 255);
}
/** Whether a socket remote address names the loopback range. */
function isLoopbackAddress(address) {
    if (address === undefined)
        return false;
    const normalized = address.toLowerCase();
    if (normalized === '::1')
        return true;
    if (normalized.startsWith('::ffff:'))
        return isIPv4Loopback(normalized.slice('::ffff:'.length));
    return isIPv4Loopback(normalized);
}
/** Whether a normalized URL hostname names the loopback authority. */
function isLoopbackHostname(hostname) {
    if (hostname === 'localhost' || hostname === '[::1]')
        return true;
    return isIPv4Loopback(hostname);
}
/** Request-level trust fence: loopback socket + Host header + same-origin markers. */
function isLoopbackRequest(request) {
    if (!isLoopbackAddress(request.socket.remoteAddress))
        return false;
    const host = request.headers.host;
    if (typeof host !== 'string')
        return false;
    let hostUrl;
    try {
        hostUrl = new URL('http://' + host);
    }
    catch {
        return false;
    }
    if (!isLoopbackHostname(hostUrl.hostname))
        return false;
    if (request.headers['sec-fetch-site'] === 'cross-site')
        return false;
    const origin = request.headers.origin;
    if (origin === undefined)
        return true;
    try {
        return new URL(origin).host === hostUrl.host;
    }
    catch {
        return false;
    }
}
/** One JSON response. */
function writeJson(res, status, body) {
    const payload = JSON.stringify(body);
    res.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'referrer-policy': 'no-referrer' });
    res.end(payload);
}
/** Read a JSON request body (undefined when too large or unparseable). */
async function readJsonBody(req) {
    const chunks = [];
    let size = 0;
    for await (const chunk of req) {
        const buffer = chunk;
        size += buffer.length;
        if (size > MAX_JSON_BODY_BYTES)
            return undefined;
        chunks.push(buffer);
    }
    try {
        const parsed = JSON.parse(Buffer.concat(chunks).toString('utf8'));
        return typeof parsed === 'object' && parsed !== null ? parsed : undefined;
    }
    catch {
        return undefined;
    }
}
/** Beijing hour for a Unix-epoch-ms timestamp (UTC+8, no DST). */
function bjHour(t) {
    const h = new Date(t).getUTCHours() + 8;
    return h >= 24 ? h - 24 : h;
}
/** Filtered session id list from a request body. */
function sessionIdsOf(body) {
    const raw = body && Array.isArray(body.sessionIds) ? body.sessionIds : [];
    return raw.filter((x) => typeof x === 'string');
}
/**
 * Mount the two /api/wsfm routes.
 * @param ctx - host plugin context carrying webServer (and optionally the
 *   session projection services).
 */
export function apply(ctx) {
    const webServer = ctx.get('webServer');
    if (webServer === undefined)
        return;
    // Services are fetched lazily INSIDE each handler: this bundle mounts at
    // profile boot (root context), where session-scoped services may not be
    // provided yet. The dynamic-plugin original ran inside a session context
    // where they were always present — the root-context mount is the one
    // behavioral difference that broke coldSnapshot/readSession lookups.
    const svc = () => ({
        cache: ctx.get('sessionProjectionCache'),
        projections: ctx.get('sessionProjections'),
        sessions: ctx.get('sessions'),
        query: ctx.get('sessionQuery'),
    });
    const costCache = new Map();
    const COST_TTL = 30000;
    const LOG_READ_TIMEOUT_MS = 15000;
    /** Reject a promise after a deadline (the underlying work keeps running). */
    function withTimeout(p, ms, label) {
        return new Promise((resolve, reject) => {
            const t = setTimeout(() => reject(new Error(label + ' timed out after ' + ms + 'ms')), ms);
            p.then((v) => { clearTimeout(t); resolve(v); }, (e) => { clearTimeout(t); reject(e); });
        });
    }
    /** Aggregate token totals straight from the session log events. */
    async function tokensFromLog(id) {
        const s = svc();
        if (!s.query || typeof s.query.readSession !== 'function')
            return null;
        const log = await s.query.readSession(id);
        const events = log && Array.isArray(log.events) ? log.events : [];
        let uncached = 0, output = 0, cacheRead = 0, cacheWrite = 0;
        for (const ev of events) {
            const u = ev && ev.data && ev.data.usage;
            if (!u)
                continue;
            uncached += u.uncachedInputTokens || 0;
            output += u.outputTokens || 0;
            cacheRead += u.cacheReadTokens || 0;
            cacheWrite += u.cacheWriteTokens || 0;
        }
        if (uncached === 0 && output === 0 && cacheRead === 0 && cacheWrite === 0)
            return null;
        return { uncachedInputTokens: uncached, outputTokens: output, cacheReadTokens: cacheRead, cacheWriteTokens: cacheWrite };
    }
    /** Token usage for one session: projection cold/live first, then log events. */
    async function tokensFor(id) {
        const s = svc();
        let usage = null;
        // Live projection first: a live session's cold row lags behind (checkpoints
        // are write-behind), so the in-memory projection is the freshest source.
        try {
            if (s.projections && s.sessions && typeof s.sessions.get === 'function') {
                const live = s.sessions.get(id);
                if (live) {
                    const snap = s.projections.snapshot(live);
                    const v = snap && snap.values && snap.values.tokenUsage;
                    if (v)
                        usage = v;
                }
            }
        }
        catch (err) {
            console.error('wsfm: live tokens for ' + id + ' failed', err);
        }
        if (!usage) {
            try {
                if (s.cache && typeof s.cache.coldSnapshot === 'function') {
                    const snap = await s.cache.coldSnapshot(id);
                    const v = snap && snap.values && snap.values.tokenUsage;
                    if (v)
                        usage = v;
                }
            }
            catch (err) {
                console.error('wsfm: projection tokens for ' + id + ' failed', err);
            }
        }
        if (usage) {
            const t = usage;
            return {
                // tokenUsage rows carry { totals, last } in the current projection
                // cache format; fall back to legacy flat fields for older caches.
                uncachedInputTokens: t.totals?.uncachedInputTokens ?? t.uncachedInputTokens ?? 0,
                outputTokens: t.totals?.outputTokens ?? t.outputTokens ?? 0,
                cacheReadTokens: t.totals?.cacheReadTokens ?? t.cacheReadTokens ?? 0,
                cacheWriteTokens: t.totals?.cacheWriteTokens ?? t.cacheWriteTokens ?? 0,
            };
        }
        // Fallback: aggregate from the session log events (slow but accurate).
        try {
            const fromLog = await tokensFromLog(id);
            if (fromLog)
                return fromLog;
        }
        catch (err) {
            console.error('wsfm: log tokens for ' + id + ' failed', err);
        }
        return null;
    }
    // ---- OpenCode Go plan usage ---------------------------------------------
    const OPCODE_USAGE_URL = 'https://opencode.ai/zen/go/v1/usage';
    const OPCODE_USAGE_TTL = 60000;
    let usageCache = null;
    /** Resolve the OpenCode API key from ~/.local/share/opencode/auth.json. */
    function readOpencodeKey() {
        try {
            const home = process.env.USERPROFILE || process.env.HOME || '';
            if (!home)
                return null;
            const raw = readFileSync(join(home, '.local', 'share', 'opencode', 'auth.json'), 'utf8');
            const auth = JSON.parse(raw);
            const entry = auth['opencode-go'] ?? auth.opencode;
            if (entry && typeof entry.key === 'string' && entry.key.length > 0)
                return entry.key;
            return null;
        }
        catch {
            return null;
        }
    }
    /** Fetch OpenCode Go plan usage with a short cache; failures are not cached. */
    async function opencodeUsage() {
        const now = Date.now();
        if (usageCache && now - usageCache.at < OPCODE_USAGE_TTL)
            return usageCache.data;
        const key = readOpencodeKey();
        if (!key)
            return { ok: false, reason: 'no-key' };
        try {
            const res = await fetch(OPCODE_USAGE_URL, {
                headers: { authorization: 'Bearer ' + key },
                signal: AbortSignal.timeout(15000),
            });
            if (!res.ok)
                return { ok: false, reason: 'http-' + res.status };
            const body = (await res.json());
            const usage = body && body.usage;
            if (!usage)
                return { ok: false, reason: 'bad-body' };
            const data = {
                ok: true,
                usage: {
                    rolling: usage.rolling ?? null,
                    weekly: usage.weekly ?? null,
                    monthly: usage.monthly ?? null,
                },
            };
            usageCache = { at: now, data };
            return data;
        }
        catch {
            return { ok: false, reason: 'network' };
        }
    }
    const routes = [
        {
            kind: 'exact',
            path: '/api/wsfm/usage',
            handler: async (req, res) => {
                if (!isLoopbackRequest(req))
                    return writeJson(res, 403, { error: 'forbidden: loopback-only' });
                writeJson(res, 200, await opencodeUsage());
            },
        },
        {
            kind: 'exact',
            path: '/api/wsfm/diag',
            handler: async (req, res) => {
                if (!isLoopbackRequest(req))
                    return writeJson(res, 403, { error: 'forbidden: loopback-only' });
                const body = await readJsonBody(req);
                const ids = sessionIdsOf(body);
                const s = svc();
                const out = {
                    services: {
                        cache: s.cache !== undefined && typeof s.cache.coldSnapshot === 'function',
                        projections: s.projections !== undefined && typeof s.projections.snapshot === 'function',
                        sessions: s.sessions !== undefined && typeof s.sessions.get === 'function',
                        query: s.query !== undefined && typeof s.query.readSession === 'function',
                    },
                };
                for (const id of ids) {
                    const rec = {};
                    try {
                        if (s.cache && typeof s.cache.coldSnapshot === 'function') {
                            const snap = await s.cache.coldSnapshot(id);
                            rec.coldSnapshot = {
                                ok: true,
                                keys: snap ? Object.keys(snap) : null,
                                valuesKeys: snap && snap.values ? Object.keys(snap.values) : null,
                                tokenUsage: snap && snap.values && snap.values.tokenUsage ? { keys: Object.keys(snap.values.tokenUsage), preview: JSON.stringify(snap.values.tokenUsage).slice(0, 200) } : null,
                            };
                        }
                        else {
                            rec.coldSnapshot = { ok: false, reason: 'service missing' };
                        }
                    }
                    catch (err) {
                        rec.coldSnapshot = { ok: false, reason: String(err?.message ?? err) };
                    }
                    try {
                        const live = s.sessions && typeof s.sessions.get === 'function' ? s.sessions.get(id) : undefined;
                        rec.live = live !== undefined;
                        if (live && s.projections && typeof s.projections.snapshot === 'function') {
                            const snap = s.projections.snapshot(live);
                            rec.liveSnapshot = {
                                keys: snap ? Object.keys(snap) : null,
                                valuesKeys: snap && snap.values ? Object.keys(snap.values) : null,
                            };
                        }
                    }
                    catch (err) {
                        rec.live = { error: String(err?.message ?? err) };
                    }
                    try {
                        if (s.query && typeof s.query.readSession === 'function') {
                            const t0 = Date.now();
                            const log = await withTimeout(s.query.readSession(id), LOG_READ_TIMEOUT_MS, 'wsfm diag readSession');
                            const ms = Date.now() - t0;
                            const events = log && Array.isArray(log.events) ? log.events : [];
                            rec.readSession = { ok: true, ms, events: events.length };
                        }
                        else {
                            rec.readSession = { ok: false, reason: 'service missing' };
                        }
                    }
                    catch (err) {
                        rec.readSession = { ok: false, error: String(err?.message ?? err) };
                    }
                    out[id] = rec;
                }
                writeJson(res, 200, out);
            },
        },
        {
            kind: 'exact',
            path: '/api/wsfm/tokens',
            handler: async (req, res) => {
                if (!isLoopbackRequest(req))
                    return writeJson(res, 403, { error: 'forbidden: loopback-only' });
                const body = await readJsonBody(req);
                const ids = sessionIdsOf(body);
                const out = {};
                for (const id of ids) {
                    out[id] = await tokensFor(id);
                }
                writeJson(res, 200, out);
            },
        },
        {
            kind: 'exact',
            path: '/api/wsfm/cost',
            handler: async (req, res) => {
                if (!isLoopbackRequest(req))
                    return writeJson(res, 403, { error: 'forbidden: loopback-only' });
                const body = await readJsonBody(req);
                const ids = sessionIdsOf(body);
                const now = Date.now();
                const out = {};
                for (const id of ids) {
                    const hit = costCache.get(id);
                    if (hit && now - hit.at < COST_TTL) {
                        out[id] = hit.models;
                        continue;
                    }
                    try {
                        const s = svc();
                        let events = null;
                        const live = s.sessions && typeof s.sessions.get === 'function' ? s.sessions.get(id) : undefined;
                        if (live && Array.isArray(live.events)) {
                            events = live.events;
                        }
                        else if (s.query && typeof s.query.readSession === 'function') {
                            const log = await withTimeout(s.query.readSession(id), LOG_READ_TIMEOUT_MS, 'wsfm cost readSession');
                            events = log && Array.isArray(log.events) ? log.events : [];
                        }
                        const models = {};
                        if (events) {
                            for (const ev of events) {
                                if (!ev || ev.type !== 'assistant/message')
                                    continue;
                                const data = ev.data;
                                if (!data || !data.usage)
                                    continue;
                                const src = data.message && data.message.source;
                                if (!src || !src.model)
                                    continue;
                                const key = (src.provider ? src.provider + '/' : '') + src.model;
                                let m = models[key];
                                if (!m)
                                    m = models[key] = {
                                        uncachedInputTokens: 0, outputTokens: 0, cacheReadTokens: 0, cacheWriteTokens: 0,
                                        peakUncachedInputTokens: 0, peakOutputTokens: 0, peakCacheReadTokens: 0, peakCacheWriteTokens: 0,
                                    };
                                const u = data.usage;
                                const peak = bjHour(ev.time) >= 9 && bjHour(ev.time) < 14;
                                if (peak) {
                                    m.peakUncachedInputTokens += u.uncachedInputTokens || 0;
                                    m.peakOutputTokens += u.outputTokens || 0;
                                    m.peakCacheReadTokens += u.cacheReadTokens || 0;
                                    m.peakCacheWriteTokens += u.cacheWriteTokens || 0;
                                }
                                else {
                                    m.uncachedInputTokens += u.uncachedInputTokens || 0;
                                    m.outputTokens += u.outputTokens || 0;
                                    m.cacheReadTokens += u.cacheReadTokens || 0;
                                    m.cacheWriteTokens += u.cacheWriteTokens || 0;
                                }
                            }
                        }
                        costCache.set(id, { at: now, models });
                        out[id] = models;
                    }
                    catch (err) {
                        console.error('wsfm: cost for ' + id + ' failed', err);
                        out[id] = null;
                    }
                }
                writeJson(res, 200, out);
            },
        },
    ];
    const disposers = routes.map((route) => webServer.register(route));
    ctx.effect(() => () => { for (const d of disposers)
        d(); }, 'wsfm: routes');
}
//# sourceMappingURL=index.js.map
/**
 * dsh-workspace-hub — host half.
 *
 * Serves the token-usage, cost, and OpenCode Go plan-usage endpoints used by
 * the browser half's sidebar panel (workspace folders, token overview, cost
 * stats, quota):
 *
 *   POST /api/wsfm/tokens   per-session provider tokenUsage (4 buckets)
 *   POST /api/wsfm/cost     per-session per-model token buckets (peak/off-peak)
 *   POST /api/wsfm/usage    OpenCode Go plan usage (5h/weekly/monthly), refreshable
 *
 * Routes are loopback-only (browser same-origin fence), read JSON bodies and
 * answer JSON. No third-party runtime dependencies — everything rides the dsh
 * host services (sessionProjectionCache, sessionProjections, sessions,
 * sessionQuery). Cost breakdowns persist to ~/.dsh/wsfm-cost.json keyed by the
 * projection watermark so restarts do not replay unchanged session logs.
 */
import type { Context } from '@deepseek-ai/cordis';
/** Stable cordis plugin name. */
export declare const name = "workspace-hub";
/** Services required before the routes can mount. */
export declare const inject: string[];
/**
 * Mount the two /api/wsfm routes.
 * @param ctx - host plugin context carrying webServer (and optionally the
 *   session projection services).
 */
export declare function apply(ctx: Context): void;

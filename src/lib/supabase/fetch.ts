/**
 * Supabase clients wait indefinitely by default, and a paused or unreachable
 * project doesn't refuse the connection — it hangs. A deadline alone isn't
 * enough: a page request runs several queries in sequence, so a dead backend
 * still costs `timeout x number of queries` per page.
 *
 * So this adds a circuit breaker on top. The first request that times out
 * trips it, and every Supabase call after that fails instantly until the
 * cooldown expires and one request is let through to probe for recovery.
 */
export const SUPABASE_TIMEOUT_MS = {
  /** Session refresh on the request path — keep navigation responsive. */
  proxy: 2500,
  server: 4000,
  admin: 4000,
  browser: 8000,
} as const;

/** How long to skip the network after a failure before probing again. */
const COOLDOWN_MS = 20_000;

/**
 * Module state, so it is per server instance and resets on deploy. On
 * serverless each instance learns independently; still far better than every
 * request paying the full timeout.
 */
let downUntil = 0;

export function backendLooksDown(): boolean {
  return Date.now() < downUntil;
}

export function markBackendUp(): void {
  downUntil = 0;
}

function isTimeoutOrNetwork(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  return (
    error.name === "TimeoutError" ||
    error.name === "AbortError" ||
    error.name === "TypeError" // fetch's network-failure shape
  );
}

export function timeoutFetch(ms: number): typeof fetch {
  return async (input, init) => {
    if (backendLooksDown()) {
      throw new DOMException("Supabase circuit open", "TimeoutError");
    }
    try {
      const response = await fetch(input as RequestInfo, {
        ...init,
        signal: AbortSignal.timeout(ms),
      });
      markBackendUp();
      return response;
    } catch (error) {
      if (isTimeoutOrNetwork(error)) downUntil = Date.now() + COOLDOWN_MS;
      throw error;
    }
  };
}

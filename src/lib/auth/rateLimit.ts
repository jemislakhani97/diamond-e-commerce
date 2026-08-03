/**
 * Sign-in rate limit — per-IP failed-attempt counter.
 *
 * A sliding 15-minute window is maintained per IP: each failed attempt
 * records a timestamp; timestamps older than the window are dropped on read.
 * Once the recorded count reaches MAX_FAILURES within the window,
 * `shouldRateLimit` returns true and the caller MUST return 429 without
 * running the credential check.
 *
 * The counter is per-process in-memory — good enough pre-launch. Swap for a
 * shared store (Redis, DB) before we run more than one instance.
 */

const WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILURES = 5;

const attempts = new Map<string, number[]>();

function pruneAndGet(ip: string, now: number): number[] {
  const list = attempts.get(ip) ?? [];
  const kept = list.filter((t) => now - t < WINDOW_MS);
  if (kept.length === 0) {
    attempts.delete(ip);
  } else if (kept.length !== list.length) {
    attempts.set(ip, kept);
  }
  return kept;
}

export function shouldRateLimit(ip: string): boolean {
  const kept = pruneAndGet(ip, Date.now());
  return kept.length >= MAX_FAILURES;
}

export function recordFailedAttempt(ip: string): void {
  const now = Date.now();
  const kept = pruneAndGet(ip, now);
  kept.push(now);
  attempts.set(ip, kept);
}

export function clearAttempts(ip: string): void {
  attempts.delete(ip);
}

// Test-only reset. Not exported from an index barrel.
export function _resetAllRateLimits(): void {
  attempts.clear();
}

export const RATE_LIMIT_MAX_FAILURES = MAX_FAILURES;
export const RATE_LIMIT_WINDOW_MS = WINDOW_MS;

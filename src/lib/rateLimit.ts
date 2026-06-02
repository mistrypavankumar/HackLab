// Minimal in-memory sliding-window limiter for the brute-force lab. Real apps
// should use a shared store (Redis) so limits survive restarts and scale out.
type Bucket = { count: number; first: number };

const buckets = new Map<string, Bucket>();

export const MAX_ATTEMPTS = 5;
export const WINDOW_MS = 60_000;

export function recordAttempt(key: string, now: number): { locked: boolean; remaining: number } {
  const bucket = buckets.get(key);
  if (!bucket || now - bucket.first > WINDOW_MS) {
    buckets.set(key, { count: 1, first: now });
    return { locked: false, remaining: MAX_ATTEMPTS - 1 };
  }
  bucket.count += 1;
  const locked = bucket.count > MAX_ATTEMPTS;
  return { locked, remaining: Math.max(0, MAX_ATTEMPTS - bucket.count) };
}

export function resetLimiter(key?: string): void {
  if (key) buckets.delete(key);
  else buckets.clear();
}

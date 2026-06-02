import { beforeEach, describe, expect, it } from 'vitest';
import { MAX_ATTEMPTS, recordAttempt, resetLimiter } from '@/lib/rateLimit';

describe('brute-force: rate limiter', () => {
  beforeEach(() => resetLimiter());

  it('locks after the attempt threshold is exceeded', () => {
    const key = 'lab:admin';
    const now = 1_000;
    let locked = false;
    for (let i = 0; i < MAX_ATTEMPTS; i++) {
      locked = recordAttempt(key, now).locked;
      expect(locked).toBe(false); // first MAX_ATTEMPTS are allowed
    }
    expect(recordAttempt(key, now).locked).toBe(true); // the next one trips
  });

  it('resets after the time window passes', () => {
    const key = 'lab:admin';
    for (let i = 0; i <= MAX_ATTEMPTS; i++) recordAttempt(key, 1_000);
    // Far in the future -> new window, not locked.
    expect(recordAttempt(key, 1_000 + 120_000).locked).toBe(false);
  });
});

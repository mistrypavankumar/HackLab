import { describe, expect, it } from 'vitest';
import { CSRF_TOKEN, handleChangeEmail } from '@/labs/csrf/route-logic';

describe('csrf: handleChangeEmail', () => {
  it('VULNERABLE: accepts a request with no token', () => {
    expect(handleChangeEmail('vulnerable', null).ok).toBe(true);
  });

  it('SECURE: rejects a missing or wrong token with 403', () => {
    expect(handleChangeEmail('secure', null).status).toBe(403);
    expect(handleChangeEmail('secure', 'wrong').status).toBe(403);
  });

  it('SECURE: accepts the valid token', () => {
    expect(handleChangeEmail('secure', CSRF_TOKEN).ok).toBe(true);
  });
});

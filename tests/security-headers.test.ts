import { describe, expect, it } from 'vitest';
import { pageHeaders } from '@/labs/security-headers/route-logic';

describe('security-headers: pageHeaders', () => {
  it('SECURE: sets framing protections', () => {
    const h = pageHeaders('secure');
    expect(h['content-security-policy']).toContain("frame-ancestors 'none'");
    expect(h['x-frame-options']).toBe('DENY');
  });

  it('VULNERABLE: omits framing protections', () => {
    const h = pageHeaders('vulnerable');
    expect(h['content-security-policy']).toBeUndefined();
    expect(h['x-frame-options']).toBeUndefined();
  });
});

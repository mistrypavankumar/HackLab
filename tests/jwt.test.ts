import { describe, expect, it } from 'vitest';
import { signToken, verifyTokenSecure, verifyTokenVulnerable } from '@/lib/jwt';

function b64url(obj: unknown): string {
  return Buffer.from(JSON.stringify(obj))
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

// An attacker-forged unsigned token claiming admin.
const forged = `${b64url({ alg: 'none', typ: 'JWT' })}.${b64url({ sub: '2', role: 'admin' })}.`;

describe('jwt-tampering', () => {
  it('VULNERABLE: trusts a forged alg=none admin token', () => {
    expect(verifyTokenVulnerable(forged).role).toBe('admin');
  });

  it('SECURE: rejects the forged alg=none token', () => {
    expect(() => verifyTokenSecure(forged)).toThrow();
  });

  it('SECURE: rejects a token signed with the wrong secret', () => {
    // Tampered signature on an otherwise-valid structure.
    const bad = signToken({ sub: '2', role: 'user' }).slice(0, -3) + 'xxx';
    expect(() => verifyTokenSecure(bad)).toThrow();
  });

  it('SECURE: accepts a legitimately signed token', () => {
    const token = signToken({ sub: '2', role: 'user' });
    expect(verifyTokenSecure(token).role).toBe('user');
  });
});

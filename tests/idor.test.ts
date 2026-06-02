import { describe, expect, it } from 'vitest';
import { getInvoice } from '@/labs/idor/route-logic';
import { makeTestDb } from './helpers/testDb';

describe('idor: getInvoice', () => {
  const db = makeTestDb();
  const ALICE = 2;

  it('VULNERABLE: returns another user’s invoice', () => {
    const res = getInvoice(db, 'vulnerable', 101, ALICE); // 101 belongs to admin
    expect(res.ok).toBe(true);
  });

  it('SECURE: denies access to an invoice the caller does not own', () => {
    const res = getInvoice(db, 'secure', 101, ALICE);
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.status).toBe(403);
  });

  it('SECURE: allows access to the caller’s own invoice', () => {
    const res = getInvoice(db, 'secure', 102, ALICE); // 102 belongs to alice
    expect(res.ok).toBe(true);
  });
});

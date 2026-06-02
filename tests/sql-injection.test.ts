import { describe, expect, it } from 'vitest';
import { login } from '@/labs/sql-injection/route-logic';
import { makeTestDb } from './helpers/testDb';

describe('sql-injection: login', () => {
  const db = makeTestDb();

  it('VULNERABLE: injection bypasses the password check', () => {
    const user = login(db, 'vulnerable', "admin' --", 'whatever');
    expect(user?.username).toBe('admin');
  });

  it("VULNERABLE: ' OR '1'='1 returns a row", () => {
    const user = login(db, 'vulnerable', "' OR '1'='1' --", 'x');
    expect(user).not.toBeNull();
  });

  it('SECURE: injection string is treated as a literal username and fails', () => {
    expect(login(db, 'secure', "admin' --", 'whatever')).toBeNull();
    expect(login(db, 'secure', "' OR '1'='1' --", 'x')).toBeNull();
  });

  it('SECURE: correct credentials still work', () => {
    const user = login(db, 'secure', 'admin', 'SuperSecretAdminPass!');
    expect(user?.role).toBe('admin');
  });
});

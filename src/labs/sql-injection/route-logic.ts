import type Database from 'better-sqlite3';
import { verifyPassword } from '@/lib/hash';
import type { LabMode } from '@/labs/types';

export interface SafeUser {
  id: number;
  username: string;
  role: string;
}

interface UserRow extends SafeUser {
  password_hash: string;
}

export function login(
  db: Database.Database,
  mode: LabMode,
  username: string,
  password: string,
): SafeUser | null {
  if (mode === 'secure') {
    // SECURE: bound parameter — input can never alter the query structure.
    const row = db
      .prepare('SELECT id, username, role, password_hash FROM users WHERE username = ?')
      .get(username) as UserRow | undefined;
    if (!row) return null;
    if (!verifyPassword(password, row.password_hash)) return null;
    return { id: row.id, username: row.username, role: row.role };
  }

  // VULNERABLE: input concatenated directly into SQL.
  const sql =
    "SELECT id, username, role FROM users WHERE username = '" +
    username +
    "' AND password_hash = '" +
    password +
    "'";
  try {
    const row = db.prepare(sql).get() as SafeUser | undefined;
    return row ?? null;
  } catch {
    return null;
  }
}

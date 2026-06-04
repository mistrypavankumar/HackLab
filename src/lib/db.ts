import Database from 'better-sqlite3';
import path from 'node:path';
import { seed } from './seed';

// On Vercel / production the filesystem is read-only and ephemeral, so we use an
// in-memory database that is (re)seeded on each cold start. Locally we use a file
// so data persists between restarts.
let instance: Database.Database | null = null;

function isServerless(): boolean {
  return Boolean(process.env.VERCEL) || process.env.NODE_ENV === 'production';
}

export function getDb(): Database.Database {
  if (!instance) {
    if (isServerless()) {
      instance = new Database(':memory:');
    } else {
      instance = new Database(path.join(process.cwd(), 'hacklab.db'));
      instance.pragma('journal_mode = WAL');
    }
    // Seed on first use if the schema is missing — no manual `pnpm seed` needed.
    const hasUsers = instance
      .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='users'")
      .get();
    if (!hasUsers) seed(instance);
  }
  return instance;
}

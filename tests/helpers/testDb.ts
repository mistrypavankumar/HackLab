import Database from 'better-sqlite3';
import { seed } from '@/lib/seed';

// Fresh in-memory database seeded with the standard lab data.
export function makeTestDb(): Database.Database {
  const db = new Database(':memory:');
  seed(db);
  return db;
}

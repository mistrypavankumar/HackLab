import Database from 'better-sqlite3';
import path from 'node:path';

// Single shared connection to the local SQLite file (gitignored).
let instance: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!instance) {
    const file = path.join(process.cwd(), 'hacklab.db');
    instance = new Database(file);
    instance.pragma('journal_mode = WAL');
  }
  return instance;
}

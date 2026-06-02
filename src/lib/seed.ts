import type Database from 'better-sqlite3';
import { getDb } from './db';
import { hashPassword } from './hash';

// Idempotent seed: drop + recreate the schema and insert deterministic data so
// every lab starts from the same known state. Accepts a db so tests can pass an
// in-memory instance.
export function seed(db: Database.Database = getDb()): void {
  db.exec(`
    DROP TABLE IF EXISTS users;
    DROP TABLE IF EXISTS invoices;
    DROP TABLE IF EXISTS comments;

    CREATE TABLE users (
      id INTEGER PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL,
      email TEXT NOT NULL
    );

    CREATE TABLE invoices (
      id INTEGER PRIMARY KEY,
      user_id INTEGER NOT NULL,
      amount REAL NOT NULL,
      detail TEXT NOT NULL
    );

    CREATE TABLE comments (
      id INTEGER PRIMARY KEY,
      author TEXT NOT NULL,
      body TEXT NOT NULL
    );
  `);

  const insertUser = db.prepare(
    'INSERT INTO users (id, username, password_hash, role, email) VALUES (?, ?, ?, ?, ?)',
  );
  insertUser.run(1, 'admin', hashPassword('SuperSecretAdminPass!'), 'admin', 'admin@hacklab.test');
  insertUser.run(2, 'alice', hashPassword('alice123'), 'user', 'alice@hacklab.test');
  insertUser.run(3, 'bob', hashPassword('bob123'), 'user', 'bob@hacklab.test');

  const insertInvoice = db.prepare(
    'INSERT INTO invoices (id, user_id, amount, detail) VALUES (?, ?, ?, ?)',
  );
  insertInvoice.run(101, 1, 9999.0, 'Admin payroll — CONFIDENTIAL');
  insertInvoice.run(102, 2, 42.5, 'Alice — coffee subscription');
  insertInvoice.run(103, 3, 88.0, 'Bob — hosting bill');

  const insertComment = db.prepare(
    'INSERT INTO comments (id, author, body) VALUES (?, ?, ?)',
  );
  insertComment.run(1, 'alice', 'First! Loving these labs.');
  insertComment.run(2, 'bob', 'The XSS one got me good.');
}

// Allow `pnpm seed` to run this directly.
const isDirect =
  process.argv[1] && process.argv[1].endsWith('seed.ts');
if (isDirect) {
  seed();
  // eslint-disable-next-line no-console
  console.log('✔ HackLab database seeded.');
}

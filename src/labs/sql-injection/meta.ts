import type { LabMeta } from '../types';

export const meta: LabMeta = {
  slug: 'sql-injection',
  title: 'SQL Injection',
  category: 'backend',
  difficulty: 'basic',
  summary:
    "The login query is built by gluing strings together, so input like ' OR '1'='1 rewrites the query and logs you in as admin without a password.",
  vulnerableCode: `// Input is concatenated straight into SQL.
const sql =
  "SELECT * FROM users WHERE username = '" + username +
  "' AND password_hash = '" + password + "'";
return db.prepare(sql).get();
// username = "admin' --"  ->  password check is commented out`,
  secureCode: `// Parameterized query: input is data, never code.
const row = db
  .prepare('SELECT * FROM users WHERE username = ?')
  .get(username);
if (!row) return null;
return verifyPassword(password, row.password_hash) ? row : null;`,
  why: 'When user input is concatenated into a query string, an attacker can break out of the data context and inject SQL syntax — bypassing auth, reading any table, or modifying data. Comment sequences (--) truncate the rest of the query.',
  detect: 'Search for string concatenation or template literals building SQL/NoSQL queries with request data. Any query not using bound parameters/placeholders (?, $1, :name) is suspect — including dynamic ORDER BY and table names.',
  checklist: [
    'Use parameterized queries / prepared statements everywhere.',
    'Never concatenate user input into a query string.',
    'Validate/allowlist values that can’t be parameterized (column/table names).',
    'Apply least-privilege DB accounts so injection blast radius is limited.',
  ],
};

// A virtual copy of practice-target/, embedded so the in-browser terminal can
// search it client-side. Keep in sync with the real practice-target/ files.

export interface VFile {
  path: string;
  content: string;
}

export const FILES: VFile[] = [
  {
    path: 'practice-target/config.js',
    content: `// App configuration — riddled with planted findings for grep practice.
export const config = {
  apiKey: 'sk_live_5f8a9c2b1e7d4063a1b2c3d4',
  dbPassword: 'Pr0d-P@ssw0rd!',
  awsAccessKeyId: 'AKIAIOSFODNN7EXAMPLE',
  awsSecretAccessKey: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY',
  jwtSecret: 'hunter2',
  publicAppName: 'HackLab',
};`,
  },
  {
    path: 'practice-target/db.js',
    content: `// VULNERABLE: query built by string concatenation (SQL injection).
export function findUser(db, username) {
  const sql = "SELECT * FROM users WHERE username = '" + username + "'";
  return db.prepare(sql).get();
}

export function searchInvoices(db, term) {
  // Also concatenated — another injection point.
  return db.prepare('SELECT * FROM invoices WHERE detail LIKE "%' + term + '%"').all();
}`,
  },
  {
    path: 'practice-target/auth.js',
    content: `// Dangerous dynamic evaluation.
export function runRule(expr, ctx) {
  return eval(expr); // TODO: replace eval with a safe expression parser
}

export function decodeToken(token) {
  // FIXME: trusts the token without verifying the signature
  return JSON.parse(atob(token.split('.')[1]));
}`,
  },
  {
    path: 'practice-target/ui/Comment.jsx',
    content: `export function Comment({ body }) {
  // XSS sink: renders user-controlled input as raw HTML.
  return <div dangerouslySetInnerHTML={{ __html: body }} />;
}

export function setStatus(el, msg) {
  el.innerHTML = msg; // another DOM XSS sink
}`,
  },
  {
    path: 'practice-target/server/handler.js',
    content: `import { config } from '../config.js';

// Logs a secret — shows up in logs/CI output.
console.log('Booting with key', config.apiKey);

export function debugConfig(req, res) {
  // Leaks the entire environment to any caller.
  res.json(process.env);
}

export function ping(req, res) {
  res.send('pong');
}`,
  },
  {
    path: 'practice-target/.env.example',
    content: `NODE_ENV=development
API_SECRET=sk_test_DO_NOT_COMMIT_8273
DATABASE_URL=postgres://admin:supersecret@localhost:5432/app
STRIPE_KEY=sk_live_51HxxxxxxxxxxxxREPLACE
ADMIN_EMAIL=ops@example.com`,
  },
  {
    path: 'practice-target/notes.md',
    content: `# Dev notes

- TODO: rotate the API_SECRET before launch
- FIXME: remove the debug /config endpoint that leaks process.env
- Temp admin token for testing: eyJhbGciOiJIUzI1NiJ9.eyJyb2xlIjoiYWRtaW4ifQ.x
- Server IP: 10.0.4.17
- Contact: ops@example.com
- Slack webhook: https://hooks.slack.com/services/T000/B000/XXXXXXXX`,
  },
];

export const DIRS = ['practice-target', 'practice-target/ui', 'practice-target/server'];

export function isDir(p: string): boolean {
  return DIRS.includes(p) || p === '.';
}

export function fileExists(p: string): boolean {
  return FILES.some((f) => f.path === p);
}

export function getFile(p: string): VFile | undefined {
  return FILES.find((f) => f.path === p);
}

export function basename(p: string): string {
  return p.split('/').pop() ?? p;
}

/** All file paths under a directory arg (recursively). */
export function filesUnder(dir: string): VFile[] {
  if (dir === '.') return [...FILES];
  return FILES.filter((f) => f.path === dir || f.path.startsWith(dir + '/'));
}

/** Immediate child entries of a directory prefix, for Tab completion.
 *  baseDir '' means the repo root. */
export function childEntries(baseDir: string): { name: string; isDir: boolean }[] {
  const prefix = baseDir === '' ? '' : baseDir + '/';
  const all = [...FILES.map((f) => f.path), ...DIRS];
  const map = new Map<string, boolean>(); // name -> isDir
  for (const p of all) {
    if (!p.startsWith(prefix)) continue;
    const rest = p.slice(prefix.length);
    if (rest === '') continue;
    const seg = rest.split('/')[0];
    const isDir = rest.includes('/') || DIRS.includes(prefix + seg);
    map.set(seg, (map.get(seg) ?? false) || isDir);
  }
  return [...map.entries()]
    .map(([name, isDir]) => ({ name, isDir }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

/** Immediate children (files + dirs) of a directory, for `ls`. */
export function childrenOf(dir: string): string[] {
  const base = dir === '.' ? '' : dir + '/';
  const seen = new Set<string>();
  const all = [...FILES.map((f) => f.path), ...DIRS];
  for (const p of all) {
    if (dir === '.') {
      seen.add(p.split('/')[0]);
    } else if (p.startsWith(base) && p !== dir) {
      seen.add(base + p.slice(base.length).split('/')[0]);
    }
  }
  return [...seen].sort();
}

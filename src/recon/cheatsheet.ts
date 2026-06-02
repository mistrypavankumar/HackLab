import type { CheatSection } from './types';

// Every example is runnable from the project root in a real terminal. The grep/
// find/rg ones also run in the in-page Practice Terminal; others (sed, awk, git,
// curl, jq, file) are real-shell only.
export const cheatsheet: CheatSection[] = [
  {
    tab: 'grep',
    title: 'grep — the essentials',
    items: [
      {
        cmd: 'grep -r PATTERN path/',
        desc: 'Recurse into every file under a directory.',
        example: 'grep -r "apiKey" practice-target',
      },
      {
        cmd: 'grep -n',
        desc: 'Show line numbers (great for jumping straight to the hit).',
        example: 'grep -n "eval" practice-target/auth.js',
      },
      {
        cmd: 'grep -i',
        desc: 'Case-insensitive match.',
        example: 'grep -ri "TODO" practice-target',
      },
      {
        cmd: 'grep -w',
        desc: 'Match whole words only (eval, not retrieval).',
        example: 'grep -rnw "eval" practice-target',
      },
      {
        cmd: 'grep -l  /  -L',
        desc: 'List only filenames WITH / WITHOUT a match.',
        example: 'grep -rl "secret" practice-target',
      },
      {
        cmd: 'grep -c',
        desc: 'Count matching lines per file.',
        example: 'grep -rc "import" practice-target',
      },
      {
        cmd: 'grep -v',
        desc: 'Invert: show lines that do NOT match.',
        example: 'grep -v "publicAppName" practice-target/config.js',
      },
      {
        cmd: 'grep -o',
        desc: 'Print only the matched text, not the whole line.',
        example: 'grep -roE "sk_[a-z]+_[A-Za-z0-9]+" practice-target',
      },
      {
        cmd: 'grep -E',
        desc: 'Extended regex — enables + ? | ( ) without backslashes.',
        example: 'grep -rnE "eval|innerHTML" practice-target',
      },
      {
        cmd: 'grep -A3 / -B3 / -C3',
        desc: 'Show 3 lines After / Before / around (Context) a match.',
        example: 'grep -rn -C2 "awsAccessKeyId" practice-target',
      },
      {
        cmd: 'grep --include="*.ts"',
        desc: 'Only scan files matching this glob.',
        example: 'grep -rn "secret" --include="*.js" practice-target',
      },
      {
        cmd: 'grep --exclude-dir=node_modules',
        desc: 'Skip noisy directories.',
        example: 'grep -rn "apiKey" --exclude-dir=node_modules .',
      },
    ],
  },
  {
    tab: 'find',
    title: 'find — locate files',
    items: [
      {
        cmd: 'find . -name "*.env"',
        desc: 'By name (glob, case-sensitive).',
        example: 'find practice-target -name ".env*"',
      },
      {
        cmd: 'find . -iname "*.JS"',
        desc: 'By name, case-insensitive.',
        example: 'find practice-target -iname "*.JSX"',
      },
      {
        cmd: 'find . -type f  /  -type d',
        desc: 'Restrict to files / directories.',
        example: 'find practice-target -type f',
      },
      {
        cmd: 'find . -path "*/dist/*"',
        desc: 'Match against the full path.',
        example: 'find practice-target -path "*/ui/*"',
      },
      {
        cmd: 'find . -size +1M',
        desc: 'Files larger than 1 MB (use c=bytes, k=KB, M=MB).',
        example: 'find practice-target -size +200c',
      },
      {
        cmd: 'find . -mtime -7',
        desc: 'Modified within the last 7 days.',
        example: 'find practice-target -mtime -1',
      },
      {
        cmd: 'find . -name "*.js" -exec grep -l "secret" {} +',
        desc: 'Pipe find results into grep.',
        example: 'find practice-target -name "*.js" -exec grep -l "secret" {} +',
      },
    ],
  },
  {
    tab: 'ripgrep',
    title: 'ripgrep (rg) — faster, .gitignore-aware',
    items: [
      {
        cmd: 'rg PATTERN',
        desc: 'Recursive + line numbers by default; auto-skips ignored files.',
        example: 'rg "apiKey" practice-target',
      },
      {
        cmd: 'rg -i',
        desc: 'Case-insensitive.',
        example: 'rg -i "todo" practice-target',
      },
      {
        cmd: 'rg -tjs  /  -Tjs',
        desc: 'Only / exclude a file type (js, ts, py, ...).',
        example: 'rg -tjs "secret" practice-target',
      },
      {
        cmd: 'rg -g "*.ts"',
        desc: 'Filter by glob.',
        example: 'rg -g "*.jsx" "innerHTML" practice-target',
      },
      {
        cmd: 'rg -l  /  -c',
        desc: 'Files with matches / per-file counts.',
        example: 'rg -l "secret" practice-target',
      },
      {
        cmd: 'rg --hidden -uu',
        desc: 'Also search hidden + ignored files (e.g. dotfiles like .env*).',
        example: 'rg --hidden "API_SECRET" practice-target',
      },
      {
        cmd: 'rg -A3 -B3',
        desc: 'Context lines, same idea as grep.',
        example: 'rg -C2 "awsAccessKeyId" practice-target',
      },
    ],
  },
  {
    tab: 'regex',
    title: 'regex quick-reference',
    items: [
      {
        cmd: '.  *  +  ?',
        desc: 'Any char · 0+ · 1+ · optional ( + ? need -E ).',
        example: 'grep -rnoE "sk_.+" practice-target',
      },
      {
        cmd: '[abc] [^abc] [0-9]',
        desc: 'Char class · negated class · range.',
        example: 'grep -rnoE "[0-9]{1,3}\\.[0-9]" practice-target',
      },
      {
        cmd: '{3}  {1,3}',
        desc: 'Exactly 3 · between 1 and 3 (needs -E).',
        example: 'grep -rnE "AKIA[0-9A-Z]{16}" practice-target',
      },
      {
        cmd: '^  $',
        desc: 'Start / end of line.',
        example: 'grep -nE "^API" practice-target/.env.example',
      },
      {
        cmd: '\\.  \\b  |',
        desc: 'Literal dot · word boundary · alternation (| needs -E).',
        example: 'grep -rnoE "ops@example\\.com" practice-target',
      },
      {
        cmd: 'grep  vs  -E  vs  -P',
        desc: 'Basic regex · extended (ERE) · Perl (PCRE, GNU grep only — not macOS BSD grep).',
        example: 'grep -rnoE "eyJ[A-Za-z0-9_-]+" practice-target',
      },
    ],
  },
  {
    tab: 'sed / awk',
    title: 'sed & awk — extract & transform',
    items: [
      {
        cmd: "sed -n '3p' FILE",
        desc: 'Print a specific line (here, line 3).',
        example: "sed -n '3p' practice-target/config.js",
      },
      {
        cmd: "sed -n '2,4p' FILE",
        desc: 'Print a line range.',
        example: "sed -n '2,4p' practice-target/auth.js",
      },
      {
        cmd: "sed 's/old/new/g' FILE",
        desc: 'Substitute text (great for redacting secrets in output).',
        example: "sed 's/sk_live/REDACTED/g' practice-target/config.js",
      },
      {
        cmd: "awk -F= '{print $1}' FILE",
        desc: 'Split on a delimiter and print a field (here, env var names).',
        example: "awk -F= '{print $1}' practice-target/.env.example",
      },
      {
        cmd: "awk '/PATTERN/' FILE",
        desc: 'Print lines matching a pattern (awk as a mini-grep).',
        example: "awk '/secret/' practice-target/db.js",
      },
      {
        cmd: "awk 'NR==3' FILE",
        desc: 'Address a line by number (NR = record number).',
        example: "awk 'NR==3' practice-target/auth.js",
      },
    ],
  },
  {
    tab: 'pipes',
    title: 'pipes & data wrangling',
    items: [
      {
        cmd: 'cmd | sort | uniq -c',
        desc: 'Tally duplicates — count how often each value appears.',
        example: 'grep -rhoE "sk_[a-z]+" practice-target | sort | uniq -c',
      },
      {
        cmd: 'wc -l FILE',
        desc: 'Count lines (add -c for bytes, -w for words).',
        example: 'wc -l practice-target/notes.md',
      },
      {
        cmd: 'cut -d= -f2',
        desc: 'Cut a delimited column out of each line.',
        example: 'grep API_SECRET practice-target/.env.example | cut -d= -f2',
      },
      {
        cmd: 'head -n 5  /  tail -n 5',
        desc: 'First / last N lines of a stream.',
        example: 'head -n 3 practice-target/config.js',
      },
      {
        cmd: "tr ',' '\\n'",
        desc: 'Translate/replace characters (here, commas → newlines).',
        example: "echo a,b,c | tr ',' '\\n'",
      },
      {
        cmd: 'grep -rl X . | xargs wc -l',
        desc: 'Feed a file list into another command.',
        example: 'grep -rl "secret" practice-target | xargs wc -l',
      },
    ],
  },
  {
    tab: 'git recon',
    title: 'git recon — search history & tracked code',
    items: [
      {
        cmd: 'git grep -n "PATTERN"',
        desc: 'grep across all tracked files (fast, ignores build artifacts).',
        example: 'git grep -n "apiKey"',
      },
      {
        cmd: 'git log -S"STRING" --oneline',
        desc: 'Pickaxe: find commits that ADDED or REMOVED a string — when a secret entered history.',
        example: 'git log -S"API_SECRET" --oneline',
      },
      {
        cmd: 'git log -p -- PATH',
        desc: 'Full change history (with diffs) of a file.',
        example: 'git log -p -- practice-target/config.js',
      },
      {
        cmd: 'git log --all --oneline -- "*.env"',
        desc: 'Hunt for env files ever committed on any branch.',
        example: 'git log --all --oneline -- "*.env*"',
      },
      {
        cmd: 'git show COMMIT:PATH',
        desc: 'Read a file as it existed at a specific commit.',
        example: 'git show HEAD:practice-target/config.js',
      },
      {
        cmd: 'git diff',
        desc: 'Review staged/unstaged changes for leaked secrets before committing.',
        example: 'git diff --staged',
      },
    ],
  },
  {
    tab: 'curl',
    title: 'curl — HTTP recon',
    items: [
      {
        cmd: 'curl -sI URL',
        desc: 'Fetch response headers only (inspect security headers).',
        example: 'curl -sI http://localhost:3000/recon',
      },
      {
        cmd: 'curl -s URL',
        desc: 'Fetch the body silently (no progress meter).',
        example: 'curl -s "http://localhost:3000/api/labs/exposed-secrets/config?mode=vulnerable"',
      },
      {
        cmd: 'curl -X POST -d \'{...}\' -H "content-type: application/json" URL',
        desc: 'Send a request with a method, body, and headers.',
        example: `curl -s -X POST "http://localhost:3000/api/labs/brute-force/login?mode=vulnerable" -H "content-type: application/json" -d '{"username":"admin","password":"guess"}'`,
      },
      {
        cmd: 'curl -L URL',
        desc: 'Follow redirects.',
        example: 'curl -sL http://localhost:3000',
      },
      {
        cmd: 'curl -D - -o /dev/null URL',
        desc: 'Dump headers to stdout, discard the body.',
        example:
          'curl -s -D - -o /dev/null "http://localhost:3000/api/labs/security-headers/page?mode=secure"',
      },
    ],
  },
  {
    tab: 'jq',
    title: 'jq — parse JSON responses',
    items: [
      {
        cmd: '... | jq',
        desc: 'Pretty-print and colorize JSON.',
        example:
          'curl -s "http://localhost:3000/api/labs/exposed-secrets/config?mode=vulnerable" | jq',
      },
      {
        cmd: "jq '.key'",
        desc: 'Extract a single field.',
        example:
          'curl -s "http://localhost:3000/api/labs/exposed-secrets/config?mode=vulnerable" | jq \'.JWT_SECRET\'',
      },
      {
        cmd: "jq 'keys'",
        desc: 'List the keys of an object — quickly spot what leaked.',
        example:
          'curl -s "http://localhost:3000/api/labs/exposed-secrets/config?mode=vulnerable" | jq \'keys\'',
      },
      {
        cmd: "jq -r '.field'",
        desc: 'Raw output (no quotes) — handy for piping further.',
        example: "echo '{\"token\":\"abc\"}' | jq -r '.token'",
      },
    ],
  },
  {
    tab: 'file / encoding',
    title: 'file inspection & encoding',
    items: [
      {
        cmd: 'file PATH',
        desc: 'Identify a file’s type by content, not extension.',
        example: 'file practice-target/config.js',
      },
      {
        cmd: 'strings BINARY',
        desc: 'Pull printable strings out of a binary (hunt embedded secrets).',
        example: 'strings /bin/ls | head',
      },
      {
        cmd: 'xxd FILE | head',
        desc: 'Hex + ASCII dump — inspect raw bytes.',
        example: 'xxd practice-target/.env.example | head',
      },
      {
        cmd: 'stat FILE',
        desc: 'Size, permissions, and timestamps.',
        example: 'stat practice-target/config.js',
      },
      {
        cmd: 'base64 -d',
        desc: 'Decode base64 — e.g. read a JWT payload segment.',
        example: 'echo eyJyb2xlIjoiYWRtaW4ifQ | base64 -d',
      },
      {
        cmd: 'shasum -a 256 FILE',
        desc: 'Hash a file (integrity / comparison).',
        example: 'shasum -a 256 practice-target/config.js',
      },
    ],
  },
  {
    tab: 'security',
    title: 'security one-liners (run from a repo root)',
    items: [
      {
        cmd: 'grep -rniE "(api[_-]?key|secret|token|password|bearer)" --exclude-dir=node_modules .',
        desc: 'Hunt hardcoded credentials.',
        example: 'grep -rniE "(api[_-]?key|secret|password|token)" practice-target',
      },
      {
        cmd: 'grep -rnE "AKIA[0-9A-Z]{16}" .',
        desc: 'AWS access key IDs.',
        example: 'grep -rnE "AKIA[0-9A-Z]{16}" practice-target',
      },
      {
        cmd: 'grep -rn "BEGIN .*PRIVATE KEY" .',
        desc: 'Committed private keys (none planted here — expect no output).',
        example: 'grep -rn "BEGIN .*PRIVATE KEY" practice-target',
      },
      {
        cmd: 'grep -rnE "dangerouslySetInnerHTML|innerHTML|document\\.write" .',
        desc: 'Potential XSS sinks.',
        example: 'grep -rnE "dangerouslySetInnerHTML|innerHTML" practice-target',
      },
      {
        cmd: 'grep -rnwE "eval|Function" .',
        desc: 'Dynamic code execution.',
        example: 'grep -rnwE "eval|Function" practice-target',
      },
      {
        cmd: 'grep -rniE "todo|fixme|hack|xxx" .',
        desc: 'Unfinished / risky code markers.',
        example: 'grep -rniE "todo|fixme" practice-target',
      },
      {
        cmd: 'find . -name ".env*" -not -name "*.example"',
        desc: 'Real .env files that may have been committed.',
        example: 'find practice-target -name ".env*"',
      },
      {
        cmd: 'grep -rnoE "eyJ[A-Za-z0-9_-]+\\.[A-Za-z0-9_-]+\\.[A-Za-z0-9_-]*" .',
        desc: 'JWTs left in source.',
        example: 'grep -rnoE "eyJ[A-Za-z0-9_-]+\\.[A-Za-z0-9_-]+\\.[A-Za-z0-9_-]*" practice-target',
      },
    ],
  },
];

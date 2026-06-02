import type { Challenge } from './types';

// All commands are designed to run from the project root against the planted
// `practice-target/` codebase. Run them in your real terminal.
export const challenges: Challenge[] = [
  {
    id: 1,
    difficulty: 'basic',
    goal: 'Find every line that mentions a secret, key, password, or token — regardless of case.',
    hint: '-r recurses, -n adds line numbers, -i ignores case, and -E lets you use | for "this OR that".',
    command: 'grep -rniE "(api[_-]?key|secret|password|token|passwd)" practice-target',
    finding:
      'Hits across config.js (apiKey, dbPassword, awsSecretAccessKey, jwtSecret), .env.example (API_SECRET), notes.md (API_SECRET + admin token), and server/handler.js (logs the apiKey).',
  },
  {
    id: 2,
    difficulty: 'basic',
    goal: 'List only the FILES that contain the word "secret" — not every matching line.',
    hint: '-l switches grep from printing lines to printing filenames.',
    command: 'grep -rliE "secret" practice-target',
    finding: 'config.js, .env.example, and notes.md (the files where the word appears).',
  },
  {
    id: 3,
    difficulty: 'basic',
    goal: 'Find the AWS access key ID using its known shape: AKIA followed by 16 uppercase/digit chars.',
    hint: 'Use -E with a character class [0-9A-Z] and a length quantifier {16}.',
    command: 'grep -rnE "AKIA[0-9A-Z]{16}" practice-target',
    finding: "config.js → awsAccessKeyId: 'AKIAIOSFODNN7EXAMPLE'.",
  },
  {
    id: 4,
    difficulty: 'basic',
    goal: 'Find risky XSS sinks where code writes raw HTML.',
    hint: 'Search for dangerouslySetInnerHTML and innerHTML together using | alternation.',
    command: 'grep -rnE "dangerouslySetInnerHTML|innerHTML" practice-target',
    finding: 'ui/Comment.jsx → both the dangerouslySetInnerHTML JSX and the el.innerHTML assignment.',
  },
  {
    id: 5,
    difficulty: 'basic',
    goal: 'Find calls to eval() — but not words like "retrieval" or "evaluate".',
    hint: '-w forces a whole-word match.',
    command: 'grep -rnw "eval" practice-target',
    finding: 'auth.js → return eval(expr).',
  },
  {
    id: 6,
    difficulty: 'basic',
    goal: 'Find all .jsx files and any .env files inside the target.',
    hint: 'find with -type f and two -name globs combined with -o (OR), grouped in \\( \\).',
    command: 'find practice-target -type f \\( -name "*.jsx" -o -name ".env*" \\)',
    finding: 'practice-target/ui/Comment.jsx and practice-target/.env.example.',
  },
  {
    id: 7,
    difficulty: 'intermediate',
    goal: 'Find SQL queries built by concatenating a variable onto a string (injection risk).',
    hint: 'Look for a closing quote, optional spaces, a +, then a variable name. Quote chars must go in a class like [\'"].',
    command: 'grep -rnE "[\'\\"] *\\+ *[a-zA-Z_]" practice-target',
    finding: 'db.js → both findUser and searchInvoices concatenate user input straight into SQL.',
  },
  {
    id: 8,
    difficulty: 'intermediate',
    goal: 'Count how many TODO/FIXME markers each file has.',
    hint: '-c prints file:count for every file; combine -r, -i and -E.',
    command: 'grep -rciE "todo|fixme" practice-target',
    finding: 'auth.js → 2 and notes.md → 2; everything else reports 0.',
  },
  {
    id: 9,
    difficulty: 'intermediate',
    goal: 'Show 2 lines of context around each "password" match to understand how it is used.',
    hint: '-C N prints N lines before AND after; -A is after-only, -B before-only.',
    command: 'grep -rn -C2 -i "password" practice-target',
    finding: 'config.js dbPassword, with the surrounding config object for context.',
  },
  {
    id: 10,
    difficulty: 'intermediate',
    goal: 'Search ONLY .js files for "secret" (skip .jsx, .md, .env).',
    hint: '--include="*.js" restricts which files grep opens — essential in large repos.',
    command: 'grep -rniE "secret" --include="*.js" practice-target',
    finding:
      'config.js (awsSecretAccessKey, jwtSecret) and a comment in server/handler.js. The .env.example and notes.md matches are excluded because they are not .js files.',
  },
  {
    id: 11,
    difficulty: 'intermediate',
    goal: 'Extract just the Slack webhook URL — not the whole line it sits on.',
    hint: '-o prints only the matched substring; build a URL regex with -E and escape the dots.',
    command: 'grep -rnoE "https://hooks\\.slack\\.com/services/[A-Za-z0-9/]+" practice-target',
    finding: 'notes.md → https://hooks.slack.com/services/T000/B000/XXXXXXXX.',
  },
  {
    id: 12,
    difficulty: 'intermediate',
    goal: 'Pull out every email address and IPv4 address left in the code.',
    hint: 'Two patterns. Email: user@host. IPv4: four 1–3 digit groups split by literal dots.',
    command:
      'grep -rnoE "[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+" practice-target ; grep -rnoE "([0-9]{1,3}\\.){3}[0-9]{1,3}" practice-target',
    finding:
      'Emails: ops@example.com (.env.example + notes.md). IP: 10.0.4.17 (notes.md). Tighten the IP regex if version numbers sneak in.',
  },
  {
    id: 13,
    difficulty: 'intermediate',
    goal: 'Repeat the secret hunt with ripgrep (rg), limited to JavaScript files.',
    hint: 'rg adds -n by default; -i for case, -tjs to restrict to JS. Install with `brew install ripgrep`.',
    command: 'rg -i -tjs "secret|api[_-]?key|password" practice-target',
    finding:
      'Same secrets in the .js files, but faster — and on a real repo rg auto-skips node_modules and .gitignore’d paths.',
  },
];

import {
  FILES,
  DIRS,
  basename,
  childEntries,
  childrenOf,
  fileExists,
  filesUnder,
  getFile,
  isDir,
} from './vfs';

/** One rendered output line. prefix is never highlighted; body is highlighted
 *  wherever it matches matchRe. */
export interface OutLine {
  prefix: string;
  body: string;
  matchRe?: RegExp;
  tone?: 'error';
}

export interface RunResult {
  output: string; // plain text (prefix + body joined) — used by tests
  lines: OutLine[];
  clear?: boolean;
}

interface ResolvedFile {
  path: string;
  display: string;
  content: string;
}

// ── tokenizer ──────────────────────────────────────────────────────────────
function tokenize(input: string): string[] {
  const tokens: string[] = [];
  let cur = '';
  let has = false;
  let quote: '"' | "'" | null = null;

  for (let i = 0; i < input.length; i++) {
    const ch = input[i];
    if (quote) {
      if (ch === quote) quote = null;
      else {
        cur += ch;
        has = true;
      }
      continue;
    }
    if (ch === '"' || ch === "'") {
      quote = ch;
      has = true;
      continue;
    }
    if (ch === '\\') {
      i++;
      if (i < input.length) {
        cur += input[i];
        has = true;
      }
      continue;
    }
    if (ch === ' ' || ch === '\t') {
      if (has) tokens.push(cur);
      cur = '';
      has = false;
      continue;
    }
    cur += ch;
    has = true;
  }
  if (has) tokens.push(cur);
  return tokens;
}

function splitCommands(input: string): string[] {
  const out: string[] = [];
  let cur = '';
  let quote: '"' | "'" | null = null;
  for (let i = 0; i < input.length; i++) {
    const ch = input[i];
    if (quote) {
      cur += ch;
      if (ch === quote) quote = null;
      continue;
    }
    if (ch === '"' || ch === "'") {
      quote = ch;
      cur += ch;
      continue;
    }
    if (ch === '\\') {
      cur += ch + (input[i + 1] ?? '');
      i++;
      continue;
    }
    if (ch === ';') {
      out.push(cur);
      cur = '';
      continue;
    }
    cur += ch;
  }
  if (cur.trim()) out.push(cur);
  return out.length ? out : [''];
}

// ── regex ────────────────────────────────────────────────────────────────--
interface RegexOpts {
  extended: boolean;
  ignoreCase: boolean;
  wholeWord: boolean;
}

function buildPattern(pattern: string, opts: RegexOpts): string {
  let p = pattern;
  if (!opts.extended) p = p.replace(/[+?|(){}]/g, '\\$&');
  if (opts.wholeWord) p = `(?<![A-Za-z0-9_])(?:${p})(?![A-Za-z0-9_])`;
  return p;
}

function makeRegex(pattern: string, opts: RegexOpts, global: boolean): RegExp {
  const flags = (opts.ignoreCase ? 'i' : '') + (global ? 'g' : '');
  return new RegExp(buildPattern(pattern, opts), flags);
}

// ── glob ──────────────────────────────────────────────────────────────────-
function globToRegex(glob: string): RegExp {
  let re = '';
  for (const ch of glob) {
    if (ch === '*') re += '.*';
    else if (ch === '?') re += '.';
    else re += ch.replace(/[.+^${}()|[\]\\]/g, '\\$&');
  }
  return new RegExp(`^${re}$`);
}

function byteLength(s: string): number {
  return new TextEncoder().encode(s).length;
}

// ── shared search (grep + rg) ───────────────────────────────────────────────
interface SearchOpts extends RegexOpts {
  lineNumber: boolean;
  filesWithMatches: boolean;
  filesWithout: boolean;
  count: boolean;
  invert: boolean;
  onlyMatching: boolean;
  before: number;
  after: number;
  showName: boolean;
}

function searchFiles(pattern: string, files: ResolvedFile[], opts: SearchOpts): OutLine[] {
  const test = makeRegex(pattern, opts, false);
  const hl = makeRegex(pattern, opts, true);
  const out: OutLine[] = [];

  for (const f of files) {
    const lines = f.content.split('\n');
    const matched = lines.map((l) => test.test(l) !== opts.invert);

    if (opts.filesWithMatches) {
      if (matched.some(Boolean)) out.push({ prefix: '', body: f.display });
      continue;
    }
    if (opts.filesWithout) {
      if (!matched.some(Boolean)) out.push({ prefix: '', body: f.display });
      continue;
    }
    if (opts.count) {
      const n = matched.filter(Boolean).length;
      out.push({ prefix: '', body: opts.showName ? `${f.display}:${n}` : `${n}` });
      continue;
    }

    const namePrefix = opts.showName ? `${f.display}:` : '';

    if (opts.onlyMatching) {
      const g = makeRegex(pattern, opts, true);
      lines.forEach((line, idx) => {
        if (!matched[idx]) return;
        g.lastIndex = 0;
        let m: RegExpExecArray | null;
        while ((m = g.exec(line)) !== null) {
          const ln = opts.lineNumber ? `${idx + 1}:` : '';
          out.push({ prefix: `${namePrefix}${ln}`, body: m[0], matchRe: hl });
          if (m.index === g.lastIndex) g.lastIndex++;
        }
      });
      continue;
    }

    if (opts.before > 0 || opts.after > 0) {
      const show = new Set<number>();
      lines.forEach((_, idx) => {
        if (!matched[idx]) return;
        for (let j = idx - opts.before; j <= idx + opts.after; j++) {
          if (j >= 0 && j < lines.length) show.add(j);
        }
      });
      const ordered = [...show].sort((a, b) => a - b);
      let prev = -2;
      for (const idx of ordered) {
        if (idx !== prev + 1 && prev !== -2) out.push({ prefix: '--', body: '' });
        const sep = matched[idx] ? ':' : '-';
        const nameSep = opts.showName ? `${f.display}${sep}` : '';
        const ln = opts.lineNumber ? `${idx + 1}${sep}` : '';
        out.push({
          prefix: `${nameSep}${ln}`,
          body: lines[idx],
          matchRe: matched[idx] ? hl : undefined,
        });
        prev = idx;
      }
      continue;
    }

    lines.forEach((line, idx) => {
      if (!matched[idx]) return;
      const ln = opts.lineNumber ? `${idx + 1}:` : '';
      out.push({ prefix: `${namePrefix}${ln}`, body: line, matchRe: hl });
    });
  }
  return out;
}

// ── resolve ──────────────────────────────────────────────────────────────---
function resolveCommon(
  paths: string[],
  recursive: boolean,
  include: RegExp | null,
  excludeDir: string | null,
  fileFilter: (f: { path: string }) => boolean,
  cmd: string,
): { files: ResolvedFile[]; errors: OutLine[] } {
  const files: ResolvedFile[] = [];
  const errors: OutLine[] = [];
  const targets = paths.length ? paths : ['.'];

  for (const arg of targets) {
    if (fileExists(arg)) {
      files.push({ path: arg, display: arg, content: getFile(arg)!.content });
    } else if (isDir(arg)) {
      if (!recursive) {
        errors.push({ prefix: '', body: `${cmd}: ${arg}: Is a directory`, tone: 'error' });
        continue;
      }
      for (const f of filesUnder(arg)) {
        if (excludeDir && f.path.split('/').includes(excludeDir)) continue;
        if (include && !include.test(basename(f.path))) continue;
        if (!fileFilter(f)) continue;
        const display = arg === '.' ? `./${f.path}` : f.path;
        files.push({ path: f.path, display, content: f.content });
      }
    } else {
      errors.push({ prefix: '', body: `${cmd}: ${arg}: No such file or directory`, tone: 'error' });
    }
  }
  return { files, errors };
}

function parseContext(tokens: string[], i: number): { value: number; next: number } {
  const tok = tokens[i];
  const m = tok.match(/^-[ABC](\d+)$/);
  if (m) return { value: Number(m[1]), next: i + 1 };
  const n = Number(tokens[i + 1]);
  return { value: Number.isNaN(n) ? 0 : n, next: i + 2 };
}

// ── grep ────────────────────────────────────────────────────────────────────
function runGrep(tokens: string[]): OutLine[] {
  const opts: SearchOpts = {
    extended: false,
    ignoreCase: false,
    wholeWord: false,
    lineNumber: false,
    filesWithMatches: false,
    filesWithout: false,
    count: false,
    invert: false,
    onlyMatching: false,
    before: 0,
    after: 0,
    showName: false,
  };
  let recursive = false;
  let include: RegExp | null = null;
  let excludeDir: string | null = null;
  const operands: string[] = [];

  let i = 1;
  let optsDone = false;
  while (i < tokens.length) {
    const tok = tokens[i];
    if (!optsDone && tok === '--') {
      optsDone = true;
      i++;
      continue;
    }
    if (!optsDone && tok.startsWith('--include=')) {
      include = globToRegex(tok.slice('--include='.length));
      i++;
      continue;
    }
    if (!optsDone && tok.startsWith('--exclude-dir=')) {
      excludeDir = tok.slice('--exclude-dir='.length);
      i++;
      continue;
    }
    if (!optsDone && tok.startsWith('--color')) {
      i++;
      continue;
    }
    if (!optsDone && /^-[ABC]/.test(tok)) {
      const { value, next } = parseContext(tokens, i);
      if (tok[1] === 'A') opts.after = value;
      else if (tok[1] === 'B') opts.before = value;
      else {
        opts.before = value;
        opts.after = value;
      }
      i = next;
      continue;
    }
    if (!optsDone && tok.startsWith('-') && tok.length > 1) {
      for (const ch of tok.slice(1)) {
        if (ch === 'r' || ch === 'R') recursive = true;
        else if (ch === 'n') opts.lineNumber = true;
        else if (ch === 'i') opts.ignoreCase = true;
        else if (ch === 'w') opts.wholeWord = true;
        else if (ch === 'E') opts.extended = true;
        else if (ch === 'l') opts.filesWithMatches = true;
        else if (ch === 'L') opts.filesWithout = true;
        else if (ch === 'c') opts.count = true;
        else if (ch === 'v') opts.invert = true;
        else if (ch === 'o') opts.onlyMatching = true;
      }
      i++;
      continue;
    }
    operands.push(tok);
    i++;
  }

  if (operands.length === 0)
    return [{ prefix: '', body: 'usage: grep [OPTIONS] PATTERN [FILE...]', tone: 'error' }];
  const pattern = operands[0];
  const paths = operands.slice(1);

  const { files, errors } = resolveCommon(paths, recursive, include, excludeDir, () => true, 'grep');
  opts.showName = recursive || files.length > 1;

  try {
    return [...errors, ...searchFiles(pattern, files, opts)];
  } catch {
    return [{ prefix: '', body: `grep: invalid pattern: ${pattern}`, tone: 'error' }];
  }
}

// ── ripgrep ──────────────────────────────────────────────────────────────---
const RG_TYPES: Record<string, string[]> = {
  js: ['js', 'jsx', 'mjs', 'cjs'],
  ts: ['ts', 'tsx'],
  md: ['md', 'markdown'],
  json: ['json'],
  py: ['py'],
};

function ext(path: string): string {
  const b = basename(path);
  const dot = b.lastIndexOf('.');
  return dot >= 0 ? b.slice(dot + 1) : '';
}

function runRg(tokens: string[]): OutLine[] {
  const opts: SearchOpts = {
    extended: true,
    ignoreCase: false,
    wholeWord: false,
    lineNumber: true,
    filesWithMatches: false,
    filesWithout: false,
    count: false,
    invert: false,
    onlyMatching: false,
    before: 0,
    after: 0,
    showName: false,
  };
  let includeTypes: string[] | null = null;
  let excludeTypes: string[] = [];
  let glob: RegExp | null = null;
  let hidden = false;
  const operands: string[] = [];

  let i = 1;
  while (i < tokens.length) {
    const tok = tokens[i];
    if (tok === '--hidden' || tok === '-uu' || tok === '-u') {
      hidden = true;
      i++;
      continue;
    }
    if (tok === '-g') {
      glob = globToRegex(tokens[i + 1] ?? '*');
      i += 2;
      continue;
    }
    if (/^-[ABC]/.test(tok)) {
      const { value, next } = parseContext(tokens, i);
      if (tok[1] === 'A') opts.after = value;
      else if (tok[1] === 'B') opts.before = value;
      else {
        opts.before = value;
        opts.after = value;
      }
      i = next;
      continue;
    }
    const tMatch = tok.match(/^-t(\w+)$/);
    const tBig = tok.match(/^-T(\w+)$/);
    if (tMatch) {
      includeTypes = (includeTypes ?? ([] as string[])).concat(RG_TYPES[tMatch[1]] ?? [tMatch[1]]);
      i++;
      continue;
    }
    if (tBig) {
      excludeTypes = excludeTypes.concat(RG_TYPES[tBig[1]] ?? [tBig[1]]);
      i++;
      continue;
    }
    if (tok.startsWith('-') && tok.length > 1) {
      for (const ch of tok.slice(1)) {
        if (ch === 'i') opts.ignoreCase = true;
        else if (ch === 'w') opts.wholeWord = true;
        else if (ch === 'l') {
          opts.filesWithMatches = true;
          opts.lineNumber = false;
        } else if (ch === 'c') {
          opts.count = true;
          opts.lineNumber = false;
        } else if (ch === 'o') {
          opts.onlyMatching = true;
          opts.lineNumber = false;
        } else if (ch === 'v') opts.invert = true;
        else if (ch === 'n') opts.lineNumber = true;
        else if (ch === 's') opts.ignoreCase = false;
      }
      i++;
      continue;
    }
    operands.push(tok);
    i++;
  }

  if (operands.length === 0)
    return [{ prefix: '', body: 'usage: rg [OPTIONS] PATTERN [PATH...]', tone: 'error' }];
  const pattern = operands[0];
  const paths = operands.slice(1);

  const fileFilter = (f: { path: string }): boolean => {
    const segs = f.path.split('/');
    if (!hidden && segs.some((s) => s.startsWith('.'))) return false;
    const e = ext(f.path);
    if (includeTypes && !includeTypes.includes(e)) return false;
    if (excludeTypes.includes(e)) return false;
    if (glob && !glob.test(f.path)) return false;
    return true;
  };

  const { files, errors } = resolveCommon(paths, true, null, null, fileFilter, 'rg');
  opts.showName = true;
  try {
    return [...errors, ...searchFiles(pattern, files, opts)];
  } catch {
    return [{ prefix: '', body: `rg: invalid pattern: ${pattern}`, tone: 'error' }];
  }
}

// ── find ─────────────────────────────────────────────────────────────────---
interface FindNode {
  path: string;
  type: 'f' | 'd';
  size: number;
}

function allNodes(): FindNode[] {
  const nodes: FindNode[] = DIRS.map((d) => ({ path: d, type: 'd' as const, size: 96 }));
  for (const f of FILES) nodes.push({ path: f.path, type: 'f', size: byteLength(f.content) });
  return nodes;
}

function nodesUnder(arg: string): FindNode[] {
  const all = allNodes();
  if (arg === '.') return all;
  return all.filter((n) => n.path === arg || n.path.startsWith(arg + '/'));
}

type Pred = (n: FindNode) => boolean;

function parseFindExpr(tokens: string[]): { pred: Pred; exec: string[] | null } {
  let exec: string[] | null = null;
  const execIdx = tokens.indexOf('-exec');
  let exprTokens = tokens;
  if (execIdx >= 0) {
    const after = tokens.slice(execIdx + 1);
    const term = after.findIndex((t) => t === '+' || t === ';');
    exec = term >= 0 ? after.slice(0, term) : after;
    exprTokens = tokens.slice(0, execIdx);
  }

  let pos = 0;
  const peek = () => exprTokens[pos];

  function predicate(): Pred {
    const tok = exprTokens[pos++];
    const arg = exprTokens[pos];
    switch (tok) {
      case '-name':
        pos++;
        return (n) => globToRegex(arg).test(basename(n.path));
      case '-iname': {
        pos++;
        const re = new RegExp(globToRegex(arg).source, 'i');
        return (n) => re.test(basename(n.path));
      }
      case '-type':
        pos++;
        return (n) => n.type === arg;
      case '-path':
        pos++;
        return (n) => globToRegex(arg).test(n.path);
      case '-size': {
        pos++;
        const m = arg.match(/^([+-]?)(\d+)([ckMG]?)$/);
        if (!m) return () => true;
        const sign = m[1];
        const unit = m[3] === 'k' ? 1024 : m[3] === 'M' ? 1024 * 1024 : 1;
        const threshold = Number(m[2]) * unit;
        return (n) =>
          sign === '+' ? n.size > threshold : sign === '-' ? n.size < threshold : n.size === threshold;
      }
      case '-mtime':
        pos++;
        return () => arg.startsWith('-');
      default:
        return () => true;
    }
  }

  function factor(): Pred {
    if (peek() === '(') {
      pos++;
      const inner = orExpr();
      if (peek() === ')') pos++;
      return inner;
    }
    if (peek() === '!' || peek() === '-not') {
      pos++;
      const inner = factor();
      return (n) => !inner(n);
    }
    return predicate();
  }

  function andExpr(): Pred {
    let left = factor();
    while (pos < exprTokens.length && peek() !== '-o' && peek() !== ')') {
      if (peek() === '-a' || peek() === '-and') pos++;
      if (peek() === '-o' || peek() === ')' || pos >= exprTokens.length) break;
      const right = factor();
      const l = left;
      left = (n) => l(n) && right(n);
    }
    return left;
  }

  function orExpr(): Pred {
    let left = andExpr();
    while (peek() === '-o' || peek() === '-or') {
      pos++;
      const right = andExpr();
      const l = left;
      left = (n) => l(n) || right(n);
    }
    return left;
  }

  const pred = exprTokens.length ? orExpr() : () => true;
  return { pred, exec };
}

function runFind(tokens: string[]): OutLine[] {
  const args = tokens.slice(1);
  const paths: string[] = [];
  let k = 0;
  while (k < args.length && !args[k].startsWith('-') && args[k] !== '(' && args[k] !== '!') {
    paths.push(args[k]);
    k++;
  }
  const exprTokens = args.slice(k);
  const targets = paths.length ? paths : ['.'];

  let pred: Pred;
  let exec: string[] | null;
  try {
    ({ pred, exec } = parseFindExpr(exprTokens));
  } catch {
    return [{ prefix: '', body: 'find: parse error in expression', tone: 'error' }];
  }

  const seen = new Set<string>();
  const matches: FindNode[] = [];
  const errors: OutLine[] = [];
  for (const arg of targets) {
    if (!isDir(arg) && !fileExists(arg)) {
      errors.push({ prefix: '', body: `find: ${arg}: No such file or directory`, tone: 'error' });
      continue;
    }
    for (const n of nodesUnder(arg)) {
      if (seen.has(n.path)) continue;
      if (pred(n)) {
        seen.add(n.path);
        matches.push(n);
      }
    }
  }
  matches.sort((a, b) => a.path.localeCompare(b.path));

  if (exec) {
    const fileArgs = matches.filter((n) => n.type === 'f').map((n) => n.path);
    const base = exec.filter((t) => t !== '{}');
    return dispatch([...base, ...fileArgs].join(' ')).lines;
  }

  return [...errors, ...matches.map((n) => ({ prefix: '', body: n.path }))];
}

// ── other commands ──────────────────────────────────────────────────────────
function runLs(tokens: string[]): OutLine[] {
  const arg = tokens[1] ?? '.';
  if (fileExists(arg)) return [{ prefix: '', body: arg }];
  if (!isDir(arg)) return [{ prefix: '', body: `ls: ${arg}: No such file or directory`, tone: 'error' }];
  const body = childrenOf(arg)
    .map((p) => (arg === '.' ? p : basename(p)))
    .join('  ');
  return [{ prefix: '', body }];
}

function runCat(tokens: string[]): OutLine[] {
  if (tokens.length < 2) return [{ prefix: '', body: 'usage: cat FILE', tone: 'error' }];
  return tokens.slice(1).map((p) =>
    fileExists(p)
      ? { prefix: '', body: getFile(p)!.content }
      : { prefix: '', body: `cat: ${p}: No such file or directory`, tone: 'error' as const },
  );
}

const HELP = `Simulated terminal — searches a virtual copy of practice-target/.
Supported: grep, find, rg (ripgrep), ls, cat, pwd, clear, help

Try:
  grep -rn "apiKey" practice-target
  grep -rniE "(api[_-]?key|secret|password|token)" practice-target
  grep -rnE "AKIA[0-9A-Z]{16}" practice-target
  find practice-target -type f -name "*.js"
  rg --hidden "API_SECRET" practice-target
  cat practice-target/auth.js`;

// ── dispatch ─────────────────────────────────────────────────────────────---
function dispatch(command: string): { lines: OutLine[]; clear?: boolean } {
  const trimmed = command.trim();
  if (!trimmed) return { lines: [] };
  const tokens = tokenize(trimmed);
  switch (tokens[0]) {
    case 'grep':
      return { lines: runGrep(tokens) };
    case 'rg':
      return { lines: runRg(tokens) };
    case 'find':
      return { lines: runFind(tokens) };
    case 'ls':
      return { lines: runLs(tokens) };
    case 'cat':
      return { lines: runCat(tokens) };
    case 'pwd':
      return { lines: [{ prefix: '', body: '/Users/you/hacklab' }] };
    case 'cd':
      return {
        lines: [
          {
            prefix: '',
            body: 'cd isn’t needed here — every command runs from the repo root. Just pass a path, e.g. `grep -rn "x" practice-target`.',
          },
        ],
      };
    case 'help':
      return { lines: [{ prefix: '', body: HELP }] };
    case 'clear':
      return { lines: [], clear: true };
    default:
      return { lines: [{ prefix: '', body: `command not found: ${tokens[0]} (try: help)`, tone: 'error' }] };
  }
}

function linesToText(lines: OutLine[]): string {
  return lines.map((l) => `${l.prefix}${l.body}`).join('\n');
}

// ── tab completion ──────────────────────────────────────────────────────────
const COMMANDS = ['grep', 'find', 'rg', 'ls', 'cat', 'pwd', 'clear', 'help', 'cd'];

const FLAGS: Record<string, string[]> = {
  grep: ['-r', '-n', '-i', '-w', '-E', '-l', '-L', '-c', '-v', '-o', '--include=', '--exclude-dir='],
  rg: ['-i', '-l', '-c', '-w', '-o', '-g', '--hidden', '-tjs', '-A', '-B', '-C'],
  find: ['-name', '-iname', '-type', '-path', '-size', '-mtime', '-exec'],
};

function longestCommonPrefix(items: string[]): string {
  if (items.length === 0) return '';
  let p = items[0];
  for (const s of items.slice(1)) {
    let i = 0;
    while (i < p.length && i < s.length && p[i] === s[i]) i++;
    p = p.slice(0, i);
  }
  return p;
}

function completePathToken(token: string): { values: string[]; labels: string[] } {
  const slash = token.lastIndexOf('/');
  const base = slash >= 0 ? token.slice(0, slash) : '';
  const frag = slash >= 0 ? token.slice(slash + 1) : token;
  const replacePrefix = slash >= 0 ? token.slice(0, slash + 1) : '';

  const entries = childEntries(base).filter((e) => e.name.startsWith(frag));
  const values = entries.map((e) => `${replacePrefix}${e.name}${e.isDir ? '/' : ''}`);
  const labels = entries.map((e) => `${e.name}${e.isDir ? '/' : ''}`);
  return { values, labels };
}

export interface Completion {
  input: string; // the new input line
  suggestions: string[]; // candidates to show when ambiguous
}

/** Tab-complete the last token of an input line. */
export function complete(input: string): Completion {
  const m = input.match(/^(.*\s)?(\S*)$/s);
  const prefix = m?.[1] ?? '';
  const last = m?.[2] ?? '';
  const isCommandPos = prefix.trim() === '';

  let values: string[];
  let labels: string[];
  let trailing = ' ';

  if (isCommandPos) {
    values = COMMANDS.filter((c) => c.startsWith(last));
    labels = values;
  } else if (last.startsWith('-')) {
    const cmd = tokenize(input)[0];
    values = (FLAGS[cmd] ?? []).filter((f) => f.startsWith(last));
    labels = values;
    if (values.some((v) => v.endsWith('='))) trailing = '';
  } else {
    const r = completePathToken(last);
    values = r.values;
    labels = r.labels;
  }

  if (values.length === 0) return { input, suggestions: [] };

  if (values.length === 1) {
    const v = values[0];
    const suffix = v.endsWith('/') || v.endsWith('=') ? '' : trailing;
    return { input: `${prefix}${v}${suffix}`, suggestions: [] };
  }

  const lcp = longestCommonPrefix(values);
  const newInput = lcp.length > last.length ? `${prefix}${lcp}` : input;
  // Only surface the candidate list when completion can't make progress.
  const suggestions = newInput === input ? labels : [];
  return { input: newInput, suggestions };
}

/** Run a full input line (may contain `;`-separated commands). */
export function runLine(input: string): RunResult {
  const parts = splitCommands(input);
  if (parts.some((p) => tokenize(p)[0] === 'clear')) {
    return { output: '', lines: [], clear: true };
  }
  const lines = parts.flatMap((p) => dispatch(p).lines);
  return { output: linesToText(lines), lines };
}

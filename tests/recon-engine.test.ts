import { describe, expect, it } from 'vitest';
import { runLine } from '@/recon/terminal/engine';

const sorted = (cmd: string): string[] =>
  runLine(cmd)
    .output.split('\n')
    .filter((l) => l !== '')
    .sort();

const raw = (cmd: string): string => runLine(cmd).output;

describe('recon terminal: grep', () => {
  it('AKIA regex finds the AWS key (single line, with -n)', () => {
    expect(raw('grep -rnE "AKIA[0-9A-Z]{16}" practice-target')).toBe(
      "practice-target/config.js:5:  awsAccessKeyId: 'AKIAIOSFODNN7EXAMPLE',",
    );
  });

  it('-w matches eval as a whole word', () => {
    expect(raw('grep -rnw "eval" practice-target')).toBe(
      'practice-target/auth.js:3:  return eval(expr); // TODO: replace eval with a safe expression parser',
    );
  });

  it('-i + --include scopes to .js files', () => {
    expect(sorted('grep -rniE "secret" --include="*.js" practice-target')).toEqual([
      "practice-target/config.js:6:  awsSecretAccessKey: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY',",
      "practice-target/config.js:7:  jwtSecret: 'hunter2',",
      'practice-target/server/handler.js:3:// Logs a secret — shows up in logs/CI output.',
    ]);
  });

  it('-l lists only filenames with a (case-sensitive) match', () => {
    expect(sorted('grep -rl "secret" practice-target')).toEqual([
      'practice-target/.env.example',
      'practice-target/server/handler.js',
    ]);
  });

  it('-c reports a count for every searched file', () => {
    const out = sorted('grep -rc "import" practice-target');
    expect(out).toContain('practice-target/server/handler.js:1');
    expect(out.filter((l) => l.endsWith(':0')).length).toBeGreaterThan(0);
    expect(out.length).toBe(7); // one line per file
  });

  it('-o prints only the matched substring', () => {
    expect(sorted('grep -rnoE "ops@example\\.com" practice-target')).toEqual([
      'practice-target/.env.example:5:ops@example.com',
      'practice-target/notes.md:7:ops@example.com',
    ]);
  });

  it('single-file search keeps order and omits the filename prefix', () => {
    expect(raw('grep -n "eval" practice-target/auth.js')).toBe(
      [
        '1:// Dangerous dynamic evaluation.',
        '3:  return eval(expr); // TODO: replace eval with a safe expression parser',
      ].join('\n'),
    );
  });

  it('-v inverts the match', () => {
    const out = raw('grep -v "publicAppName" practice-target/config.js');
    expect(out).not.toContain('publicAppName');
    expect(out).toContain('apiKey');
    expect(out.split('\n').length).toBe(8); // 9 lines minus the excluded one
  });

  it('errors on a directory without -r', () => {
    expect(raw('grep "x" practice-target')).toContain('Is a directory');
  });
});

describe('recon terminal: find', () => {
  it('-type f -name "*.js" lists the JS files', () => {
    expect(sorted('find practice-target -type f -name "*.js"')).toEqual([
      'practice-target/auth.js',
      'practice-target/config.js',
      'practice-target/db.js',
      'practice-target/server/handler.js',
    ]);
  });

  it('grouped -o expression (\\( -name -o -name \\))', () => {
    expect(sorted('find practice-target -type f \\( -name "*.jsx" -o -name ".env*" \\)')).toEqual([
      'practice-target/.env.example',
      'practice-target/ui/Comment.jsx',
    ]);
  });

  it('-size +200c selects files larger than 200 bytes (no dirs, no .env.example)', () => {
    const out = sorted('find practice-target -size +200c');
    expect(out).not.toContain('practice-target');
    expect(out).not.toContain('practice-target/.env.example');
    expect(out).toContain('practice-target/db.js');
  });

  it('-exec grep -l {} + pipes matches into grep', () => {
    expect(sorted('find practice-target -name "*.js" -exec grep -l "secret" {} +')).toEqual([
      'practice-target/server/handler.js',
    ]);
  });
});

describe('recon terminal: ripgrep', () => {
  it('skips dotfiles by default (.env.example not searched)', () => {
    const out = raw('rg "API_SECRET" practice-target');
    expect(out).not.toContain('.env.example');
    expect(out).toContain('practice-target/notes.md:3:'); // non-hidden file still matches
  });

  it('--hidden includes dotfiles like .env.example', () => {
    expect(sorted('rg --hidden "API_SECRET" practice-target')).toEqual([
      'practice-target/.env.example:2:API_SECRET=sk_test_DO_NOT_COMMIT_8273',
      'practice-target/notes.md:3:- TODO: rotate the API_SECRET before launch',
    ]);
  });

  it('-tjs limits to JavaScript files', () => {
    expect(raw('rg -tjs "secret" practice-target')).toBe(
      'practice-target/server/handler.js:3:// Logs a secret — shows up in logs/CI output.',
    );
  });
});

describe('recon terminal: shell helpers', () => {
  it('cat prints file content', () => {
    expect(raw('cat practice-target/auth.js')).toContain('eval(expr)');
  });

  it('ls lists directory children', () => {
    expect(raw('ls practice-target')).toContain('config.js');
  });

  it('clear signals a screen wipe', () => {
    expect(runLine('clear').clear).toBe(true);
  });

  it('unknown command reports not found', () => {
    expect(raw('frobnicate')).toContain('command not found');
  });
});

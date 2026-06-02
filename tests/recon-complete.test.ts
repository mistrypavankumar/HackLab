import { describe, expect, it } from 'vitest';
import { complete } from '@/recon/terminal/engine';

describe('recon terminal: tab completion', () => {
  it('completes a command prefix', () => {
    expect(complete('gr').input).toBe('grep ');
  });

  it('offers candidates when a command prefix is ambiguous', () => {
    // "c" matches cat, clear, cd
    const r = complete('c');
    expect(r.input).toBe('c'); // no unique progress past the common prefix
    expect(r.suggestions).toEqual(expect.arrayContaining(['cat', 'clear', 'cd']));
  });

  it('completes a top-level path to the practice-target directory', () => {
    expect(complete('grep -rn "x" pr').input).toBe('grep -rn "x" practice-target/');
  });

  it('completes a nested file path', () => {
    expect(complete('cat practice-target/au').input).toBe('cat practice-target/auth.js ');
  });

  it('completes a path inside a subdirectory', () => {
    expect(complete('cat practice-target/server/han').input).toBe(
      'cat practice-target/server/handler.js ',
    );
  });

  it('lists directory children when the fragment is empty', () => {
    const r = complete('ls practice-target/');
    expect(r.suggestions).toEqual(expect.arrayContaining(['config.js', 'ui/', 'server/']));
  });

  it('completes a flag for the current command', () => {
    expect(complete('grep --inc').input).toBe('grep --include=');
  });

  it('returns the input unchanged when nothing matches', () => {
    expect(complete('grep -rn "x" zzz').input).toBe('grep -rn "x" zzz');
  });
});

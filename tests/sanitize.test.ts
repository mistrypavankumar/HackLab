import { describe, expect, it } from 'vitest';
import { escapeHtml } from '@/lib/sanitize';

describe('stored-xss: escapeHtml', () => {
  it('neutralizes an img onerror payload', () => {
    const out = escapeHtml('<img src=x onerror="alert(1)">');
    expect(out).not.toContain('<img');
    expect(out).toContain('&lt;img');
  });

  it('escapes all HTML-significant characters', () => {
    expect(escapeHtml(`<>&"'`)).toBe('&lt;&gt;&amp;&quot;&#39;');
  });
});

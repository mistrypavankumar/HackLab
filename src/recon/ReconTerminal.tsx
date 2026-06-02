'use client';

import { useEffect, useRef, useState } from 'react';
import { complete, runLine, type OutLine } from './terminal/engine';

interface Entry {
  command: string;
  lines: OutLine[];
}

const PROMPT = 'practice-target $';

const EXAMPLES = [
  'grep -rn "apiKey" practice-target',
  'grep -rnE "AKIA[0-9A-Z]{16}" practice-target',
  'find practice-target -type f -name "*.js"',
  'rg --hidden "API_SECRET" practice-target',
  'help',
];

const WELCOME: Entry = {
  command: '',
  lines: [
    {
      prefix: '',
      body:
        'Simulated terminal — searches a virtual copy of practice-target/ in your browser.\nType `help` for supported commands, or click an example below.',
    },
  ],
};

// Render a body string, wrapping matches of `matchRe` in a highlight span.
function HighlightedBody({ body, matchRe }: { body: string; matchRe?: RegExp }) {
  if (!matchRe) return <>{body}</>;
  const re = new RegExp(matchRe.source, matchRe.flags.includes('g') ? matchRe.flags : matchRe.flags + 'g');
  const parts: React.ReactNode[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  let key = 0;
  while ((m = re.exec(body)) !== null) {
    if (m.index > last) parts.push(body.slice(last, m.index));
    parts.push(
      <mark key={key++} className="rounded bg-accent/25 px-0.5 font-semibold text-accent">
        {m[0]}
      </mark>,
    );
    last = m.index + m[0].length;
    if (m.index === re.lastIndex) re.lastIndex++; // guard against zero-width matches
  }
  if (last < body.length) parts.push(body.slice(last));
  return <>{parts}</>;
}

export function ReconTerminal() {
  const [entries, setEntries] = useState<Entry[]>([WELCOME]);
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [histIdx, setHistIdx] = useState(-1);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [entries]);

  const submit = (raw: string) => {
    const command = raw.trim();
    if (!command) return;
    const result = runLine(command);
    if (result.clear) setEntries([]);
    else setEntries((prev) => [...prev, { command, lines: result.lines }]);
    setHistory((prev) => [...prev, command]);
    setHistIdx(-1);
    setInput('');
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const r = complete(input);
      setInput(r.input);
      if (r.suggestions.length > 1) {
        setEntries((prev) => [
          ...prev,
          { command: input, lines: [{ prefix: '', body: r.suggestions.join('   ') }] },
        ]);
      }
    } else if (e.key === 'Enter') {
      submit(input);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length === 0) return;
      const next = histIdx < 0 ? history.length - 1 : Math.max(0, histIdx - 1);
      setHistIdx(next);
      setInput(history[next]);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (histIdx < 0) return;
      const next = histIdx + 1;
      if (next >= history.length) {
        setHistIdx(-1);
        setInput('');
      } else {
        setHistIdx(next);
        setInput(history[next]);
      }
    }
  };

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-[#0c0c0e]">
      <div className="flex items-center gap-2 border-b border-border px-4 py-2">
        <span className="h-3 w-3 rounded-full bg-danger/70" />
        <span className="h-3 w-3 rounded-full bg-amber-400/70" />
        <span className="h-3 w-3 rounded-full bg-accent/70" />
        <span className="ml-2 text-xs text-zinc-500">recon — practice terminal (sandboxed)</span>
      </div>

      <div
        ref={scrollRef}
        onClick={() => inputRef.current?.focus()}
        className="h-80 overflow-y-auto p-4 font-mono text-xs leading-relaxed"
      >
        {entries.map((entry, idx) => (
          <div key={idx} className="mb-2">
            {entry.command && (
              <div className="flex gap-2">
                <span className="shrink-0 text-accent">{PROMPT}</span>
                <span className="text-zinc-200">{entry.command}</span>
              </div>
            )}
            {entry.lines.map((line, li) => (
              <pre
                key={li}
                className={`whitespace-pre-wrap break-words ${
                  line.tone === 'error' ? 'text-danger/80' : 'text-zinc-400'
                }`}
              >
                {line.prefix && <span className="text-zinc-600">{line.prefix}</span>}
                <HighlightedBody body={line.body} matchRe={line.matchRe} />
              </pre>
            ))}
          </div>
        ))}

        <div className="flex gap-2">
          <span className="shrink-0 text-accent">{PROMPT}</span>
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            spellCheck={false}
            autoCapitalize="off"
            autoCorrect="off"
            aria-label="terminal input"
            className="flex-1 bg-transparent text-zinc-100 caret-accent outline-none"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2 border-t border-border px-4 py-3">
        {EXAMPLES.map((ex) => (
          <button
            key={ex}
            type="button"
            onClick={() => {
              setInput(ex);
              inputRef.current?.focus();
            }}
            className="rounded-md border border-border px-2 py-1 font-mono text-[11px] text-zinc-400 hover:border-accent/40 hover:text-zinc-200"
          >
            {ex}
          </button>
        ))}
      </div>
    </div>
  );
}

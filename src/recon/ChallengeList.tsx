'use client';

import { useState } from 'react';
import { challenges } from './challenges';
import type { Challenge } from './types';

function Reveal({ label, children }: { label: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="text-xs font-medium text-zinc-400 underline-offset-2 hover:text-zinc-200 hover:underline"
      >
        {open ? `▾ ${label}` : `▸ ${label}`}
      </button>
      {open && <div className="mt-2">{children}</div>}
    </div>
  );
}

const DIFF_STYLE: Record<Challenge['difficulty'], string> = {
  basic: 'bg-emerald-500/10 text-emerald-300',
  intermediate: 'bg-amber-500/10 text-amber-300',
};

function ChallengeCard({ c }: { c: Challenge }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(c.command);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  return (
    <div className="space-y-3 rounded-xl border border-border bg-panel p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm text-zinc-200">
          <span className="mr-2 text-zinc-500">#{c.id}</span>
          {c.goal}
        </p>
        <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs ${DIFF_STYLE[c.difficulty]}`}>
          {c.difficulty}
        </span>
      </div>

      <Reveal label="Hint">
        <p className="text-xs leading-relaxed text-zinc-400">{c.hint}</p>
      </Reveal>

      <Reveal label="Show command">
        <div className="flex items-center gap-2">
          <code className="flex-1 overflow-x-auto rounded-lg border border-border bg-bg px-3 py-2 text-xs text-accent">
            {c.command}
          </code>
          <button
            type="button"
            onClick={copy}
            className="shrink-0 rounded-lg border border-border px-3 py-2 text-xs text-zinc-400 hover:text-zinc-200"
          >
            {copied ? 'copied' : 'copy'}
          </button>
        </div>
      </Reveal>

      <Reveal label="What you should find">
        <p className="rounded-lg border border-accent/30 bg-accent/5 px-3 py-2 text-xs leading-relaxed text-zinc-300">
          {c.finding}
        </p>
      </Reveal>
    </div>
  );
}

export function ChallengeList() {
  return (
    <div className="grid gap-4">
      {challenges.map((c) => (
        <ChallengeCard key={c.id} c={c} />
      ))}
    </div>
  );
}

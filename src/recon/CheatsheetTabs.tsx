'use client';

import { useState } from 'react';
import type { CheatSection } from './types';

export function CheatsheetTabs({ sections }: { sections: CheatSection[] }) {
  const [active, setActive] = useState(0);
  const section = sections[active];

  return (
    <div className="space-y-5">
      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-border pb-3">
        {sections.map((s, i) => (
          <button
            key={s.tab}
            type="button"
            onClick={() => setActive(i)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
              i === active
                ? 'bg-accent/20 text-accent'
                : 'text-zinc-400 hover:bg-panel hover:text-zinc-200'
            }`}
          >
            {s.tab}
          </button>
        ))}
      </div>

      {/* Active section */}
      <div className="rounded-xl border border-border bg-panel p-6">
        <h3 className="mb-5 text-sm font-semibold uppercase tracking-wide text-accent">
          {section.title}
        </h3>
        <dl className="grid gap-x-8 gap-y-5 md:grid-cols-2">
          {section.items.map((item) => (
            <div key={item.cmd} className="grid grid-cols-1 gap-1">
              <dt>
                <code className="break-all text-xs text-zinc-100">{item.cmd}</code>
              </dt>
              <dd className="text-xs text-zinc-500">{item.desc}</dd>
              <dd className="mt-0.5 flex items-start gap-2">
                <span className="shrink-0 select-none pt-0.5 text-[10px] font-semibold uppercase tracking-wide text-zinc-600">
                  try
                </span>
                <code className="break-all rounded bg-bg px-2 py-1 text-xs text-accent">
                  {item.example}
                </code>
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}

'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { isCompleted } from '@/lib/progress';
import type { LabMeta } from '@/labs/types';

const DIFF_STYLE: Record<string, string> = {
  basic: 'text-emerald-300',
  intermediate: 'text-amber-300',
};

export function LabCard({ meta }: { meta: LabMeta }) {
  const [done, setDone] = useState(false);
  useEffect(() => setDone(isCompleted(meta.slug)), [meta.slug]);

  return (
    <Link
      href={`/labs/${meta.slug}`}
      className="group flex flex-col gap-2 rounded-xl border border-border bg-panel p-5 transition hover:border-accent/40"
    >
      <div className="flex items-center justify-between">
        <span className={`text-xs font-medium ${DIFF_STYLE[meta.difficulty]}`}>
          {meta.difficulty}
        </span>
        {done && <span className="text-xs text-accent">✓ done</span>}
      </div>
      <h3 className="font-semibold text-zinc-100 group-hover:text-accent">
        {meta.title}
      </h3>
      <p className="text-sm leading-relaxed text-zinc-400">{meta.summary}</p>
    </Link>
  );
}

import Link from 'next/link';
import type { ReactNode } from 'react';
import { CodeBlock } from '@/components/CodeBlock';
import { CompleteToggle } from '@/components/CompleteToggle';
import { CATEGORY_LABELS, type LabMeta } from '@/labs/types';
import { labs } from '@/labs/registry';

interface LabLayoutProps {
  meta: LabMeta;
  children: ReactNode;
}

const DIFF_STYLE: Record<string, string> = {
  basic: 'bg-emerald-500/10 text-emerald-300',
  intermediate: 'bg-amber-500/10 text-amber-300',
};

export function LabLayout({ meta, children }: LabLayoutProps) {
  const index = labs.findIndex((l) => l.meta.slug === meta.slug);
  const prev = index > 0 ? labs[index - 1].meta : null;
  const next = index < labs.length - 1 ? labs[index + 1].meta : null;

  return (
    <article className="space-y-8">
      <header className="space-y-3">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="rounded-full bg-zinc-800 px-3 py-1 text-zinc-300">
            {CATEGORY_LABELS[meta.category]}
          </span>
          <span className={`rounded-full px-3 py-1 ${DIFF_STYLE[meta.difficulty]}`}>
            {meta.difficulty}
          </span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">{meta.title}</h1>
        <p className="text-zinc-400">{meta.summary}</p>
      </header>

      {/* Interactive exploit panel */}
      <section className="rounded-xl border border-border bg-panel p-6">
        {children}
      </section>

      {/* Vulnerable vs secure code */}
      <section className="grid gap-4 md:grid-cols-2">
        <CodeBlock title="🔓 Vulnerable" tone="danger" code={meta.vulnerableCode} />
        <CodeBlock title="🔒 Fixed" tone="accent" code={meta.secureCode} />
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">
            Why it works
          </h2>
          <p className="text-sm leading-relaxed text-zinc-300">{meta.why}</p>
        </div>
        <div className="space-y-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">
            How to detect it in your code
          </h2>
          <p className="text-sm leading-relaxed text-zinc-300">{meta.detect}</p>
        </div>
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">
          Checklist
        </h2>
        <ul className="space-y-1 text-sm text-zinc-300">
          {meta.checklist.map((item) => (
            <li key={item} className="flex gap-2">
              <span className="text-accent">✓</span>
              {item}
            </li>
          ))}
        </ul>
      </section>

      <div className="flex items-center justify-between border-t border-border pt-6">
        {prev ? (
          <Link href={`/labs/${prev.slug}`} className="text-sm text-zinc-400 hover:text-zinc-200">
            ← {prev.title}
          </Link>
        ) : (
          <span />
        )}
        <CompleteToggle slug={meta.slug} />
        {next ? (
          <Link href={`/labs/${next.slug}`} className="text-sm text-zinc-400 hover:text-zinc-200">
            {next.title} →
          </Link>
        ) : (
          <span />
        )}
      </div>
    </article>
  );
}

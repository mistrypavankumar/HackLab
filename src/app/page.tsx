import Link from 'next/link';
import { LabCard } from '@/components/LabCard';
import { byCategory } from '@/labs/registry';
import { CATEGORY_LABELS, type Category } from '@/labs/types';

const ORDER: Category[] = ['frontend', 'backend', 'auth', 'misconfig'];

export default function HomePage() {
  return (
    <div className="space-y-12">
      <section className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">
          Learn web security by <span className="text-accent">breaking it</span>.
        </h1>
        <p className="max-w-2xl text-zinc-400">
          Each lab is a small, genuinely vulnerable app. Run the attack yourself,
          watch it succeed, then flip the <strong className="text-accent">Fixed</strong>{' '}
          switch and watch the <em>same attack</em> fail. Built for frontend and
          backend developers who want to find these bugs in their own code.
        </p>
      </section>

      <Link
        href="/recon"
        className="group flex flex-col gap-1 rounded-xl border border-accent/30 bg-accent/5 p-5 transition hover:border-accent/60"
      >
        <span className="text-sm font-semibold text-accent group-hover:underline">
          🔎 Code Recon: grep, find &amp; ripgrep →
        </span>
        <span className="text-sm text-zinc-400">
          Learn to hunt secrets and dangerous code from the command line, then
          practice on a planted sample codebase.
        </span>
      </Link>

      {ORDER.map((category) => {
        const metas = byCategory(category);
        if (metas.length === 0) return null;
        return (
          <section key={category} className="space-y-4">
            <h2 className="text-xl font-semibold text-zinc-200">
              {CATEGORY_LABELS[category]}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {metas.map((meta) => (
                <LabCard key={meta.slug} meta={meta} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { isCompleted, toggleCompleted } from '@/lib/progress';

export function CompleteToggle({ slug }: { slug: string }) {
  const [done, setDone] = useState(false);

  useEffect(() => {
    setDone(isCompleted(slug));
  }, [slug]);

  return (
    <button
      type="button"
      onClick={() => {
        toggleCompleted(slug);
        setDone((d) => !d);
      }}
      className={`rounded-lg border px-4 py-2 text-sm font-medium transition ${
        done
          ? 'border-accent/40 bg-accent/10 text-accent'
          : 'border-border text-zinc-400 hover:text-zinc-200'
      }`}
    >
      {done ? '✓ Completed' : 'Mark as complete'}
    </button>
  );
}

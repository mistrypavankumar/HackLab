'use client';

import type { LabMode } from '@/labs/types';

interface ModeToggleProps {
  mode: LabMode;
  onChange: (mode: LabMode) => void;
}

export function ModeToggle({ mode, onChange }: ModeToggleProps) {
  return (
    <div className="inline-flex rounded-lg border border-border bg-panel p-1 text-sm">
      <button
        type="button"
        onClick={() => onChange('vulnerable')}
        className={`rounded-md px-4 py-1.5 font-medium transition ${
          mode === 'vulnerable'
            ? 'bg-danger/20 text-danger'
            : 'text-zinc-400 hover:text-zinc-200'
        }`}
      >
        🔓 Vulnerable
      </button>
      <button
        type="button"
        onClick={() => onChange('secure')}
        className={`rounded-md px-4 py-1.5 font-medium transition ${
          mode === 'secure'
            ? 'bg-accent/20 text-accent'
            : 'text-zinc-400 hover:text-zinc-200'
        }`}
      >
        🔒 Fixed
      </button>
    </div>
  );
}

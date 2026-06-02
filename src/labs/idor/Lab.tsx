'use client';

import { useState } from 'react';
import { ModeToggle } from '@/components/ModeToggle';
import type { LabMode } from '@/labs/types';

export function IdorLab() {
  const [mode, setMode] = useState<LabMode>('vulnerable');
  const [id, setId] = useState(102);
  const [result, setResult] = useState<string>('');

  const fetchInvoice = async () => {
    const res = await fetch(`/api/labs/idor?mode=${mode}&id=${id}`);
    if (!res.ok) {
      setResult(`🔒 ${res.status}: ${await res.text()}`);
      return;
    }
    const inv = (await res.json()) as { id: number; user_id: number; amount: number; detail: string };
    const stolen = inv.user_id !== 2;
    setResult(
      `${stolen ? '🔓 LEAKED another user’s invoice — ' : '✓ your invoice — '}#${inv.id} (owner user ${inv.user_id}): $${inv.amount} — ${inv.detail}`,
    );
  };

  return (
    <div className="space-y-4">
      <ModeToggle mode={mode} onChange={setMode} />
      <p className="text-sm text-zinc-400">
        You are logged in as <strong>alice</strong> (user 2), who owns invoice{' '}
        <code className="text-zinc-300">#102</code>. Try requesting{' '}
        <code className="text-zinc-300">#101</code> — admin’s confidential invoice.
      </p>
      <div className="flex items-center gap-2">
        <label className="text-sm text-zinc-400">Invoice id</label>
        <input
          type="number"
          value={id}
          onChange={(e) => setId(Number(e.target.value))}
          className="w-28 rounded-lg border border-border bg-bg px-3 py-2 text-sm"
        />
        <button
          onClick={fetchInvoice}
          className="rounded-lg bg-accent/20 px-4 py-2 text-sm font-medium text-accent"
        >
          Fetch
        </button>
        <button
          onClick={() => setId(101)}
          className="text-xs text-zinc-500 underline hover:text-zinc-300"
        >
          target #101
        </button>
      </div>
      {result && <div className="rounded-lg border border-border bg-bg p-3 text-sm">{result}</div>}
    </div>
  );
}

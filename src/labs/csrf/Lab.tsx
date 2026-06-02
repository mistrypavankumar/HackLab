'use client';

import { useCallback, useEffect, useState } from 'react';
import { ModeToggle } from '@/components/ModeToggle';
import type { LabMode } from '@/labs/types';

export function CsrfLab() {
  const [mode, setMode] = useState<LabMode>('vulnerable');
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [log, setLog] = useState<string>('');

  const load = useCallback(async () => {
    const res = await fetch('/api/labs/csrf');
    const data = (await res.json()) as { email: string; csrfToken: string };
    setEmail(data.email);
    setToken(data.csrfToken);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  // Simulates a malicious form hosted on attacker.com: it submits WITHOUT the
  // CSRF token (it can't read it cross-origin).
  const attack = async () => {
    const res = await fetch(`/api/labs/csrf?mode=${mode}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: 'attacker@evil.com' }),
    });
    setLog(
      res.ok
        ? '🔓 attacker.com changed the victim’s email without a token!'
        : `🔒 blocked (${res.status}): ${await res.text()}`,
    );
    await load();
  };

  return (
    <div className="space-y-4">
      <ModeToggle mode={mode} onChange={setMode} />

      <div className="rounded-lg border border-border bg-bg p-4 text-sm">
        <div className="text-zinc-400">Victim’s current email</div>
        <div className="font-mono text-zinc-100">{email}</div>
      </div>

      <div className="rounded-lg border border-danger/40 bg-danger/5 p-4">
        <div className="mb-2 text-xs font-semibold uppercase text-danger">
          Simulated cross-site form (attacker.com)
        </div>
        <p className="mb-3 text-xs text-zinc-400">
          This form has no CSRF token — exactly what a forged request looks like.
        </p>
        <button
          onClick={attack}
          className="rounded-lg bg-danger/20 px-4 py-2 text-sm font-medium text-danger"
        >
          Submit forged “change email” request
        </button>
      </div>

      {log && <div className="rounded-lg border border-border bg-bg p-3 text-sm">{log}</div>}
      <p className="text-xs text-zinc-500">
        Legit page token: <code className="text-zinc-400">{token}</code> — the
        attacker can’t read this, which is why Fixed mode blocks them.
      </p>
    </div>
  );
}

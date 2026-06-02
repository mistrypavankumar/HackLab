'use client';

import { useState } from 'react';
import { ModeToggle } from '@/components/ModeToggle';
import type { LabMode } from '@/labs/types';

interface Attempt {
  n: number;
  password: string;
  status: string;
}

export function BruteForceLab() {
  const [mode, setMode] = useState<LabMode>('vulnerable');
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [running, setRunning] = useState(false);

  const run = async () => {
    setRunning(true);
    setAttempts([]);
    // Wordlist: 7 wrong guesses, then the real admin password last.
    const guesses = [
      'password',
      '123456',
      'admin',
      'letmein',
      'qwerty',
      'dragon',
      'monkey',
      'SuperSecretAdminPass!',
    ];
    const results: Attempt[] = [];
    for (let i = 0; i < guesses.length; i++) {
      const reset = i === 0 ? '&reset=1' : '';
      const res = await fetch(`/api/labs/brute-force/login?mode=${mode}${reset}`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ username: 'admin', password: guesses[i] }),
      });
      const data = (await res.json()) as { ok: boolean; locked: boolean };
      const status = data.locked
        ? '🔒 LOCKED (429)'
        : data.ok
          ? '🔓 PASSWORD FOUND'
          : '✗ wrong';
      results.push({ n: i + 1, password: guesses[i], status });
      setAttempts([...results]);
      if (data.locked) break;
    }
    setRunning(false);
  };

  return (
    <div className="space-y-4">
      <ModeToggle mode={mode} onChange={setMode} />
      <button
        onClick={run}
        disabled={running}
        className="rounded-lg bg-danger/20 px-4 py-2 text-sm font-medium text-danger disabled:opacity-50"
      >
        {running ? 'Attacking…' : 'Run brute-force attack on “admin”'}
      </button>
      <div className="space-y-1 font-mono text-xs">
        {attempts.map((a) => (
          <div key={a.n} className="flex gap-3 rounded border border-border bg-bg px-3 py-1.5">
            <span className="text-zinc-500">#{a.n}</span>
            <span className="flex-1 text-zinc-300">{a.password}</span>
            <span>{a.status}</span>
          </div>
        ))}
      </div>
      <p className="text-xs text-zinc-500">
        Vulnerable mode tries every guess and eventually cracks the password.
        Fixed mode locks the account after 5 attempts (429) — the attack dies
        before reaching the real password.
      </p>
    </div>
  );
}

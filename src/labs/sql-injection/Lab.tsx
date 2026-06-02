'use client';

import { useState } from 'react';
import { ModeToggle } from '@/components/ModeToggle';
import type { LabMode } from '@/labs/types';

const PAYLOAD = "admin' --";

export function SqlInjectionLab() {
  const [mode, setMode] = useState<LabMode>('vulnerable');
  const [username, setUsername] = useState(PAYLOAD);
  const [password, setPassword] = useState('anything');
  const [result, setResult] = useState<string>('');

  const submit = async () => {
    const res = await fetch(`/api/labs/sql-injection?mode=${mode}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const data = (await res.json()) as {
      ok: boolean;
      user?: { username: string; role: string };
      message?: string;
    };
    setResult(
      data.ok
        ? `🔓 Logged in as ${data.user?.username} (${data.user?.role})!`
        : `🔒 ${data.message}`,
    );
  };

  return (
    <div className="space-y-4">
      <ModeToggle mode={mode} onChange={setMode} />
      <div className="grid gap-2 sm:grid-cols-2">
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="username"
          className="rounded-lg border border-border bg-bg px-3 py-2 text-sm"
        />
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="password"
          className="rounded-lg border border-border bg-bg px-3 py-2 text-sm"
        />
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={submit}
          className="rounded-lg bg-accent/20 px-4 py-2 text-sm font-medium text-accent"
        >
          Log in
        </button>
        <button
          onClick={() => {
            setUsername(PAYLOAD);
            setPassword('anything');
          }}
          className="text-xs text-zinc-500 underline hover:text-zinc-300"
        >
          insert injection payload
        </button>
      </div>
      {result && <div className="rounded-lg border border-border bg-bg p-3 text-sm">{result}</div>}
      <p className="text-xs text-zinc-500">
        Try <code className="text-zinc-400">{PAYLOAD}</code> as the username. In
        Vulnerable mode the password check is commented out; Fixed mode treats it
        as a (non-existent) literal username.
      </p>
    </div>
  );
}

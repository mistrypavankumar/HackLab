'use client';

import { useState } from 'react';
import { ModeToggle } from '@/components/ModeToggle';
import { leakedKeys } from './route-logic';
import type { LabMode } from '@/labs/types';

export function ExposedSecretsLab() {
  const [mode, setMode] = useState<LabMode>('vulnerable');
  const [config, setConfig] = useState<Record<string, string> | null>(null);

  const fetchConfig = async () => {
    const res = await fetch(`/api/labs/exposed-secrets/config?mode=${mode}`);
    setConfig((await res.json()) as Record<string, string>);
  };

  const leaks = config ? leakedKeys(config) : [];

  return (
    <div className="space-y-4">
      <ModeToggle mode={mode} onChange={setMode} />
      <button
        onClick={fetchConfig}
        className="rounded-lg bg-danger/20 px-4 py-2 text-sm font-medium text-danger"
      >
        GET /api/labs/exposed-secrets/config
      </button>

      {config && (
        <div className="space-y-3">
          {leaks.length > 0 ? (
            <div className="text-sm font-semibold text-danger">
              🔓 Leaked {leaks.length} secret(s): {leaks.join(', ')}
            </div>
          ) : (
            <div className="text-sm font-semibold text-accent">
              🔒 No sensitive values exposed.
            </div>
          )}
          <pre className="overflow-x-auto rounded-lg border border-border bg-bg p-4 text-xs">
            {JSON.stringify(config, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

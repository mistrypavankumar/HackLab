'use client';

import { useState } from 'react';
import { ModeToggle } from '@/components/ModeToggle';
import type { LabMode } from '@/labs/types';

export function SecurityHeadersLab() {
  const [mode, setMode] = useState<LabMode>('vulnerable');
  const [headers, setHeaders] = useState<Record<string, string>>({});
  const [src, setSrc] = useState('');

  const load = async () => {
    const url = `/api/labs/security-headers/page?mode=${mode}`;
    const res = await fetch(url);
    const relevant: Record<string, string> = {};
    res.headers.forEach((v, k) => {
      if (/content-security-policy|x-frame-options|x-content-type/.test(k)) relevant[k] = v;
    });
    setHeaders(relevant);
    setSrc(url);
  };

  const hasFraming =
    'x-frame-options' in headers || 'content-security-policy' in headers;

  return (
    <div className="space-y-4">
      <ModeToggle mode={mode} onChange={setMode} />
      <button
        onClick={load}
        className="rounded-lg bg-accent/20 px-4 py-2 text-sm font-medium text-accent"
      >
        Try to embed the “bank” page in an iframe
      </button>

      {src && (
        <>
          <div className="text-sm">
            {hasFraming ? (
              <span className="font-semibold text-accent">
                🔒 Framing headers present — the browser blocks the iframe below.
              </span>
            ) : (
              <span className="font-semibold text-danger">
                🔓 No framing protection — the page embeds and is clickjackable.
              </span>
            )}
          </div>
          <pre className="overflow-x-auto rounded-lg border border-border bg-bg p-3 text-xs">
            {Object.keys(headers).length
              ? Object.entries(headers).map(([k, v]) => `${k}: ${v}`).join('\n')
              : '(no security headers returned)'}
          </pre>
          <iframe
            src={src}
            title="embedded target"
            className="h-48 w-full rounded-lg border border-border bg-white"
          />
        </>
      )}
    </div>
  );
}

'use client';

import { useCallback, useEffect, useState } from 'react';
import { ModeToggle } from '@/components/ModeToggle';
import type { LabMode } from '@/labs/types';

interface Comment {
  id: number;
  author: string;
  body: string;
}

const PAYLOAD = `<img src=x onerror="window.dispatchEvent(new CustomEvent('hacklab-xss'))">`;

// A per-browser id so a visitor only sees (and is affected by) their own stored
// payloads — keeps the public demo from XSS-ing other people.
function getClientId(): string {
  if (typeof window === 'undefined') return 'anon';
  let id = window.localStorage.getItem('hacklab:client');
  if (!id) {
    id = Math.random().toString(36).slice(2) + Date.now().toString(36);
    window.localStorage.setItem('hacklab:client', id);
  }
  return id;
}

export function StoredXssLab() {
  const [mode, setMode] = useState<LabMode>('vulnerable');
  const [comments, setComments] = useState<Comment[]>([]);
  const [body, setBody] = useState(PAYLOAD);
  const [fired, setFired] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch(`/api/labs/stored-xss?mode=${mode}&client=${getClientId()}`);
    const data = (await res.json()) as { comments: Comment[] };
    setComments(data.comments);
  }, [mode]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const onXss = () => setFired(true);
    window.addEventListener('hacklab-xss', onXss);
    return () => window.removeEventListener('hacklab-xss', onXss);
  }, []);

  const submit = async () => {
    setFired(false);
    await fetch('/api/labs/stored-xss', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ author: 'attacker', body, client: getClientId() }),
    });
    setBody('');
    await load();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <ModeToggle mode={mode} onChange={setMode} />
        {fired ? (
          <span className="text-sm font-semibold text-danger">💥 XSS executed!</span>
        ) : (
          <span className="text-sm text-zinc-500">no script has run</span>
        )}
      </div>

      <div className="flex gap-2">
        <input
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Write a comment… try the payload"
          className="flex-1 rounded-lg border border-border bg-bg px-3 py-2 text-sm"
        />
        <button
          onClick={submit}
          className="rounded-lg bg-accent/20 px-4 py-2 text-sm font-medium text-accent"
        >
          Post
        </button>
      </div>
      <button
        onClick={() => setBody(PAYLOAD)}
        className="text-xs text-zinc-500 underline hover:text-zinc-300"
      >
        insert attack payload
      </button>

      <div className="space-y-2">
        {comments.map((c) => (
          <div key={c.id} className="rounded-lg border border-border bg-bg p-3 text-sm">
            <div className="mb-1 text-xs text-zinc-500">{c.author}</div>
            {/* Intentionally rendering raw HTML to demonstrate the vulnerability. */}
            <div dangerouslySetInnerHTML={{ __html: c.body }} />
          </div>
        ))}
      </div>
      <p className="text-xs text-zinc-500">
        In <strong>Vulnerable</strong> mode the comment’s markup runs. Switch to{' '}
        <strong>Fixed</strong> and reload — the same payload now shows as harmless
        text.
      </p>
    </div>
  );
}

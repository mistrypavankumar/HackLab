import { getDb } from '@/lib/db';
import { escapeHtml } from '@/lib/sanitize';
import type { LabMode } from '@/labs/types';

interface CommentRow {
  id: number;
  author: string;
  body: string;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const mode = (url.searchParams.get('mode') ?? 'vulnerable') as LabMode;
  const client = url.searchParams.get('client') ?? 'anon';
  // Scope to this visitor's own comments + the shared seed comments, so a
  // public visitor's stored XSS can't execute in other people's browsers.
  const rows = getDb()
    .prepare("SELECT id, author, body FROM comments WHERE client = ? OR client = 'seed' ORDER BY id")
    .all(client) as CommentRow[];

  // SECURE: encode the body so it renders as inert text.
  // VULNERABLE: return the raw body straight to the client.
  const comments =
    mode === 'secure'
      ? rows.map((c) => ({ ...c, body: escapeHtml(c.body) }))
      : rows;

  return Response.json({ comments });
}

export async function POST(request: Request) {
  const { author, body, client } = (await request.json()) as {
    author?: string;
    body?: string;
    client?: string;
  };
  if (!body) return new Response('body required', { status: 400 });

  getDb()
    .prepare('INSERT INTO comments (author, body, client) VALUES (?, ?, ?)')
    .run(author?.slice(0, 40) || 'anon', body, (client || 'anon').slice(0, 64));

  return Response.json({ ok: true });
}

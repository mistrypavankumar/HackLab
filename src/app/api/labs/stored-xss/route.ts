import { getDb } from '@/lib/db';
import { escapeHtml } from '@/lib/sanitize';
import type { LabMode } from '@/labs/types';

interface CommentRow {
  id: number;
  author: string;
  body: string;
}

export async function GET(request: Request) {
  const mode = (new URL(request.url).searchParams.get('mode') ?? 'vulnerable') as LabMode;
  const rows = getDb()
    .prepare('SELECT id, author, body FROM comments ORDER BY id')
    .all() as CommentRow[];

  // SECURE: encode the body so it renders as inert text.
  // VULNERABLE: return the raw body straight to the client.
  const comments =
    mode === 'secure'
      ? rows.map((c) => ({ ...c, body: escapeHtml(c.body) }))
      : rows;

  return Response.json({ comments });
}

export async function POST(request: Request) {
  const { author, body } = (await request.json()) as { author?: string; body?: string };
  if (!body) return new Response('body required', { status: 400 });

  getDb()
    .prepare('INSERT INTO comments (author, body) VALUES (?, ?)')
    .run(author?.slice(0, 40) || 'anon', body);

  return Response.json({ ok: true });
}

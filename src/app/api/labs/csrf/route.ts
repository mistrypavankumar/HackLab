import { getDb } from '@/lib/db';
import { CSRF_TOKEN, handleChangeEmail } from '@/labs/csrf/route-logic';
import type { LabMode } from '@/labs/types';

const VICTIM_ID = 2; // alice

export async function GET() {
  const row = getDb()
    .prepare('SELECT email FROM users WHERE id = ?')
    .get(VICTIM_ID) as { email: string };
  // The legitimate page is allowed to read the token; a cross-origin attacker is not.
  return Response.json({ email: row.email, csrfToken: CSRF_TOKEN });
}

export async function POST(request: Request) {
  const mode = (new URL(request.url).searchParams.get('mode') ?? 'vulnerable') as LabMode;
  const { email } = (await request.json()) as { email?: string };
  const token = request.headers.get('x-csrf-token');

  const result = handleChangeEmail(mode, token);
  if (!result.ok) {
    return new Response(result.message, { status: result.status });
  }

  if (email) {
    getDb().prepare('UPDATE users SET email = ? WHERE id = ?').run(email, VICTIM_ID);
  }
  return Response.json({ ok: true, message: result.message });
}

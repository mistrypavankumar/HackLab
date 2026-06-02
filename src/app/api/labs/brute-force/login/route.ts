import { getDb } from '@/lib/db';
import { verifyPassword } from '@/lib/hash';
import { recordAttempt, resetLimiter } from '@/lib/rateLimit';
import type { LabMode } from '@/labs/types';

function checkCredentials(username: string, password: string): boolean {
  const row = getDb()
    .prepare('SELECT password_hash FROM users WHERE username = ?')
    .get(username) as { password_hash: string } | undefined;
  if (!row) return false;
  return verifyPassword(password, row.password_hash);
}

export async function POST(request: Request) {
  const url = new URL(request.url);
  const mode = (url.searchParams.get('mode') ?? 'vulnerable') as LabMode;
  const { username, password } = (await request.json()) as {
    username?: string;
    password?: string;
  };
  const key = `lab:${username}`;

  if (url.searchParams.get('reset')) resetLimiter(key);

  // SECURE: throttle by key; lock out once the threshold is exceeded.
  if (mode === 'secure') {
    const { locked, remaining } = recordAttempt(key, Date.now());
    if (locked) {
      return Response.json(
        { ok: false, locked: true, message: 'Too many attempts — locked.' },
        { status: 429 },
      );
    }
    const success = checkCredentials(username ?? '', password ?? '');
    return Response.json({ ok: success, locked: false, remaining });
  }

  // VULNERABLE: no limiting at all.
  const success = checkCredentials(username ?? '', password ?? '');
  return Response.json({ ok: success, locked: false });
}

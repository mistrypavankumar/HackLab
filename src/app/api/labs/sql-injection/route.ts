import { getDb } from '@/lib/db';
import { login } from '@/labs/sql-injection/route-logic';
import type { LabMode } from '@/labs/types';

export async function POST(request: Request) {
  const mode = (new URL(request.url).searchParams.get('mode') ?? 'vulnerable') as LabMode;
  const { username, password } = (await request.json()) as {
    username?: string;
    password?: string;
  };

  const user = login(getDb(), mode, username ?? '', password ?? '');
  if (!user) {
    return Response.json({ ok: false, message: 'Invalid credentials' }, { status: 401 });
  }
  return Response.json({ ok: true, user });
}

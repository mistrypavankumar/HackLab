import { signToken, verifyTokenSecure, verifyTokenVulnerable } from '@/lib/jwt';
import type { LabMode } from '@/labs/types';

// Issue a legitimate low-privilege token for the learner to tamper with.
export async function GET() {
  const token = signToken({ sub: '2', role: 'user' });
  return Response.json({ token });
}

export async function POST(request: Request) {
  const mode = (new URL(request.url).searchParams.get('mode') ?? 'vulnerable') as LabMode;
  const { token } = (await request.json()) as { token?: string };
  if (!token) return new Response('token required', { status: 400 });

  try {
    const payload =
      mode === 'secure' ? verifyTokenSecure(token) : verifyTokenVulnerable(token);
    return Response.json({
      ok: true,
      role: payload.role,
      adminAccess: payload.role === 'admin',
    });
  } catch (err) {
    return Response.json(
      { ok: false, message: (err as Error).message },
      { status: 401 },
    );
  }
}

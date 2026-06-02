import type { LabMeta } from '../types';

export const meta: LabMeta = {
  slug: 'csrf',
  title: 'Cross-Site Request Forgery (CSRF)',
  category: 'frontend',
  difficulty: 'intermediate',
  summary:
    'A “change email” action trusts the session cookie alone. Any other website can silently submit that form on a logged-in victim’s behalf.',
  vulnerableCode: `// Only the ambient session cookie is checked — no proof the
// request came from YOUR page.
export async function POST(req: Request) {
  const { email } = await req.json();
  updateEmail(currentUser, email); // attacker-controlled
  return Response.json({ ok: true });
}`,
  secureCode: `// Require an unguessable token that only your own page can read,
// and set cookies SameSite=Lax/Strict.
export async function POST(req: Request) {
  const token = req.headers.get('x-csrf-token');
  if (token !== session.csrfToken) {
    return new Response('CSRF token invalid', { status: 403 });
  }
  const { email } = await req.json();
  updateEmail(currentUser, email);
  return Response.json({ ok: true });
}`,
  why: 'Browsers attach cookies automatically to cross-site requests. If the server only checks the cookie, a hidden form on attacker.com can trigger authenticated state changes without the victim’s knowledge.',
  detect: 'Look for state-changing endpoints (POST/PUT/DELETE) with no anti-CSRF token check, cookies without SameSite, or actions performed via GET. Framework CSRF middleware that’s disabled or bypassed is a red flag.',
  checklist: [
    'Require a per-session CSRF token on every state-changing request.',
    'Set session cookies to SameSite=Lax or Strict.',
    'Never perform state changes via GET requests.',
    'Verify Origin/Referer for sensitive actions as defense-in-depth.',
  ],
};

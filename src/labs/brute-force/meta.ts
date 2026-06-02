import type { LabMeta } from '../types';

export const meta: LabMeta = {
  slug: 'brute-force',
  title: 'Brute Force — Missing Rate Limiting',
  category: 'auth',
  difficulty: 'basic',
  summary:
    'The login endpoint accepts unlimited attempts, so an attacker can try thousands of passwords until one works.',
  vulnerableCode: `// Every request is processed — no throttle, no lockout.
export async function POST(req) {
  const { username, password } = await req.json();
  return checkCredentials(username, password); // forever
}`,
  secureCode: `// Track attempts per key and lock after a threshold.
const { locked } = recordAttempt(\`\${ip}:\${username}\`, Date.now());
if (locked) {
  return new Response('Too many attempts', { status: 429 });
}
return checkCredentials(username, password);`,
  why: 'Without rate limiting, account lockout, or proof-of-work, an attacker’s only limit is bandwidth. Combined with weak or reused passwords, credential stuffing and brute force succeed quickly and quietly.',
  detect: 'Check that auth, OTP, password-reset, and other sensitive endpoints enforce per-IP/per-account limits. Absence of 429 responses, lockouts, CAPTCHAs, or exponential backoff is the tell.',
  checklist: [
    'Rate-limit auth endpoints per IP and per account.',
    'Lock or back off after repeated failures.',
    'Add CAPTCHA / MFA for sensitive flows.',
    'Alert on credential-stuffing patterns.',
  ],
};

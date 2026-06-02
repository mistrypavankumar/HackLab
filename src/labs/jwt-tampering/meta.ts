import type { LabMeta } from '../types';

export const meta: LabMeta = {
  slug: 'jwt-tampering',
  title: 'JWT Tampering (alg=none)',
  category: 'auth',
  difficulty: 'intermediate',
  summary:
    'The server decodes the JWT without verifying its signature. Forge a token with "alg":"none" and role:"admin" and you’re an administrator.',
  vulnerableCode: `// Decodes the payload but never checks the signature.
const payload = jwt.decode(token);   // trusts whatever is inside
if (payload.role === 'admin') grantAdmin();`,
  secureCode: `// Verify the signature AND pin the algorithm.
const payload = jwt.verify(token, SECRET, {
  algorithms: ['HS256'],            // reject alg:none and others
});
if (payload.role === 'admin') grantAdmin();`,
  why: 'A JWT’s payload is just base64 — anyone can edit it. Only the signature proves integrity. If the server decodes instead of verifies (or accepts alg:none, or uses a weak/guessable secret), attackers mint tokens with any claims they like.',
  detect: 'Look for jwt.decode() used where jwt.verify() belongs, missing algorithms allowlists, weak/hardcoded secrets, or accepting the algorithm from the token header. Confirm expiry (exp) is checked too.',
  checklist: [
    'Always verify the signature; never trust jwt.decode() for auth.',
    'Pin allowed algorithms (e.g. algorithms: ["HS256"]).',
    'Use a long, random, secret/keypair — never a guessable string.',
    'Validate exp, iss, and aud claims.',
  ],
};

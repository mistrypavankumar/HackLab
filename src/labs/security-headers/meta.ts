import type { LabMeta } from '../types';

export const meta: LabMeta = {
  slug: 'security-headers',
  title: 'Missing Security Headers (Clickjacking)',
  category: 'misconfig',
  difficulty: 'intermediate',
  summary:
    'The page sets no framing protections, so an attacker can load it in a hidden iframe and trick users into clicking things they can’t see.',
  vulnerableCode: `// No framing or content-security headers at all.
return new Response(html, {
  headers: { 'content-type': 'text/html' },
});`,
  secureCode: `return new Response(html, {
  headers: {
    'content-type': 'text/html',
    'Content-Security-Policy': "frame-ancestors 'none'",
    'X-Frame-Options': 'DENY',
  },
});`,
  why: 'Browsers will happily embed your page in someone else’s iframe unless you forbid it. Attackers overlay invisible frames over decoy UI (“clickjacking”) to hijack clicks — confirming payments, changing settings, granting permissions.',
  detect: 'Check responses for Content-Security-Policy (incl. frame-ancestors), X-Frame-Options, HSTS, and X-Content-Type-Options. Missing or permissive headers — especially on authenticated, state-changing pages — are the risk.',
  checklist: [
    'Set Content-Security-Policy with frame-ancestors to control embedding.',
    'Send X-Frame-Options: DENY (legacy fallback).',
    'Add HSTS, X-Content-Type-Options: nosniff, and a strict default CSP.',
    'Apply headers globally (middleware), not per-route ad hoc.',
  ],
};

import type { LabMode } from '@/labs/types';

// Returns the response headers for the demo page in each mode.
export function pageHeaders(mode: LabMode): Record<string, string> {
  const base: Record<string, string> = { 'content-type': 'text/html' };
  if (mode === 'secure') {
    // SECURE: forbid framing via modern + legacy headers.
    base['content-security-policy'] = "frame-ancestors 'none'";
    base['x-frame-options'] = 'DENY';
    base['x-content-type-options'] = 'nosniff';
  }
  // VULNERABLE: ship no protective headers.
  return base;
}

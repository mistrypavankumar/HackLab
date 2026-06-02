import type { LabMode } from '@/labs/types';

// The token the legitimate page knows. A cross-site attacker cannot read it
// (it is never exposed cross-origin), so they cannot forge a valid request.
export const CSRF_TOKEN = 'csrf-double-submit-token';

export interface CsrfResult {
  ok: boolean;
  status: number;
  message: string;
}

export function handleChangeEmail(
  mode: LabMode,
  providedToken: string | null,
): CsrfResult {
  // SECURE: reject unless the request carries the expected CSRF token.
  if (mode === 'secure' && providedToken !== CSRF_TOKEN) {
    return { ok: false, status: 403, message: 'CSRF token invalid — request blocked.' };
  }
  // VULNERABLE: accept on the strength of the (implied) cookie alone.
  return { ok: true, status: 200, message: 'Email changed.' };
}

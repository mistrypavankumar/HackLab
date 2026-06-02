import type Database from 'better-sqlite3';
import type { LabMode } from '@/labs/types';

export interface Invoice {
  id: number;
  user_id: number;
  amount: number;
  detail: string;
}

export type IdorResult =
  | { ok: true; invoice: Invoice }
  | { ok: false; status: number; message: string };

export function getInvoice(
  db: Database.Database,
  mode: LabMode,
  invoiceId: number,
  currentUserId: number,
): IdorResult {
  const invoice = db
    .prepare('SELECT id, user_id, amount, detail FROM invoices WHERE id = ?')
    .get(invoiceId) as Invoice | undefined;

  if (!invoice) return { ok: false, status: 404, message: 'Not found' };

  // SECURE: deny unless the invoice belongs to the caller.
  if (mode === 'secure' && invoice.user_id !== currentUserId) {
    return { ok: false, status: 403, message: 'Forbidden — not your invoice.' };
  }

  // VULNERABLE: hand it over regardless of owner.
  return { ok: true, invoice };
}

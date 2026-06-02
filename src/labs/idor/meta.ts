import type { LabMeta } from '../types';

export const meta: LabMeta = {
  slug: 'idor',
  title: 'IDOR — Broken Access Control',
  category: 'backend',
  difficulty: 'basic',
  summary:
    'The invoice endpoint returns any record by its id. Change the id in the URL and you read another user’s confidential invoice.',
  vulnerableCode: `// Looks up by id only — never checks who is asking.
export async function GET(req) {
  const id = searchParams.get('id');
  const invoice = db.prepare('SELECT * FROM invoices WHERE id = ?').get(id);
  return Response.json(invoice); // anyone's invoice
}`,
  secureCode: `// Enforce ownership: the record must belong to the caller.
export async function GET(req) {
  const id = searchParams.get('id');
  const invoice = db.prepare('SELECT * FROM invoices WHERE id = ?').get(id);
  if (!invoice || invoice.user_id !== session.userId) {
    return new Response('Forbidden', { status: 403 });
  }
  return Response.json(invoice);
}`,
  why: 'Authentication proves who you are; authorization proves you’re allowed to access a specific object. Checking only that someone is logged in — without verifying they own the requested record — lets them enumerate ids and read everyone’s data.',
  detect: 'Find handlers that fetch a resource by a client-supplied id without a “does this belong to the current user / does the user have this role” check. Sequential/guessable ids make it worse but UUIDs don’t fix it.',
  checklist: [
    'Authorize every object access against the current principal.',
    'Scope queries by owner: WHERE id = ? AND user_id = ?.',
    'Don’t rely on unguessable ids as an access-control mechanism.',
    'Add server-side role/permission checks, not just UI hiding.',
  ],
};

import { getDb } from '@/lib/db';
import { getInvoice } from '@/labs/idor/route-logic';
import type { LabMode } from '@/labs/types';

const CURRENT_USER_ID = 2; // logged in as alice

export async function GET(request: Request) {
  const url = new URL(request.url);
  const mode = (url.searchParams.get('mode') ?? 'vulnerable') as LabMode;
  const id = Number(url.searchParams.get('id') ?? '0');

  const result = getInvoice(getDb(), mode, id, CURRENT_USER_ID);
  if (!result.ok) {
    return new Response(result.message, { status: result.status });
  }
  return Response.json(result.invoice);
}

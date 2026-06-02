import { pageHeaders } from '@/labs/security-headers/route-logic';
import type { LabMode } from '@/labs/types';

export async function GET(request: Request) {
  const mode = (new URL(request.url).searchParams.get('mode') ?? 'vulnerable') as LabMode;
  const html = `<!doctype html><html><body style="font-family:sans-serif;background:#fff;color:#111;padding:24px">
    <h2>🏦 Your Bank — Confirm Transfer</h2>
    <button style="padding:10px 16px">Confirm $1,000 transfer</button>
    <p>This sensitive page should never be embeddable in another site.</p>
  </body></html>`;

  return new Response(html, { headers: pageHeaders(mode) });
}

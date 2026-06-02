import { buildConfig } from '@/labs/exposed-secrets/route-logic';
import type { LabMode } from '@/labs/types';

export async function GET(request: Request) {
  const mode = (new URL(request.url).searchParams.get('mode') ?? 'vulnerable') as LabMode;
  return Response.json(buildConfig(mode));
}

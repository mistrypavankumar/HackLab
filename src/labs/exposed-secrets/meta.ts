import type { LabMeta } from '../types';

export const meta: LabMeta = {
  slug: 'exposed-secrets',
  title: 'Exposed Secrets via Debug Endpoint',
  category: 'misconfig',
  difficulty: 'basic',
  summary:
    'A leftover “debug config” endpoint dumps the server’s environment — including API keys, DB passwords, and the JWT secret.',
  vulnerableCode: `// Returns the raw server environment to anyone who asks.
export async function GET() {
  return Response.json(process.env); // API_SECRET, DB_PASSWORD, ...
}`,
  secureCode: `// Expose only explicitly-public, non-sensitive values.
export async function GET() {
  return Response.json({
    appName: 'HackLab',
    version: '0.1.0',
  });
  // Secrets stay server-side. Better yet: delete debug endpoints.
}`,
  why: 'Secrets in process.env are meant to stay on the server. A debug or health endpoint that echoes the environment, verbose error pages, or a committed .env file hands attackers the keys to everything — often game over.',
  detect: 'Search for endpoints returning process.env, config objects, or stack traces. Check that .env files are gitignored, secrets aren’t prefixed for the client bundle (NEXT_PUBLIC_), and error responses don’t leak internals.',
  checklist: [
    'Never serialize process.env or full config to a response.',
    'Remove debug/health endpoints that expose internals.',
    'Keep .env out of git; rotate anything ever committed.',
    'Only client-prefixed (NEXT_PUBLIC_) vars reach the browser.',
  ],
};

import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // better-sqlite3 is a native module; keep it out of the bundle...
  serverExternalPackages: ['better-sqlite3'],
  // ...and make sure its compiled binary is traced into the serverless functions
  // on Vercel (pnpm stores it under .pnpm/).
  outputFileTracingIncludes: {
    '/api/**': [
      './node_modules/better-sqlite3/build/Release/*.node',
      './node_modules/.pnpm/**/better-sqlite3/build/Release/*.node',
    ],
  },
};

export default nextConfig;

import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // better-sqlite3 is a native module; keep it out of the bundle...
  serverExternalPackages: ['better-sqlite3'],
  // ...and make sure its compiled binary is traced into the serverless functions.
  // With the hoisted node_modules layout (see .npmrc) better-sqlite3 is a real
  // directory rather than a pnpm `.pnpm/` symlink, so Vercel can package the
  // function without hitting "files in symlinked directories".
  outputFileTracingIncludes: {
    '/api/**': ['./node_modules/better-sqlite3/build/Release/*.node'],
  },
};

export default nextConfig;

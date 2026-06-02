import type { LabMode } from '@/labs/types';

// A stand-in environment so the lab doesn't depend on the real process.env.
const FAKE_ENV: Record<string, string> = {
  NODE_ENV: 'development',
  PUBLIC_APP_NAME: 'HackLab',
  API_SECRET: 'sk_live_8f3a91c2e7b04d56',
  DB_PASSWORD: 'pg-prod-Hunter2!',
  JWT_SECRET: 'hacklab-strong-secret-please-rotate',
  STRIPE_KEY: 'sk_test_51Hxxxx',
};

export function buildConfig(mode: LabMode): Record<string, string> {
  if (mode === 'secure') {
    // SECURE: only explicitly-public values leave the server.
    return { appName: FAKE_ENV.PUBLIC_APP_NAME, version: '0.1.0' };
  }
  // VULNERABLE: dump the whole environment.
  return FAKE_ENV;
}

const SENSITIVE = /secret|password|key|token/i;

export function leakedKeys(config: Record<string, string>): string[] {
  return Object.keys(config).filter((k) => SENSITIVE.test(k));
}

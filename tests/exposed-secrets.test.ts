import { describe, expect, it } from 'vitest';
import { buildConfig, leakedKeys } from '@/labs/exposed-secrets/route-logic';

describe('exposed-secrets: config', () => {
  it('VULNERABLE: leaks sensitive keys', () => {
    expect(leakedKeys(buildConfig('vulnerable')).length).toBeGreaterThan(0);
  });

  it('SECURE: exposes no sensitive keys', () => {
    expect(leakedKeys(buildConfig('secure'))).toHaveLength(0);
  });
});

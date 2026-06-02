import type { Category, Lab, LabMeta } from './types';

import { meta as storedXss } from './stored-xss/meta';
import { StoredXssLab } from './stored-xss/Lab';
import { meta as csrf } from './csrf/meta';
import { CsrfLab } from './csrf/Lab';
import { meta as sqlInjection } from './sql-injection/meta';
import { SqlInjectionLab } from './sql-injection/Lab';
import { meta as idor } from './idor/meta';
import { IdorLab } from './idor/Lab';
import { meta as jwtTampering } from './jwt-tampering/meta';
import { JwtTamperingLab } from './jwt-tampering/Lab';
import { meta as bruteForce } from './brute-force/meta';
import { BruteForceLab } from './brute-force/Lab';
import { meta as exposedSecrets } from './exposed-secrets/meta';
import { ExposedSecretsLab } from './exposed-secrets/Lab';
import { meta as securityHeaders } from './security-headers/meta';
import { SecurityHeadersLab } from './security-headers/Lab';

export const labs: Lab[] = [
  { meta: storedXss, Component: StoredXssLab },
  { meta: csrf, Component: CsrfLab },
  { meta: sqlInjection, Component: SqlInjectionLab },
  { meta: idor, Component: IdorLab },
  { meta: jwtTampering, Component: JwtTamperingLab },
  { meta: bruteForce, Component: BruteForceLab },
  { meta: exposedSecrets, Component: ExposedSecretsLab },
  { meta: securityHeaders, Component: SecurityHeadersLab },
];

export function getLab(slug: string): Lab | undefined {
  return labs.find((l) => l.meta.slug === slug);
}

export function byCategory(category: Category): LabMeta[] {
  return labs.filter((l) => l.meta.category === category).map((l) => l.meta);
}

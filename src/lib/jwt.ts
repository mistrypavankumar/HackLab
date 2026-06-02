import jwt from 'jsonwebtoken';

export const JWT_SECRET = 'hacklab-strong-secret-please-rotate';

export type TokenPayload = { sub: string; role: string };

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { algorithm: 'HS256', expiresIn: '1h' });
}

// SECURE: verify the signature and pin the algorithm so forged `alg:none`
// tokens and wrong-secret tokens are rejected.
export function verifyTokenSecure(token: string): TokenPayload {
  const decoded = jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] });
  return decoded as TokenPayload;
}

// VULNERABLE: trusts whatever is in the token without verifying the signature.
export function verifyTokenVulnerable(token: string): TokenPayload {
  const decoded = jwt.decode(token);
  if (!decoded || typeof decoded === 'string') {
    throw new Error('malformed token');
  }
  return decoded as TokenPayload;
}

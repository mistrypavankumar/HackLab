import crypto from 'node:crypto';

// Simple salted SHA-256. Real apps should use bcrypt/argon2 — kept minimal here
// so the labs stay focused on the vulnerability being taught, not hashing.
export function hashPassword(password: string, salt?: string): string {
  const s = salt ?? crypto.randomBytes(8).toString('hex');
  const h = crypto.createHash('sha256').update(s + password).digest('hex');
  return `${s}:${h}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt] = stored.split(':');
  if (!salt) return false;
  return hashPassword(password, salt) === stored;
}

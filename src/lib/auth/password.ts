import crypto from 'node:crypto';
import argon2 from 'argon2';
import bcrypt from 'bcryptjs';

export const PASSWORD_SALT_ROUNDS = 12;
export const PASSWORD_HASH_ALGORITHM = 'argon2id';

const ARGON2_OPTIONS = {
  type: argon2.argon2id,
  memoryCost: 65536,
  timeCost: 3,
  parallelism: 1,
  hashLength: 32,
} as const;

export async function hashPassword(password: string): Promise<string> {
  return argon2.hash(password, ARGON2_OPTIONS);
}

export async function verifyPassword(password: string, hashedPassword: string) {
  if (!hashedPassword) {
    return false;
  }

  if (hashedPassword.startsWith('$argon2')) {
    return argon2.verify(hashedPassword, password);
  }

  if (hashedPassword.startsWith('$2')) {
    return bcrypt.compare(password, hashedPassword);
  }

  return false;
}

export function createTokenId(): string {
  return crypto.randomUUID();
}

export function createIssuedAt(): number {
  return Math.floor(Date.now() / 1000);
}

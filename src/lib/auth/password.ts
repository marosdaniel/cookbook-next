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

let cachedDummyHashPromise: Promise<string> | null = null;

const getDummyHash = (): Promise<string> => {
  if (!cachedDummyHashPromise) {
    cachedDummyHashPromise = argon2.hash(
      'dummy-timing-equalization-password',
      ARGON2_OPTIONS,
    );
  }
  return cachedDummyHashPromise;
};

export function hashPassword(password: string): Promise<string> {
  return argon2.hash(password, ARGON2_OPTIONS);
}

export async function verifyDummyPassword(password: string): Promise<void> {
  try {
    const dummyHash = await getDummyHash();
    await argon2.verify(dummyHash, password);
  } catch {
    // Ignore errors during dummy timing verification
  }
}

export function needsPasswordRehash(hashedPassword: string): boolean {
  if (!hashedPassword) {
    return false;
  }

  if (hashedPassword.startsWith('$2')) {
    return true;
  }

  if (hashedPassword.startsWith('$argon2')) {
    try {
      return argon2.needsRehash(hashedPassword, ARGON2_OPTIONS);
    } catch {
      return false;
    }
  }

  return false;
}

export function verifyPassword(
  password: string,
  hashedPassword: string,
): Promise<boolean> {
  if (!hashedPassword) {
    return Promise.resolve(false);
  }

  if (hashedPassword.startsWith('$argon2')) {
    return argon2.verify(hashedPassword, password);
  }

  if (hashedPassword.startsWith('$2')) {
    return bcrypt.compare(password, hashedPassword);
  }

  return Promise.resolve(false);
}

export function createTokenId(): string {
  return crypto.randomUUID();
}

export function createIssuedAt(): number {
  return Math.floor(Date.now() / 1000);
}

import bcrypt from 'bcryptjs';
import { describe, expect, it } from 'vitest';
import {
  createIssuedAt,
  createTokenId,
  hashPassword,
  PASSWORD_HASH_ALGORITHM,
  PASSWORD_SALT_ROUNDS,
  verifyPassword,
} from './password';

describe('password helpers', () => {
  it('hashes and verifies argon2 passwords', async () => {
    const password = 'super-secret';
    const hashedPassword = await hashPassword(password);

    expect(PASSWORD_HASH_ALGORITHM).toBe('argon2id');
    expect(PASSWORD_SALT_ROUNDS).toBe(12);
    expect(hashedPassword).toContain('$argon2');
    expect(await verifyPassword(password, hashedPassword)).toBe(true);
    expect(await verifyPassword('wrong-password', hashedPassword)).toBe(false);
  });

  it('verifies legacy bcrypt hashes', async () => {
    const password = 'legacy-password';
    const hashedPassword = await bcrypt.hash(password, 2);

    expect(await verifyPassword(password, hashedPassword)).toBe(true);
    expect(await verifyPassword('other-password', hashedPassword)).toBe(false);
  });

  it('returns false for empty and unsupported hashes', async () => {
    expect(await verifyPassword('password', '')).toBe(false);
    expect(await verifyPassword('password', 'not-a-hash')).toBe(false);
  });

  it('creates token ids and issued-at timestamps', () => {
    const tokenId = createTokenId();
    const issuedAt = createIssuedAt();

    expect(tokenId).toEqual(expect.any(String));
    expect(tokenId).toMatch(
      /^[0-9a-f-]{8}-[0-9a-f-]{4}-[0-9a-f-]{4}-[0-9a-f-]{4}-[0-9a-f-]{12}$/i,
    );
    expect(issuedAt).toEqual(expect.any(Number));
    expect(issuedAt).toBeGreaterThan(1_700_000_000);
  });
});

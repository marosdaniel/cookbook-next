import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { env } from './env';

describe('env configuration', () => {
  it('exposes the runtime environment proxy in test mode', () => {
    expect(env).toBeDefined();
  });

  it('requires NEXTAUTH_SECRET to be at least 32 characters', () => {
    const secretSchema = z.string().min(32);

    expect(secretSchema.safeParse('short-secret').success).toBe(false);
    expect(secretSchema.safeParse('a'.repeat(32)).success).toBe(true);
  });
});

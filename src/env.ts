import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

const isTest = Boolean(process.env.VITEST);

const validatedEnv = createEnv({
  server: {
    DATABASE_URL: z.string().min(1),
    NEXTAUTH_SECRET: z.string().min(1),
    NEXTAUTH_URL: z.url().optional(),

    // Redis is optional; src/lib/redis/redis.ts degrades gracefully without it.
    UPSTASH_REDIS_REST_URL: z.string().optional(),
    UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
    KV_REST_API_URL: z.string().optional(),
    KV_REST_API_TOKEN: z.string().optional(),

    EMAIL_HOST: z.string().optional(),
    EMAIL_PORT: z
      .string()
      .regex(/^\d+$/, 'EMAIL_PORT must be a number')
      .optional(),
    EMAIL_SECURE: z.enum(['true', 'false']).optional(),
    EMAIL_USER: z.string().optional(),
    EMAIL_PASSWORD: z.string().optional(),
    EMAIL_FROM: z.string().optional(),
    EMAIL_FROM_NAME: z.string().optional(),

    TRUSTED_PROXY_MODE: z.enum(['vercel']).optional(),
    GRAPHQL_ALLOWLIST_ENFORCE: z.enum(['true', 'false']).optional(),
    VERCEL: z.string().optional(),
    VERCEL_URL: z.string().optional(),
    VERCEL_PROJECT_PRODUCTION_URL: z.string().optional(),
  },
  client: {
    // May be provided without a protocol; getSiteUrl() normalizes it.
    NEXT_PUBLIC_SITE_URL: z.string().optional(),
  },
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
    UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
    KV_REST_API_URL: process.env.KV_REST_API_URL,
    KV_REST_API_TOKEN: process.env.KV_REST_API_TOKEN,
    EMAIL_HOST: process.env.EMAIL_HOST,
    EMAIL_PORT: process.env.EMAIL_PORT,
    EMAIL_SECURE: process.env.EMAIL_SECURE,
    EMAIL_USER: process.env.EMAIL_USER,
    EMAIL_PASSWORD: process.env.EMAIL_PASSWORD,
    EMAIL_FROM: process.env.EMAIL_FROM,
    EMAIL_FROM_NAME: process.env.EMAIL_FROM_NAME,
    TRUSTED_PROXY_MODE: process.env.TRUSTED_PROXY_MODE,
    GRAPHQL_ALLOWLIST_ENFORCE: process.env.GRAPHQL_ALLOWLIST_ENFORCE,
    VERCEL: process.env.VERCEL,
    VERCEL_URL: process.env.VERCEL_URL,
    VERCEL_PROJECT_PRODUCTION_URL: process.env.VERCEL_PROJECT_PRODUCTION_URL,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  },
  // Set SKIP_ENV_VALIDATION=1 for tooling that doesn't need real secrets.
  skipValidation: isTest || Boolean(process.env.SKIP_ENV_VALIDATION),
  emptyStringAsUndefined: true,
});

// Tests stub process.env at runtime (vi.stubEnv), so they need a live view
// instead of the snapshot captured at import time.
export const env: typeof validatedEnv = isTest
  ? (process.env as unknown as typeof validatedEnv)
  : validatedEnv;

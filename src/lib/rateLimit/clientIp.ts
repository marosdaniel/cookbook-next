import { env } from '@/env';

const isValidIp = (value: string | null): value is string => {
  if (!value) {
    return false;
  }

  return value.length <= 45 && /^[0-9a-f:.]+$/i.test(value);
};

const isTrustedProxyMode = () =>
  env.VERCEL === '1' || env.TRUSTED_PROXY_MODE === 'vercel';

export const getRateLimitClientKey = (request: Request): string => {
  if (isTrustedProxyMode()) {
    const trustedIp = request.headers.get('x-real-ip')?.trim() ?? null;

    if (isValidIp(trustedIp)) {
      return trustedIp;
    }
  }

  return 'unknown-client';
};

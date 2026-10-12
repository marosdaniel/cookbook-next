import { env } from '@/env';

export const getSiteUrl = (): string => {
  const rawUrl =
    env.NEXT_PUBLIC_SITE_URL?.trim() ||
    env.VERCEL_PROJECT_PRODUCTION_URL?.trim() ||
    env.VERCEL_URL?.trim();

  if (!rawUrl) {
    return 'http://localhost:3000';
  }

  const formattedUrl =
    rawUrl.startsWith('http://') || rawUrl.startsWith('https://')
      ? rawUrl
      : `https://${rawUrl}`;

  try {
    const parsed = new URL(formattedUrl);
    return parsed.origin;
  } catch {
    return 'http://localhost:3000';
  }
};

export const getSiteUrl = (): string => {
  const rawUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim() ||
    process.env.VERCEL_URL?.trim();

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

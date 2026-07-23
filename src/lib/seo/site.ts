export const getSiteUrl = () => {
  const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();

  if (configuredSiteUrl) {
    return configuredSiteUrl.replace(/\/$/, '');
  }

  const vercelProductionUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();

  if (vercelProductionUrl) {
    return `https://${vercelProductionUrl}`;
  }

  return 'http://localhost:3000';
};

import type { MetadataRoute } from 'next';
import { getSiteUrl } from '@/lib/seo/site';

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/api/',
        '/me/',
        '/login',
        '/signup',
        '/reset-password',
        '/recipes/create',
        '/recipes/*/edit',
      ],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}

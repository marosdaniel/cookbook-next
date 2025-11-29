import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const nextConfig: NextConfig = {
  cacheComponents: false,
  typedRoutes: true,
};

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);

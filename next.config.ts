import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const nextConfig: NextConfig = {
  cacheComponents: false, // change to true once cookie-based locale detection is implemented
  typedRoutes: true,
};

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);

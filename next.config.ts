import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const isDevelopment = process.env.NODE_ENV === 'development';
const cspValue = [
  "default-src 'self'",
  `script-src 'self'${isDevelopment ? " 'unsafe-inline'" : ''}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "frame-ancestors 'none'",
].join('; ');

const securityHeaders = [
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  { key: 'X-XSS-Protection', value: '0' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()',
  },
  { key: 'X-Permitted-Cross-Domain-Policies', value: 'none' },
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
  { key: 'Cross-Origin-Resource-Policy', value: 'same-origin' },
  { key: 'Content-Security-Policy', value: cspValue },
];

const nextConfig: NextConfig = {
  cacheComponents: false,
  typedRoutes: true,
  allowedDevOrigins: ['127.0.0.1', 'localhost'],
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
};

const withNextIntl = createNextIntlPlugin();
const exportedConfig = withNextIntl(nextConfig) as NextConfig;

if (typeof exportedConfig === 'object' && exportedConfig !== null) {
  exportedConfig.headers = nextConfig.headers;
}

export default exportedConfig;

import { defineConfig, devices } from '@playwright/test';

const PORT = 3000;
const HOSTNAME = '127.0.0.1';

// src/env.ts requires NEXTAUTH_SECRET to be at least 32 characters. The CI e2e
// job does not provide one, so fall back to an e2e-only value that is long
// enough. It is only ever passed to the Playwright dev server.
const NEXTAUTH_SECRET_MIN_LENGTH = 32;
const E2E_FALLBACK_NEXTAUTH_SECRET = 'e2e-secret-'.repeat(3);
const configuredNextAuthSecret = process.env.NEXTAUTH_SECRET;
const nextAuthSecret =
  configuredNextAuthSecret &&
  configuredNextAuthSecret.length >= NEXTAUTH_SECRET_MIN_LENGTH
    ? configuredNextAuthSecret
    : E2E_FALLBACK_NEXTAUTH_SECRET;

export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  expect: {
    timeout: 5_000,
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI
    ? [
        ['html', { open: 'never' }],
        ['list'],
        ['github'],
        ['json', { outputFile: 'test-results/e2e-results.json' }],
      ]
    : [['html', { open: 'never' }]],
  use: {
    baseURL: `http://${HOSTNAME}:${PORT}`,
    // Ensure tests run with a consistent locale so i18n text is stable.
    locale: 'en-GB',
    extraHTTPHeaders: {
      'Accept-Language': 'en-GB',
    },
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: `pnpm exec next dev --hostname ${HOSTNAME} --port ${PORT}`,
    // Ensure a valid NEXTAUTH_SECRET (>= 32 characters) is defined for the dev
    // server used by Playwright. It is passed through `env` rather than the
    // shell command, so unusual characters in a configured secret are safe.
    env: { NEXTAUTH_SECRET: nextAuthSecret },
    url: `http://${HOSTNAME}:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
    // Bound teardown: try a clean SIGTERM shutdown, then force-kill after 5s
    // so a stuck dev-server process can't hang the whole CI step.
    gracefulShutdown: { signal: 'SIGTERM', timeout: 5_000 },
  },
});

import { defineConfig, devices } from '@playwright/test';

const PORT = 3000;

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
        ['github'],
        ['json', { outputFile: 'test-results/e2e-results.json' }],
      ]
    : [['html', { open: 'never' }]],
  use: {
    baseURL: `http://127.0.0.1:${PORT}`,
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
    // Ensure NEXTAUTH_SECRET is defined for the dev server used by Playwright.
    // This prevents NextAuth from throwing MissingSecret during e2e runs.
    command: `NEXTAUTH_SECRET=${process.env.NEXTAUTH_SECRET ?? 'test-secret'} pnpm exec next dev --port ${PORT}`,
    url: `http://127.0.0.1:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});

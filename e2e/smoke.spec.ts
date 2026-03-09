import { expect, test } from '@playwright/test';

test.describe('Smoke tests', () => {
  test('renders home page', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('renders login form', async ({ page }) => {
    await page.goto('/login');

    await expect(page.locator('#login-page')).toBeVisible();
    await expect(page.locator('#email')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
    await expect(page.locator('#login-button')).toBeVisible();
  });
});

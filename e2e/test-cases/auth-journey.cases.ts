import { expect, type Page } from '@playwright/test';

export async function shouldCompleteAuthJourney(page: Page): Promise<void> {
  await page.goto('/login', { waitUntil: 'domcontentloaded' });
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.locator('#login-page')).toBeVisible();

  // Navigate from login to signup using the "Create Account" button
  const createAccountBtn = page.locator('[data-testid="create-account"]');
  await expect(createAccountBtn).toBeVisible();
  await Promise.all([
    page.waitForURL(/\/signup($|\?)/, { timeout: 10000 }),
    createAccountBtn.click(),
  ]);

  await expect(page.locator('#sign-up-page')).toBeVisible();
}

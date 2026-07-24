import { expect, type Page } from '@playwright/test';

export async function shouldCompleteAuthJourney(page: Page): Promise<void> {
  await page.goto('/login');
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.locator('#login-page')).toBeVisible();

  // Navigate from login to signup using the "Create Account" button
  const createAccountBtn = page.locator('[data-testid="create-account"]');
  await expect(createAccountBtn).toBeVisible();
  await createAccountBtn.click();

  await expect(page).toHaveURL(/\/signup$/);
  await expect(page.locator('#sign-up-page')).toBeVisible();
}

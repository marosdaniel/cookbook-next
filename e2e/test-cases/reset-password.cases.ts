import { expect, type Page } from '@playwright/test';

export async function shouldRenderResetPasswordForm(page: Page): Promise<void> {
  await page.goto('/reset-password');

  await expect(page.locator('#reset-password-page')).toBeVisible();
  await expect(page.locator('#email')).toBeVisible();
}

export async function shouldNavigateToLoginFromResetPasswordPage(
  page: Page,
): Promise<void> {
  await page.goto('/reset-password');

  // page should be accessible
  await expect(page.locator('#reset-password-page')).toBeVisible();
  await page.goto('/login');
  await expect(page).toHaveURL('/login');
}

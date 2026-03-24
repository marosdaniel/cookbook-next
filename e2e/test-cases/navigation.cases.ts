import { expect, type Page } from '@playwright/test';

export async function shouldNavigateToRecipesPage(page: Page): Promise<void> {
  await page.goto('/');
  await page.goto('/recipes');
  await expect(page).toHaveURL('/recipes');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
}

export async function shouldNavigateToPrivacyPolicyPage(
  page: Page,
): Promise<void> {
  await page.goto('/privacy-policy');
  await expect(page).toHaveURL('/privacy-policy');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
}

export async function shouldNavigateToCookiePolicyPage(
  page: Page,
): Promise<void> {
  await page.goto('/cookie-policy');
  await expect(page).toHaveURL('/cookie-policy');
}

export async function shouldRedirectLoginToHomeAfterVisit(
  page: Page,
): Promise<void> {
  await page.goto('/login');
  await expect(page.locator('#login-page')).toBeVisible();

  // Navigate back to home by clicking the header logo
  await page
    .locator('header')
    .getByRole('link', { name: /Cookbook/i })
    .first()
    .click();

  await expect(page).toHaveURL('/');
  // Verify home page rendered (h1 visible) to ensure successful navigation
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
}

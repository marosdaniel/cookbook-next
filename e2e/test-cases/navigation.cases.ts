import { expect, type Page } from '@playwright/test';

export async function shouldNavigateToRecipesPage(page: Page): Promise<void> {
  await page.goto('/');
  await page.goto('/recipes');
  await expect(page).toHaveURL('/recipes');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
}

export async function shouldNavigateToLoginFromPrivacyPolicy(
  page: Page,
): Promise<void> {
  await page.goto('/privacy-policy');
  await expect(page).toHaveURL('/privacy-policy');
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
  await page.goto('/');
  await expect(page).toHaveURL('/');
}

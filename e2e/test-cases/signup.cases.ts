import { expect, type Page } from '@playwright/test';

export async function shouldRenderSignUpForm(page: Page): Promise<void> {
  await page.goto('/signup');

  await expect(page.locator('#sign-up-page')).toBeVisible();
  await expect(page.locator('#first-name')).toBeVisible();
  await expect(page.locator('#last-name')).toBeVisible();
  await expect(page.locator('#user-name')).toBeVisible();
  await expect(page.locator('#email')).toBeVisible();
  await expect(page.locator('#password')).toBeVisible();
  await expect(page.locator('#confirm-password')).toBeVisible();
  await expect(page.locator('[data-testid="submit-button"]')).toBeVisible();
}

export async function shouldHaveLoginLinkOnSignUpPage(
  page: Page,
): Promise<void> {
  await page.goto('/signup');

  const loginLink = page.locator('[data-testid="login-link"]');
  await expect(loginLink).toBeVisible();
  await loginLink.click();
  await expect(page).toHaveURL('/login');
}

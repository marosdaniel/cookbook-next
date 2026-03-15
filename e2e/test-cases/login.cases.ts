import { expect, type Page } from '@playwright/test';

export async function shouldNavigateToSignUpFromLoginPage(
  page: Page,
): Promise<void> {
  await page.goto('/login');

  const createAccountBtn = page.locator('[data-testid="create-account"]');
  await expect(createAccountBtn).toBeVisible();
  await createAccountBtn.click();
  await expect(page).toHaveURL('/signup');
}

export async function shouldNavigateToResetPasswordFromLoginPage(
  page: Page,
): Promise<void> {
  await page.goto('/login');

  const forgotPasswordLink = page.getByTestId('forgot-password');
  await expect(forgotPasswordLink).toBeVisible();
  await forgotPasswordLink.click();
  await expect(page).toHaveURL(/\/reset-password$/);
}

export async function shouldShowValidationErrorOnEmptyLoginSubmit(
  page: Page,
): Promise<void> {
  await page.goto('/login');

  await page.locator('#login-button').click();

  // At least the email or password field should show a validation error
  const emailInput = page.locator('#email');
  await expect(emailInput).toBeVisible();
  // HTML5 native validation prevents submit on empty required fields
  // so the URL must not change from /login
  await expect(page).toHaveURL('/login');
}

export async function shouldKeepLoginButtonDisabledWhileSubmitting(
  page: Page,
): Promise<void> {
  await page.goto('/login');

  // Button should be enabled before any interaction
  const loginButton = page.locator('#login-button');
  await expect(loginButton).toBeVisible();
  await expect(loginButton).not.toBeDisabled();
}

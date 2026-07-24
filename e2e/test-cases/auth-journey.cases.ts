import { expect, type Page } from '@playwright/test';

export async function shouldCompleteAuthJourney(page: Page): Promise<void> {
  await page.goto('/');

  await page
    .getByTestId('navbar-footer')
    .getByRole('link', { name: /login/i })
    .first()
    .click();

  await expect(page).toHaveURL(/\/login$/);
  await expect(page.locator('#login-page')).toBeVisible();

  await page
    .getByRole('link', { name: /sign up|signup/i })
    .first()
    .click();
  await expect(page).toHaveURL(/\/signup$/);
  await expect(page.locator('#signup-page')).toBeVisible();
}

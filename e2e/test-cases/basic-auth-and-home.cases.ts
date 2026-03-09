import { expect, type Page } from '@playwright/test';

export async function shouldRenderHomePage(page: Page): Promise<void> {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
}

export async function shouldRenderLoginForm(page: Page): Promise<void> {
  await page.goto('/login');

  await expect(page.locator('#login-page')).toBeVisible();
  await expect(page.locator('#email')).toBeVisible();
  await expect(page.locator('#password')).toBeVisible();
  await expect(page.locator('#login-button')).toBeVisible();
}

import { expect, type Page } from '@playwright/test';

export async function shouldRenderNotFoundPage(page: Page): Promise<void> {
  await page.goto('/this-page-does-not-exist');

  await expect(page.locator('[data-testid="notfound-title"]')).toBeVisible();
  await expect(page.locator('[data-testid="notfound-heading"]')).toBeVisible();
  await expect(
    page.locator('[data-testid="notfound-description"]'),
  ).toBeVisible();
}

export async function shouldNavigateHomeFromNotFoundPage(
  page: Page,
): Promise<void> {
  await page.goto('/this-page-does-not-exist');

  const backLink = page.locator('[data-testid="back-home-link"]');
  await expect(backLink).toBeVisible();
  await backLink.click();
  await expect(page).toHaveURL('/');
}

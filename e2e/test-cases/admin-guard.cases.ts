import { expect, type Page } from '@playwright/test';

export async function shouldRedirectAnonymousVisitorFromAdmin(
  page: Page,
): Promise<void> {
  await page.goto('/admin/metadata');

  await expect(page).toHaveURL(/\/login\?callbackUrl=%2Fadmin%2Fmetadata/);
  await expect(page.getByTestId('admin-metadata-page')).toHaveCount(0);
}

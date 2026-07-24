import { expect, type Page } from '@playwright/test';

export async function shouldCompleteDiscoveryJourney(
  page: Page,
): Promise<void> {
  await page.goto('/');

  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

  await page
    .getByRole('link', { name: /recipes/i })
    .first()
    .click();
  await expect(page).toHaveURL(/\/recipes$/);
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

  await page
    .getByTestId('footer-privacy')
    .filter({ visible: true })
    .first()
    .click();
  await expect(page).toHaveURL(/\/privacy-policy$/);
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
}

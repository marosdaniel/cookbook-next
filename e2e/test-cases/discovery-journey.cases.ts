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

  const privacyLink = page
    .getByTestId('footer-privacy')
    .filter({ visible: true })
    .first();
  await expect(privacyLink).toBeVisible();
  await privacyLink.click({ force: true });
  await page.waitForURL(/\/privacy-policy$/);
  await expect(page).toHaveURL(/\/privacy-policy$/);
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
}

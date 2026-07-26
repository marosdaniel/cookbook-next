import { expect, type Page } from '@playwright/test';

export async function shouldExploreRecipesAndPolicyPages(
  page: Page,
): Promise<void> {
  await page.goto('/');

  await page
    .getByRole('link', { name: /recipes/i })
    .first()
    .click();
  await expect(page).toHaveURL(/\/recipes$/);
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

  const cookieLink = page
    .getByTestId('footer-cookie')
    .filter({ visible: true })
    .first();
  await expect(cookieLink).toBeVisible();
  await cookieLink.click({ force: true });
  await page.waitForURL(/\/cookie-policy$/);
  await expect(page).toHaveURL(/\/cookie-policy$/);
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
}

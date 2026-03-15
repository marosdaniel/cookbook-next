import { expect, type Page } from '@playwright/test';

export async function shouldRenderFooterLinks(page: Page): Promise<void> {
  await page.goto('/');

  await expect(
    page.locator('[data-testid="footer-privacy"]').filter({ visible: true }),
  ).toBeVisible();
  await expect(
    page.locator('[data-testid="footer-cookie"]').filter({ visible: true }),
  ).toBeVisible();
}

export async function shouldNavigateToPrivacyPolicyFromFooter(
  page: Page,
): Promise<void> {
  await page.goto('/');

  await page
    .getByTestId('footer-privacy')
    .filter({ visible: true })
    .first()
    .click();
  await expect(page).toHaveURL(/\/privacy-policy$/);
}

export async function shouldNavigateToCookiePolicyFromFooter(
  page: Page,
): Promise<void> {
  await page.goto('/');

  await page
    .getByTestId('footer-cookie')
    .filter({ visible: true })
    .first()
    .click();
  await expect(page).toHaveURL(/\/cookie-policy$/);
}

export async function shouldRenderFooterCopyright(page: Page): Promise<void> {
  await page.goto('/');

  const copyright = page
    .locator('[data-testid="footer-copyright"]')
    .filter({ visible: true });
  await expect(copyright).toBeVisible();
  await expect(copyright).toContainText('Cookbook');
}

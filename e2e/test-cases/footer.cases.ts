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

  const privacyLink = page
    .getByTestId('footer-privacy')
    .filter({ visible: true })
    .first();
  await expect(privacyLink).toBeVisible();
  await privacyLink.click({ force: true });
  await page.waitForURL(/\/privacy-policy$/);
  await expect(page).toHaveURL(/\/privacy-policy$/);
}

export async function shouldNavigateToCookiePolicyFromFooter(
  page: Page,
): Promise<void> {
  await page.goto('/');

  const cookieLink = page
    .getByTestId('footer-cookie')
    .filter({ visible: true })
    .first();
  await expect(cookieLink).toBeVisible();
  await cookieLink.click({ force: true });
  await page.waitForURL(/\/cookie-policy$/);
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

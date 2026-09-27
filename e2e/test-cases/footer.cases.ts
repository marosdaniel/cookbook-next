import { expect, type Page } from '@playwright/test';

export async function shouldRenderFooterLinks(page: Page): Promise<void> {
  await page.goto('/');

  await expect(page.getByTestId('footer-privacy')).toBeVisible();
  await expect(page.getByTestId('footer-cookie')).toBeVisible();
  await expect(page.getByTestId('footer-privacy')).toHaveCount(1);
  await expect(page.getByTestId('footer-cookie')).toHaveCount(1);
}

export async function shouldNavigateToPrivacyPolicyFromFooter(
  page: Page,
): Promise<void> {
  await page.goto('/');

  const privacyLink = page.getByTestId('footer-privacy');
  await expect(privacyLink).toBeVisible();
  await privacyLink.click();
  await page.waitForURL(/\/privacy-policy$/);
  await expect(page).toHaveURL(/\/privacy-policy$/);
}

export async function shouldNavigateToCookiePolicyFromFooter(
  page: Page,
): Promise<void> {
  await page.goto('/');

  const cookieLink = page.getByTestId('footer-cookie');
  await expect(cookieLink).toBeVisible();
  await cookieLink.click();
  await page.waitForURL(/\/cookie-policy$/);
  await expect(page).toHaveURL(/\/cookie-policy$/);
}

export async function shouldRenderFooterCopyright(page: Page): Promise<void> {
  await page.goto('/');

  const copyright = page.getByTestId('footer-copyright');
  await expect(copyright).toBeVisible();
  await expect(copyright).toHaveCount(1);
  await expect(copyright).toContainText('Cookbook');
}

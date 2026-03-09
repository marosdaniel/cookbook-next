import { test } from '@playwright/test';
import {
  shouldNavigateToCookiePolicyFromFooter,
  shouldNavigateToPrivacyPolicyFromFooter,
  shouldRenderFooterCopyright,
  shouldRenderFooterLinks,
} from '../test-cases/footer.cases';

test.describe('Footer suite', () => {
  test('TC-017: footer links are visible on home page', async ({ page }) => {
    await shouldRenderFooterLinks(page);
  });

  test('TC-018: footer privacy link navigates to privacy policy', async ({
    page,
  }) => {
    await shouldNavigateToPrivacyPolicyFromFooter(page);
  });

  test('TC-019: footer cookie link navigates to cookie policy', async ({
    page,
  }) => {
    await shouldNavigateToCookiePolicyFromFooter(page);
  });

  test('TC-020: footer shows copyright text', async ({ page }) => {
    await shouldRenderFooterCopyright(page);
  });
});

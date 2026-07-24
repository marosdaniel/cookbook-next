import { test } from '@playwright/test';
import { shouldExploreRecipesAndPolicyPages } from '../test-cases/content-discovery.cases';

test.describe('Content discovery suite', () => {
  test('TC-014: can explore recipes and cookie policy from the home page', async ({
    page,
  }) => {
    await shouldExploreRecipesAndPolicyPages(page);
  });
});

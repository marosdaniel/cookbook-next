import { test } from '@playwright/test';
import { shouldCompleteDiscoveryJourney } from '../test-cases/discovery-journey.cases';

test.describe('Discovery journey suite', () => {
  test('TC-012: can complete a basic discovery journey from home to recipes to privacy policy', async ({
    page,
  }) => {
    await shouldCompleteDiscoveryJourney(page);
  });
});

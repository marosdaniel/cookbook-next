import { test } from '@playwright/test';
import { shouldCompleteAuthJourney } from '../test-cases/auth-journey.cases';

test.describe('Auth journey suite', () => {
  test('TC-013: can move from login to signup through the auth flow', async ({
    page,
  }) => {
    await shouldCompleteAuthJourney(page);
  });
});

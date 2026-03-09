End-to-end (E2E) tests — Cookbook Next
======================================

Overview
--------
This project uses Playwright for end-to-end (E2E) testing. Tests live in the `e2e/` folder and follow a small convention to keep tests maintainable and stable:

- `e2e/test-cases/` — reusable test-case functions that perform atomic checks (export functions like `shouldRenderHomePage(page)`).
- `e2e/suites/` — high-level test suites that call the test-case functions and define the `test()` wrappers.

This structure keeps assertions reusable and easy to compose.

Quick start
-----------
Install dependencies and Playwright browsers (one-time):

```bash
pnpm install
pnpm exec playwright install --with-deps chromium
```

Run E2E tests (headless):

```bash
pnpm test:e2e
```

Run Playwright UI (interactive) test runner:

```bash
pnpm test:e2e:ui
```

Run in CI-clean mode (forces Playwright to start a fresh dev server):

```bash
CI=1 pnpm test:e2e
```

Playwright config highlights
---------------------------
The project ships `playwright.config.ts` which configures:

- `baseURL` pointing to the local dev server (`http://127.0.0.1:3000`).
- `webServer` section that runs `pnpm exec next dev --port 3000` when tests start.
- reporters: HTML, GitHub, and `json` (for CI summaries).
- artifacts: `trace`, `screenshot` and `video` policy on failure.

Writing tests
-------------
Prefer the `test-cases` → `suites` pattern:

- Test-case functions should accept a Playwright `page` and perform a single intent (render check, navigation, user flow step).
- Suite files (under `e2e/suites`) import test-case functions and call them inside `test(...)` wrappers.

Example test-case (e2e/test-cases/basic-auth-and-home.cases.ts):

```ts
import { expect, type Page } from '@playwright/test';

export async function shouldRenderHomePage(page: Page) {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
}
```

Example suite (e2e/suites/smoke.spec.ts):

```ts
import { test } from '@playwright/test';
import { shouldRenderHomePage } from '../test-cases/basic-auth-and-home.cases';

test('Home renders', async ({ page }) => {
  await shouldRenderHomePage(page);
});
```

Selector guidance
-----------------
- Prefer semantic selectors: `getByRole`, `getByLabel`, `getByPlaceholder`.
- Use stable attributes for brittle UI text (e.g. `data-testid` or element `id`) when translations/labels change.
- Avoid relying on translation text for assertions; use `id` or `data-testid` for critical flows.

Running and debugging locally
-----------------------------
- Use `pnpm test:e2e:ui` to open Playwright's test runner where you can run individual tests interactively.
- Use `--debug` or `--headed` flags to see the browser.
- Use `trace: 'on-first-retry'` to collect traces; open with `npx playwright show-trace <trace.zip>`.

CI integration
--------------
- The GitHub Actions workflow installs Playwright browsers and runs `pnpm test:e2e` in a dedicated `e2e` job.
- Test artifacts are uploaded (`playwright-report/`, `test-results/`) and published to GitHub Pages alongside the coverage site.
- The workflow also generates a small summary from the `json` reporter output for quick visibility in PR checks.

Artifacts and reports
---------------------
- Local HTML report: `playwright-report/index.html` (open locally after running tests).
- Raw results and artifacts (videos, screenshots): `test-results/`.
- CI: the workflow uploads artifacts and publishes a combined reports site (`reports/`) to GitHub Pages. See the README links.

Best practices
--------------
- Keep E2E suites small and focused (smoke + critical user journeys).
- Mock external services where possible (email, payments) to avoid flakiness.
- Use `CI=1` when running in automated environments to avoid reusing stale dev servers.
- Keep tests idempotent and avoid relying on external state.

Where to add tests
------------------
- Add reusable checks into `e2e/test-cases`.
- Add suites to `e2e/suites` (these are discovered by Playwright).

Troubleshooting
---------------
- If Playwright complains about cross-origin requests during dev runs, ensure `allowedDevOrigins` in `next.config.ts` includes `127.0.0.1` and `localhost` (already configured in this project).
- If tests fail only on CI, re-run with `CI=1 pnpm test:e2e` locally to reproduce server behavior.

Contact / Help
--------------
If you need more examples or a test template for a specific flow (auth, recipe create, upload, etc.), tell me which flow and I will scaffold a test-case + suite for it.

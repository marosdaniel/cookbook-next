# CI/CD Pipeline Documentation

This document explains the GitHub Actions CI/CD pipeline defined in `.github/workflows/deploy.yml`. It covers what the pipeline does, when it runs, how each job works, and why these automations exist.

---

## Table of Contents

1. [Overview](#overview)
2. [Trigger Conditions](#trigger-conditions)
3. [Concurrency Control](#concurrency-control)
4. [Job Dependency Graph](#job-dependency-graph)
5. [Jobs in Detail](#jobs-in-detail)
   - [quality-checks](#1-quality-checks)
   - [e2e](#2-e2e)
   - [test-coverage](#3-test-coverage)
   - [deploy-coverage-report](#4-deploy-coverage-report)
   - [deploy-production](#5-deploy-production)
   - [semantic-release](#6-semantic-release)
6. [Secrets & Environment Variables](#secrets--environment-variables)
7. [Why This Pipeline Exists](#why-this-pipeline-exists)

---

## Overview

The pipeline is named **"Deploy to Vercel Production"** and automates the full software delivery lifecycle:

- **Validates** code quality (lint, types, unit tests, integration tests)
- **Tests** the app end-to-end in a real browser via Playwright
- **Measures** code coverage and publishes the report
- **Deploys** the app to Vercel production
- **Releases** a new semantic version and updates the changelog

Every change that reaches `main` goes through all of these gates automatically — no manual steps required.

---

## Trigger Conditions

The workflow runs on three events:

| Event | When |
|-------|------|
| `push` to `main` | When code is merged into the main branch |
| `pull_request` targeting `main` | When a PR is opened, updated, or synchronized |
| `workflow_dispatch` | Manually triggered from the GitHub Actions UI |

### Path filters (`paths-ignore`)

The workflow is smart about what actually warrants a run. It **skips** triggering when only these files change:

- `**.md` — documentation files
- `docs/**` — docs folder
- `.vscode/**` — editor settings
- `LICENSE`, `.gitignore`, `.env.example` — project metadata
- `.github/**` (except `!.github/workflows/**`) — GitHub config files, but **not** workflow files themselves

This avoids burning CI minutes on doc-only changes, while still re-running if a workflow file itself is edited.

---

## Concurrency Control

```yaml
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: ${{ github.ref != 'refs/heads/main' }}
```

This prevents redundant pipeline runs:

- **On PRs**: if you push two commits in quick succession, the first run is automatically cancelled when the second starts. Only the latest code is tested.
- **On `main`**: runs are never cancelled mid-flight. A deployment in progress always completes, ensuring a stable production state.

---

## Job Dependency Graph

The jobs form a directed acyclic graph (DAG). They do not all run sequentially — some run in parallel to save time.

```
quality-checks
    ├── e2e ──────────────────────────┐
    │                                 ├── deploy-coverage-report
    └── test-coverage ────────────────┘
              │
              └── (used by deploy-coverage-report)

quality-checks + e2e
    └── deploy-production
              └── semantic-release
```

**Key insight**: `e2e` and `test-coverage` both run **in parallel** after `quality-checks` passes. This makes the pipeline faster — E2E tests and coverage collection don't wait on each other.

---

## Jobs in Detail

### 1. `quality-checks`

**Purpose**: Gate that ensures the codebase is clean and all fast tests pass before anything else runs.

**Runs on**: `ubuntu-latest`

**Skip mechanism**: If the commit message contains `[skip ci]` or `[ci skip]`, this job (and therefore the entire pipeline) is skipped. Useful for trivial commits like bumping a version number.

**Steps:**

| Step | Command | What it does |
|------|---------|--------------|
| Checkout code | `actions/checkout@v6` | Clones the repository at the triggering commit |
| Setup pnpm | `pnpm/action-setup@v5` | Installs pnpm v9 as the package manager |
| Setup Node.js | `actions/setup-node@v6` | Installs Node.js 22 and restores the pnpm dependency cache |
| Install dependencies | `pnpm install` | Installs all project dependencies (uses cache if available) |
| Run Biome Lint | `pnpm lint:fix` | Runs Biome static analysis and auto-fixes formatting issues |
| Run Type Check | `pnpm run typecheck` | Runs `tsc --noEmit` to catch TypeScript type errors |
| Run Unit Tests | `pnpm test:unit` | Runs Vitest unit tests |
| Run Integration Tests | `pnpm test:integration` | Runs Vitest integration tests (these may require `DATABASE_URL`) |

**Why this job matters**: Catching lint errors, type errors, and broken tests at this stage is cheap. It takes ~1–2 minutes and prevents broken code from ever reaching deployment or expensive E2E test runs.

---

### 2. `e2e`

**Purpose**: Run end-to-end browser tests using Playwright against the built application.

**Depends on**: `quality-checks` (only runs if quality checks pass)

**Steps:**

| Step | What it does |
|------|--------------|
| Checkout + setup | Same as `quality-checks` |
| Install Playwright Browsers | Downloads Chromium and its OS-level dependencies |
| Run Playwright tests | Executes the full E2E test suite (`pnpm test:e2e`) |
| Generate E2E Summary | Parses `test-results/e2e-results.json` and appends a formatted table to the GitHub Actions step summary (visible in the workflow run UI) |
| Upload Playwright report | Uploads `playwright-report/` and `test-results/` as a GitHub artifact for later download and inspection |

**The summary step uses `if: always()`** — it runs even if the tests failed, so you always get a report of what happened.

**Why this job matters**: Unit and integration tests operate on isolated units of code. E2E tests verify that the real application — routing, UI, database interactions, authentication — actually works as a whole from a user's perspective.

---

### 3. `test-coverage`

**Purpose**: Measure what percentage of the source code is exercised by tests.

**Depends on**: `quality-checks`

**Runs in parallel with**: `e2e`

**Steps:**

| Step | What it does |
|------|--------------|
| Checkout + setup | Same as `quality-checks` |
| Run Coverage | Runs `pnpm test:coverage` (Vitest with `--coverage`), producing `coverage/coverage-summary.json` and an HTML report |
| Generate Coverage Summary | Parses the JSON and appends a coverage table (Lines, Statements, Functions, Branches %) to the step summary |
| Upload coverage artifact | Stores the `coverage/` directory as a GitHub artifact named `coverage-report` |

**Why this job matters**: Code coverage gives a quantitative signal about test thoroughness. A sudden drop in coverage on a PR is a warning that new code was added without corresponding tests.

---

### 4. `deploy-coverage-report`

**Purpose**: Combine the coverage and E2E reports into a single static site and publish it to GitHub Pages.

**Depends on**: both `test-coverage` and `e2e` (waits for both to complete)

**Permissions required**: `pages: write`, `id-token: write` (for OIDC-based GitHub Pages deployment)

**Steps:**

| Step | What it does |
|------|--------------|
| Download coverage artifact | Downloads the `coverage-report` artifact into `artifacts/coverage/` |
| Download E2E artifact | Downloads the `playwright-report` artifact into `artifacts/e2e/` |
| Build reports site | Creates a `reports/` directory, copies the coverage HTML and Playwright HTML report into it, and generates an `index.html` landing page linking to both |
| Add published links to summary | Appends links to the live GitHub Pages URLs in the step summary |
| Upload to GitHub Pages | Packages the `reports/` directory as a Pages artifact |
| Deploy to GitHub Pages | Deploys the artifact to `https://marosdaniel.github.io/cookbook-next/` |

**Published URLs:**
- `https://marosdaniel.github.io/cookbook-next/coverage/` — interactive coverage report
- `https://marosdaniel.github.io/cookbook-next/e2e/` — Playwright HTML report with traces and screenshots

**Why this job matters**: Instead of digging through CI logs or downloading zip files, anyone with access to the repo can open a browser and inspect coverage gaps or failed E2E test traces with full visual context.

---

### 5. `deploy-production`

**Purpose**: Build and deploy the application to Vercel production.

**Depends on**: `quality-checks` and `e2e`

**Only runs on**: `main` branch (`if: github.ref == 'refs/heads/main'`). PRs never trigger a production deployment.

**Steps:**

| Step | What it does |
|------|--------------|
| Checkout + setup | Same as above |
| Install Vercel CLI | Installs the latest `vercel` CLI globally |
| Debug - Check Vercel Token | Fails fast with a clear error message if `VERCEL_TOKEN` secret is missing or empty |
| Pull Vercel Environment | Runs `vercel pull` to download production environment config (`.vercel/` directory) |
| Install dependencies | `pnpm install` with `DATABASE_URL` available (required for Prisma client generation) |
| Run Prisma Migrate Deploy | Runs pending database migrations against the production database. This is safe to run in CI because `migrate deploy` only applies already-committed migrations — it never generates new ones |
| Build Project Artifacts | Runs `vercel build --prod`, which executes the Next.js production build inside Vercel's build environment |
| Deploy Project Artifacts | Runs `vercel deploy --prebuilt --prod`, uploading the pre-built artifacts. Using `--prebuilt` avoids building twice |

**Why this job matters**: This is the continuous delivery part of the pipeline. Every merge to `main` that passes all tests is automatically shipped to production — no manual deploy button needed. The separation of `build` and `deploy` steps (via `--prebuilt`) also means the actual build happens in a reproducible CI environment rather than inside Vercel's opaque build system.

---

### 6. `semantic-release`

**Purpose**: Automatically determine the next version number, create a GitHub release, and update the changelog — based entirely on commit message conventions.

**Depends on**: `deploy-production` (only runs after a successful production deployment)

**Permissions required**: `contents: write`, `issues: write`, `pull-requests: write`

**Key detail**: `fetch-depth: 0` is set on the checkout step. This is required because semantic-release needs the full git history to determine what has changed since the last release.

**How it works**: semantic-release reads all commits since the last tag, analyses their prefixes (`feat:`, `fix:`, `chore:`, `BREAKING CHANGE:`, etc.), and:

1. Determines the next [semver](https://semver.org/) version (`MAJOR.MINOR.PATCH`)
2. Creates a git tag
3. Publishes a GitHub Release with a generated changelog

**Version bumping rules** (conventional commits):

| Commit prefix | Version bump |
|---------------|-------------|
| `fix:` | Patch (`1.0.0` → `1.0.1`) |
| `feat:` | Minor (`1.0.0` → `1.1.0`) |
| `BREAKING CHANGE:` | Major (`1.0.0` → `2.0.0`) |
| `chore:`, `docs:`, `style:` | No release |

**Why this job matters**: Manual versioning is error-prone and easy to forget. With semantic-release, the git history itself becomes the source of truth for versioning. Every release is traceable, reproducible, and consistently formatted.

---

## Secrets & Environment Variables

The pipeline relies on the following secrets configured in the repository's GitHub Settings → Secrets:

| Secret | Used in | Purpose |
|--------|---------|---------|
| `DATABASE_URL` | `quality-checks`, `test-coverage`, `deploy-production` | Connection string for the Neon PostgreSQL database. Required by Prisma for type generation and migrations |
| `VERCEL_TOKEN` | `deploy-production` | Personal access token for authenticating with the Vercel API |
| `VERCEL_ORG_ID` | `deploy-production` | Identifies the Vercel organization/team |
| `VERCEL_PROJECT_ID` | `deploy-production` | Identifies the specific Vercel project to deploy to |
| `GITHUB_TOKEN` | `semantic-release` | Automatically provided by GitHub Actions. Used by semantic-release to create tags and releases |

---

## Why This Pipeline Exists

Without automation, the equivalent manual process for every merge would be:

1. Pull the latest code
2. Run lint and fix issues
3. Run the type checker
4. Run unit and integration tests
5. Run E2E tests and check results
6. Collect coverage and note the numbers
7. Run database migrations
8. Build the app
9. Deploy to Vercel
10. Create a release tag and write changelog entry

That is ~10 manual steps, each of which can be forgotten, skipped under time pressure, or done inconsistently between developers. The pipeline eliminates every one of them.

**Concrete benefits:**

- **Broken code never reaches production** — all tests must pass before deployment
- **Database migrations are always applied** before the new code is live, keeping the schema and application in sync
- **Test results are always visible** — no need to ask "did the tests pass?" on a PR; the summary is right there
- **Coverage regressions are caught** before merge, not after
- **Releases are consistent and automatic** — the version history reflects exactly what changed and when
- **PRs get fast feedback** — parallel jobs mean the total pipeline time is shorter than sequential execution would be
- **Redundant runs are cancelled** — the concurrency setting means pushing a quick follow-up commit doesn't burn minutes on an outdated run

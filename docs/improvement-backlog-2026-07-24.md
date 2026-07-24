# Cookbook Next - Improvement Backlog

Audit date: 2026-07-24

Scope: Next.js App Router, SSR and caching, application architecture, GraphQL
route and schema, cookies and auth, security, data access, DX, and product
features.

This is a prioritized backlog, not a claim that every item must be implemented.
Items marked `Decision` need a product or deployment decision before coding.

## Already Completed

| Area | Completed improvement |
|---|---|
| Deployment | Vercel is pinned to the Next.js build, uses the frozen pnpm lockfile, and Git deployments are enabled. |
| SSR and SEO | Recipe data, JSON-LD, canonical slug redirects, metadata, sitemap, and robots are server-side or Next metadata routes. |
| Structured data | Recipe JSON-LD now includes canonical URL, dates, category, cuisine, ratings, and validated YouTube VideoObject data. |
| Metadata | Public static pages have canonical metadata; SEO site URL is separate from auth URL. |
| Locale payload | Only the active locale messages are sent to the client; next-intl uses the same locale source. |
| Rendering | Recipe lookup is deduplicated with React `cache`; duplicate root-layout `connection()` calls were removed. |
| Error handling | Missing recipes use `notFound()`; unexpected lookup failures are rethrown. |
| GraphQL protection | Apollo Armor depth, cost, alias, directive, token, batching, error masking, field auth, and limit guards are present. |
| Auth and passwords | Argon2id is used for new passwords, legacy bcrypt verification remains, and sensitive GraphQL operations use strict rate limiting. |

## P0 - Security and Correctness

| ID | Area | Improvement | Why it matters / evidence | Suggested implementation | Main files | Size |
|---|---|---|---|---|---|---|
| P0-1 | GraphQL auth | ✅ Authorize the parsed operation, not only client-supplied `operationName` | Apollo's resolved `requestContext.operationName` is now used; missing names and unconfigured operations are rejected. | `assertGraphQLOperationAuthorized()` centralizes the policy; resolver ownership checks remain in place. | `src/app/api/graphql/route.ts`, `src/lib/graphql/authorization.ts`, `src/lib/graphql/operationsConfig.ts` | M |
| P0-2 | Rate limiting | Do not fail open for sensitive operations | `enforceRateLimit()` logs Redis errors and continues without throttling. | Fail closed for strict operations, or add a conservative local fallback; add timeout/error tests. | `src/app/api/graphql/route.ts`, `src/lib/rateLimit/rateLimit.ts` | M |
| P0-3 | Rate limiting | Define a trusted proxy policy for client IPs | `x-forwarded-for` and `x-real-ip` are accepted directly; this is spoofable outside a trusted proxy. | Use platform-trusted headers only in Vercel mode; configure a trusted proxy boundary for self-hosting. | `src/app/api/graphql/route.ts`, deployment config | S/M |
| P0-4 | GraphQL input | Bound request body size before parsing | The route reads the entire request body before applying GraphQL validation. | Reject oversized bodies at the route boundary and configure a documented maximum. | `src/app/api/graphql/route.ts`, tests | S |
| P0-5 | Auth | Make session authorization revocable | JWT role and identity claims remain valid after role changes, password changes, or account deletion. | Add `sessionVersion`/`authVersion` to `User`, include it in JWT, and invalidate on security changes. | `prisma/schema.prisma`, `src/lib/auth/auth.config.ts`, `src/lib/services/UserService.ts` | M |
| P0-6 | Auth | Make `rememberMe` affect the real session lifetime | `token.maxAge` is an application claim; NextAuth has a fixed 14-day `session.maxAge`. | Implement supported per-login expiry, or remove the misleading two-hour behavior from the UI. Add cookie-level integration tests. | `src/lib/auth/auth.config.ts`, `src/lib/auth/auth.ts`, `src/app/(auth)/login/LoginForm.tsx` | M |
| P0-7 | CSP | Verify and tighten the deployed CSP | `next.config.ts` still allows both `unsafe-inline` and `unsafe-eval`; the audit text says `unsafe-eval` was removed. | Verify production headers, remove `unsafe-eval` if compatible, then migrate inline scripts/styles to nonce or hash based policy. | `next.config.ts`, `src/app/layout.tsx`, deployment checks | M/L |
| P0-8 | Secrets | Automate environment and secret safety checks | Local env files contain high-impact credentials by nature and are easy to copy or leak. | Keep secrets outside tracked files, add secret scanning and CI env validation, and document rotation without printing values. | `.gitignore`, CI config, `docs/CICD.md` | S |

## P1 - Next.js, GraphQL, and Architecture

| ID | Area | Improvement | Why it matters / evidence | Suggested implementation | Main files | Size |
|---|---|---|---|---|---|---|
| P1-1 | Next rendering | Move locale from cookie-only routing to URL-based locale segments | Root `cookies()` makes every route request-dependent and blocks simple ISR/SSG; `next.config.ts` disables `cacheComponents`. | Introduce `src/app/[locale]/`, validate locale params, generate locale-aware canonical and `hreflang`, keep cookie only as a preference/redirect hint. | `src/app/layout.tsx`, `src/app/[locale]/**`, `src/i18n/**`, `src/proxy.ts` | L |
| P1-2 | Next caching | Define an explicit cache policy per route family | Public pages, personalized pages, GraphQL, and metadata routes currently have different cache needs but no single policy document. | Classify routes as static/ISR/request-dynamic/no-store; add route-level `revalidate`, `dynamic`, or `Cache-Control` only where safe. | `src/app/**`, `next.config.ts`, `docs` | M |
| P1-3 | GraphQL transport | Add `Cache-Control: no-store` and `Vary` to GraphQL responses | The endpoint serves personalized data and relies on implicit intermediary behavior. | Set `Cache-Control: no-store` for POST/error responses and `Vary: Cookie, Authorization`; keep cacheable anonymous reads separate if ever needed. | `src/app/api/graphql/route.ts` | S |
| P1-4 | GraphQL persisted queries | Implement real APQ or an allowlist | Current code verifies a hash only when a full query is supplied; it is not an APQ flow or operation allowlist. | Add Apollo persisted query link/client support and server lookup by hash, or maintain a server-side hash-to-query registry. | `src/app/api/graphql/route.ts`, `src/lib/graphql/protection.ts`, `src/lib/apollo/client.ts` | M |
| P1-5 | GraphQL auth | Replace hardcoded `User.email` field auth with a declarative policy | Field protection is currently special-cased in one plugin and will not scale safely to new private fields. | Add a field policy map or schema directive and test public/private contracts for every user-scoped field. | `src/app/api/graphql/route.ts`, `src/lib/graphql/schema/**`, resolvers | M |
| P1-6 | GraphQL privacy | Remove arbitrary caller IDs from private user queries | `getFavoriteRecipes(userId: ID!)` accepts a supplied user ID; the intended public/private contract is not explicit. | Resolve private resources from `context.userId`; expose separate public fields/types if public profiles are intended. | `src/lib/graphql/typeDefs/**`, user resolvers, operations config | M |
| P1-7 | GraphQL schema | Generate resolver/client types from SDL | SDL and TypeScript types can drift, especially around nullable JSON and auth fields. | Introduce GraphQL Code Generator in CI and replace manually duplicated operation types incrementally. | `src/lib/graphql/**`, `src/lib/apollo/**`, CI config | M |
| P1-8 | GraphQL observability | Add structured operation metrics and correlation IDs | Development logging is console-only; production failures are masked without a durable trace. | Emit request ID, operation name, duration, status, user class, and error code without query variables or secrets. | `src/app/api/graphql/route.ts`, logging/monitoring module | M |
| P1-9 | Pagination | Replace limit-only lists with cursor pagination | `getRecipes()` uses `take` only; list growth will make results incomplete and unstable. | Add opaque cursor, stable `(createdAt,id)` ordering, `pageInfo`, and Apollo merge policy; add Load More/infinite scroll UI. | `prisma/schema.prisma`, GraphQL SDL, `RecipeService.ts`, `RecipesPage.tsx`, Apollo client | L |
| P1-10 | Search | Add database-backed full-text/trigram search | Recipe search is title `contains` and does not cover description, ingredients, or tips; a normal title index does not optimize contains well. | Choose `pg_trgm` or `tsvector` migration, rank results, and define searchable fields and language behavior. | `prisma/migrations/**`, `RecipeService.ts`, GraphQL filter types | L |
| P1-11 | Cache | Centralize cache keys and invalidation | Recipe list cache keys include arbitrary filter JSON, while mutations invalidate only selected keys; stale filtered lists can survive. | Create a cache-key module, tag/version list keys, and invalidate by namespace/version after mutations. | `src/lib/services/RecipeService.ts`, `src/lib/services/UserService.ts`, `src/lib/redis/redis.ts` | M |
| P1-12 | Data access | Separate list projections from detail projections | `getRecipes()` includes full ingredients and preparation steps for lists, increasing payload and DB work. | Use explicit Prisma `select` for cards/list pages; fetch full relations only for detail pages. | `src/lib/services/RecipeService.ts`, GraphQL recipe resolvers | M |
| P1-13 | Data model | Normalize taxonomy JSON or add a compatibility boundary | Category, cuisine, labels, and other metadata are JSON snapshots, limiting referential integrity, indexing, and admin editing. | Preserve snapshots for compatibility, introduce typed metadata tables/IDs, and migrate reads/writes behind a service boundary. | `prisma/schema.prisma`, `src/lib/data/metadata.ts`, recipe utils/resolvers | L |
| P1-14 | Runtime | Make Prisma/Redis timeout behavior explicit and observable | Prisma has a timeout proxy and Redis has a circuit breaker, but fallback behavior can hide latency and stale-cache patterns. | Export timeout metrics, distinguish cache miss from backend failure, and define per-operation budgets. | `src/lib/prisma/prismaTimeout.ts`, `src/lib/redis/redis.ts`, GraphQL route | M |
| P1-15 | Dependencies | Reassess beta auth and redundant packages | `next-auth` is still `5.0.0-beta.32`; `react-icons` and `@mantine/nprogress` coexist with other UI/progress choices. | Verify stable Auth.js compatibility before migrating; remove unused packages only after import/build checks. | `package.json`, auth files, icon imports, providers | S/M |
| P1-16 | Type safety | Enable `noImplicitAny` | `tsconfig.json` explicitly disables it despite `strict` being enabled. | Run a separate noImplicitAny report, fix by module, then turn it on in CI. | `tsconfig.json`, affected TypeScript files | M |
| P1-17 | Routing | Preserve query parameters in auth redirects | Proxy uses only `pathname` for `callbackUrl`, losing filters and tabs. | Encode `pathname + search`; add a regression test for a protected URL with query parameters. | `src/proxy.ts`, `src/proxy.test.ts` | S |
| P1-18 | Authorization | Share route and operation policy definitions | `/me` is protected in proxy, GraphQL uses a separate allowlist, and future admin routes have no shared policy. | Define route-family roles once; keep server layout guards authoritative and use proxy as early rejection. | `src/proxy.ts`, `src/types/routes.ts`, admin layouts, operations config | M |

## P1 - Cookies, Locale, and Auth UX

| ID | Area | Improvement | Why it matters / evidence | Suggested implementation | Main files | Size |
|---|---|---|---|---|---|---|
| C-1 | Locale cookie | Centralize cookie writing and define attributes in one place | Client code writes `cookbook-locale` directly, while server reads it separately. | Use one helper for `path`, `max-age`, `SameSite`, and optional `Secure`; add tests for expiry and invalid values. | `src/lib/locale/locale.client.ts`, `locale.server.ts` | S |
| C-2 | Locale cookie | Decide whether locale should be user preference or URL identity | Cookie locale makes crawlers and shared URLs see different languages at the same URL. | Prefer URL locale for SEO; if cookie remains, document that it is personalization and keep canonical URLs locale-neutral. | `src/i18n/**`, `src/app/layout.tsx`, SEO helpers | M/L |
| C-3 | Auth cookies | Verify cookie security attributes in production | Session security depends on NextAuth defaults and deployment configuration, not an explicit project contract. | Add an integration check for `HttpOnly`, `Secure`, `SameSite`, expiry, and host/path scope. | Auth config, Playwright tests, deployment config | S/M |
| C-4 | Consent | Separate essential auth/locale cookies from optional analytics cookies | The cookie policy page exists, but there is no visible consent state or enforcement boundary for future analytics. | Add a consent model before adding analytics; never gate essential auth/session cookies behind optional consent. | `src/app/cookie-policy/**`, providers, analytics integration | M |
| C-5 | Session | Add forced logout/session inventory | JWT-only sessions cannot be listed or revoked per device. | Add session version for a minimal solution, or a DB session model for device/session management. | Auth config, Prisma schema, profile UI | M/L |

## P2 - Reliability, DX, and Product Architecture

| ID | Area | Improvement | Why it matters / evidence | Suggested implementation | Main files | Size |
|---|---|---|---|---|---|---|
| P2-1 | Testing | Add GraphQL route integration tests | Unit tests cover services, but request parsing, rate limiting, APQ, auth plugins, headers, and masking are high-risk integration behavior. | Use a test Apollo server/route harness with anonymous, authenticated, malformed, oversized, and unauthorized requests. | `src/app/api/graphql/route.test.ts`, GraphQL test utilities | M |
| P2-2 | Testing | Add metadata route contract tests | Sitemap/robots exist, but canonical URL and recipe inclusion can regress with schema changes. | Test static URLs, slug fallback, dates, URL fallback, and no private routes. | `src/app/sitemap.test.ts`, `robots.test.ts` | S |
| P2-3 | Monitoring | Add error monitoring and tracing | Production error masking is correct for clients but currently reduces diagnosis without an external event stream. | Add Sentry/GlitchTip or structured Vercel logs with PII scrubbing and GraphQL operation tags. | `src/app/api/graphql/route.ts`, instrumentation, deployment config | S/M |
| P2-4 | CI | Add dependency, secret, schema, and migration gates | CI should fail before deploy on vulnerable dependencies, generated-client drift, or unapplied migrations. | Run `pnpm audit`, typecheck, lint, tests, Prisma validate, and migration status in CI; add secret scanning. | `.github/workflows/**`, `docs/CICD.md`, `package.json` | M |
| P2-5 | Preview DB | Use Neon branches for preview deployments | Shared preview data can cause test interference and accidental data exposure. | Create/cleanup a Neon branch per preview and inject its `DATABASE_URL` into Vercel preview. | CI workflow, `prisma.config.ts`, `docs/NEON.md` | M |
| P2-6 | Admin | Build an admin route with defense-in-depth RBAC | ADMIN exists in GraphQL policy but there is no admin UI or route-level guard. | Add server layout guard, proxy early rejection, admin operations, audit log, and soft-delete moderation states. | `src/app/admin/**`, proxy, Prisma schema, GraphQL admin resolvers | L |
| P2-7 | Content lifecycle | Add recipe draft/published/hidden states | Client localStorage draft exists, but edits are immediately public and drafts do not move between devices. | Add `RecipeStatus`, ownership-aware transitions, moderation, and status filtering in public queries. | Prisma schema, RecipeService, GraphQL SDL, create/edit UI | L |
| P2-8 | API architecture | Split GraphQL schema/resolvers into bounded domains | A single route is acceptable now, but auth, recipes, users, metadata, and admin concerns are growing together. | Keep one endpoint but organize domain modules, context factories, policy modules, and service interfaces. | `src/lib/graphql/**`, `src/lib/services/**` | M |
| P2-9 | Media | Replace arbitrary external image URLs with managed media | URL-only images create availability, privacy, and future SSRF/CDN-control concerns. | Add signed upload flow, MIME/size validation, image transformation, and allowlisted storage/CDN URLs. | Recipe form, upload route, schema, `next.config.ts` images | L |
| P2-10 | UX | Add print-friendly and cook mode | Recipes are consumed while cooking; print and wake-lock step mode provide high value without a backend redesign. | Add print CSS and a client step-mode using Wake Lock with graceful fallback. | Recipe detail components, `globals.css` | M |
| P2-11 | SEO | Add RSS/Atom feed and dynamic OG image route | Sitemap handles discovery, but feeds and recipe-specific social cards improve distribution. | Add `app/feed.xml/route.ts` and `app/recipes/[id]/opengraph-image.tsx` with safe text/image inputs. | `src/app/feed.xml/**`, recipe route, `src/lib/seo/**` | M |
| P2-12 | Search UX | Add ingredient search and ranking | Current filters are title/category/difficulty/labels/time only. | Extend GraphQL filter input, search index/query, and UI with ingredient chips and ranked matches. | Recipe SDL/service, search migration, RecipesPage | L |
| P2-13 | Collections | Add saved collections and shopping lists | Favorites are single-dimensional; users cannot organize recipes or aggregate ingredients. | Add collection and shopping-list models, ownership checks, mutations, and offline-friendly UI. | Prisma schema, GraphQL, `src/app/me/**`, recipe components | L |
| P2-14 | Content | Add recipe translations only after URL locale decision | UI translations do not localize recipe titles, ingredients, or descriptions. | Decide translation ownership/workflow, then add localized content tables or JSON with fallback rules. | Prisma schema, locale types, recipe forms, SEO | L |

## Decision-Dependent Ideas

| Idea | Decision needed | Possible direction |
|---|---|---|
| Social login | Which providers and account-linking policy are acceptable? | Add Google/GitHub providers with verified-email linking and account recovery rules. |
| AI recipe suggestions | Cost, privacy, and model provider constraints | Start with deterministic ingredient matching; add an opt-in provider behind a server action/API. |
| Similar recipes | Is an embedding service acceptable? | Start with taxonomy/full-text similarity; consider pgvector only after usage justifies it. |
| Nutrition calculation | Is external ingredient data allowed and how is uncertainty shown? | Store calculated values with source/version and show them as estimates. |
| PWA/offline | Which flows must work offline? | Begin with installability and cached public recipe details; do not cache private GraphQL responses. |
| Comments | Moderation and abuse policy | Add rate-limited comments, report/hide flow, and audit trail together with admin tooling. |
| URL locale routing | Is stable multilingual SEO a product goal? | If yes, make this P1-1 before adding `hreflang`; otherwise keep cookie personalization and avoid fake alternates. |

## Recommended Order

1. Fix GraphQL authorization derivation, rate-limit fail-open behavior, request-size limits, and GraphQL `no-store` headers.
2. Correct session expiry/revocation semantics and preserve query parameters through auth redirects.
3. Decide URL-based locale routing. This decision controls ISR, public caching, canonical URLs, and `hreflang`.
4. Add cursor pagination, list projections, cache-key invalidation, and full-text search.
5. Add GraphQL route integration tests, structured observability, and CI security/migration gates.
6. Introduce admin/moderation and recipe lifecycle states before comments, collections, or large content features.

## Notes

- The existing audit documents in `docs/` contain older statuses. This file reflects the current source files inspected on 2026-07-24 and intentionally marks completed items separately.
- No secrets, environment values, or credential material are included here.
- The highest-value architectural decision is URL-based locale routing versus cookie-only personalization; it affects Next caching, SEO, and the shape of future metadata work.
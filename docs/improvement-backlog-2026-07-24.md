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
| Auth/profile UX | Shared notification helpers and structured mutation-result parsing now centralize success/error handling for auth and profile flows, including password changes. |
| Routing | Query parameters are now preserved in auth redirects via `pathname + search` in the callback URL. Proxy early rejection uses centralized route policies. |
| Authorization | Route families (public, auth, user-profile, admin) are defined in a centralized policy module; proxy and server layouts can enforce consistent access controls. |
| GraphQL testing | Route-level contracts for request validation, response headers, error responses, and configuration constants are unit-tested in route.test.ts. |

## P0 - Security and Correctness

| ID | Area | Improvement | Why it matters / evidence | Suggested implementation | Main files | Size |
|---|---|---|---|---|---|---|
| P0-1 | GraphQL auth | ✅ Authorize the parsed operation, not only client-supplied `operationName` | Apollo's resolved `requestContext.operationName` is now used; missing names and unconfigured operations are rejected. | `assertGraphQLOperationAuthorized()` centralizes the policy; resolver ownership checks remain in place. | `src/app/api/graphql/route.ts`, `src/lib/graphql/authorization.ts`, `src/lib/graphql/operationsConfig.ts` | M |
| P0-2 | Rate limiting | ✅ Do not fail open for sensitive operations | Strict operations no longer fall back to the global limiter or continue after Redis errors. | Strict limiter absence/failure returns `503` with `Retry-After`; non-sensitive operations retain best-effort availability. | `src/app/api/graphql/route.ts`, `src/lib/rateLimit/rateLimit.ts` | M |
| P0-3 | Rate limiting | ✅ Define a trusted proxy policy for client IPs | Forwarding headers are no longer accepted by default; only Vercel or explicit `TRUSTED_PROXY_MODE=vercel` uses `x-real-ip`. | Self-hosted deployments must configure a trusted proxy boundary explicitly; otherwise anonymous callers share a conservative fallback bucket. | `src/app/api/graphql/route.ts`, `src/lib/rateLimit/clientIp.ts`, deployment config | S/M |
| P0-4 | GraphQL input | ✅ Bound request body size before parsing | GraphQL requests over 1 MiB are rejected before JSON parsing and replay into Apollo. | Enforce both `Content-Length` and UTF-8 byte length with a `413` response. | `src/app/api/graphql/route.ts` | S |
| P0-5 | Auth | ✅ Make session authorization revocable | JWT sessions are checked against `User.sessionVersion` on server auth reads; password changes invalidate older tokens. | Add `sessionVersion` to `User`/JWT and increment it on password change/reset. | `prisma/schema.prisma`, `src/lib/auth/auth.ts`, `src/lib/services/UserService.ts` | M |
| P0-6 | Auth | ✅ Remove misleading `rememberMe` lifetime behavior | NextAuth has a fixed 14-day cookie max-age; the previous token claim did not change the real cookie lifetime. | Use one explicit 14-day session policy and remove the non-functional login control and token fields. | `src/lib/auth/auth.config.ts`, `src/lib/auth/auth.ts`, `src/app/(auth)/login/LoginForm.tsx` | M |
| P0-7 | CSP | ✅ Remove unsafe script evaluation | The deployed policy previously allowed `unsafe-eval`. | Remove `unsafe-eval`; `unsafe-inline` remains only where required by the current Next/Mantine rendering setup and needs a separate nonce migration. | `next.config.ts` | M/L |
| P0-8 | Secrets | ✅ Automate environment and secret safety checks | Local env files remain untracked and CI now scans repository content for leaked secrets. | `.env.example` documents names only; Gitleaks runs before quality checks; rotation guidance is documented without printing values. | `.gitignore`, `.env.example`, CI config, `docs/CICD.md` | S |

## P1 - Next.js, GraphQL, and Architecture

| ID | Area | Improvement | Why it matters / evidence | Suggested implementation | Main files | Size |
|---|---|---|---|---|---|---|
| P1-1 | Next rendering | ❌ Rejected: keep locale out of URL paths | Product decision: locale prefixes such as `/en-gb` are not wanted, and the attempted rewrite broke language switching. | Keep cookie-based locale selection, `router.refresh()`, and locale-neutral canonical URLs. Do not introduce `src/app/[locale]/` or proxy rewrites without a new product decision. | `src/app/layout.tsx`, `src/i18n/**`, `src/proxy.ts` | Decision |
| P1-2 | Next caching | ✅ Define an explicit cache policy per route family | Public, personalized, GraphQL, and metadata routes have different cache needs. | Added `docs/cache-policy.md`, explicit dynamic policy for cookie-backed HTML/GraphQL, hourly sitemap revalidation, and static robots metadata. | `src/app/**`, `docs/cache-policy.md` | M |
| P1-3 | GraphQL transport | ✅ Add `Cache-Control: no-store` and `Vary` to GraphQL responses | The endpoint serves personalized data and relied on implicit intermediary behavior. | All handcrafted and Apollo responses set `Cache-Control: no-store` and `Vary: Cookie, Authorization`. | `src/app/api/graphql/route.ts` | S |
| P1-4 | GraphQL persisted queries | ✅ Add a persisted-query allowlist | The client now sends SHA-256 persisted-query metadata and the server accepts only registered documents whose hash matches the full query. | Maintain a server-side hash registry for exported client documents; reject unknown, mismatched, or unsupported persisted-query requests. | `src/app/api/graphql/route.ts`, `src/lib/graphql/persistedQueryRegistry.ts`, `src/lib/apollo/client.ts` | M |
| P1-5 | GraphQL auth | ✅ Replace hardcoded `User.email` field auth with a declarative policy | User field visibility is now defined in a policy map and enforced by the GraphQL field plugin. | Add a field policy map and tests for public/private field contracts; extend the map when new private User fields are added. | `src/app/api/graphql/route.ts`, `src/lib/graphql/fieldPolicies.ts` | M |
| P1-6 | GraphQL privacy | ✅ Remove arbitrary caller IDs from private user queries | Favorites and following now resolve from `context.userId`; callers cannot select another user's private collections by supplying an ID. | Resolve private resources from `context.userId`; keep explicitly public profile queries separate. | `src/lib/graphql/typeDefs/user.graphql`, user resolvers, client operations | M |
| P1-7 | GraphQL schema | ✅ Generate client types from SDL | GraphQL Code Generator now validates all client documents against the SDL and produces reproducible typed client artifacts. | Use the Codegen client preset and enforce `codegen:check` in CI; migrate remaining handwritten operation interfaces incrementally. | `codegen.ts`, `src/lib/graphql/generated/**`, CI config | M |
| P1-8 | GraphQL observability | ✅ Add structured operation metrics and correlation IDs | GraphQL requests now emit structured request ID, operation, duration, status, user class, and error code data without variables or secrets. | `X-Request-Id` is propagated through the request context and response; structured logging runs in all environments. | `src/app/api/graphql/route.ts`, `src/types/graphql/context.ts` | M |
| P1-9 | Pagination | ✅ Replace limit-only lists with cursor pagination | `getRecipes()` now uses an opaque cursor and stable `(createdAt,id)` ordering, with `pageInfo` for continuation. | GraphQL supports `after`; the recipes page provides a localized Load more control. | GraphQL SDL/query, `RecipeService.ts`, `RecipesPage.tsx` | L |
| P1-10 | Search | ✅ Add database-backed full-text/trigram search | Recipe search now ranks matches across title, description, tips, substitutions, and ingredient names. | Added a `pg_trgm` migration and indexed SQL search with result totals. | `prisma/migrations/**`, `RecipeService.ts`, GraphQL filter types | L |
| P1-11 | Cache | ✅ Centralize cache keys and invalidation | Recipe list keys now use a stable serializer and a Redis-backed namespace version, so mutations invalidate all filtered variants. | Shared cache-key helpers are used by recipe and user services; recipe mutations bump the list namespace version. | `src/lib/cache/cacheKeys.ts`, `RecipeService.ts`, `UserService.ts`, `redis.ts` | M |
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
| P2-1 | Testing | Add GraphQL route integration tests | Unit tests cover services, but request parsing, rate limiting, APQ, auth plugins, headers, and masking are high-risk integration behavior. | Use a test Apollo server/route harness with anonymous, authenticated, malformed, oversized, and unauthorized requests. | `src/app/api/graphql/route.test.ts`, GraphQL test utilities | M | ✅ Implemented: Unit-level contract tests verify request validation, response headers, error responses, and configuration constants. Full operation-level testing is covered by existing operationsConfig/authorization/protection tests. |
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
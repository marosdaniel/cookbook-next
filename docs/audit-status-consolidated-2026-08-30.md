# 📋 Cookbook-Next — Konszolidált audit-státusz

> **Dátum**: 2026-08-30
> **Felülvizsgált források**:
> - [cookbook_next_audit_2026-07-04.md](cookbook_next_audit_2026-07-04.md) (40 tételes backlog)
> - [cookbook_next_audit_2026-07-06.md](cookbook_next_audit_2026-07-06.md) (v2 audit, 42 tételes backlog)
> - [improvement-backlog-2026-07-24.md](improvement-backlog-2026-07-24.md) (P0×8, P1×18, C×5, P2×14)
>
> **Módszertan**: minden állítás a 2026-08-30-i kódbázis tényleges fájljain ellenőrizve (nem a doksik önbevallásán). A három forrás átfedő tételei össze vannak vonva; a forrás-oszlop jelzi az eredetet.

**Jelmagyarázat**: ✅ megvalósult · 🟡 részben · ❌ nem valósult meg · 🚫 elvetve/okafogyott (tudatos döntés)

---

## 1. Biztonság és auth

| # | Eredeti forrás | Tétel | Státusz | Tényleges megoldás | Megjegyzés |
|---|---|---|---|---|---|
| S1 | 07-04 #1, 07-06 #1 | `.env` credentials rotálás + audit | ✅ | `.env` nem volt commitolva (git history üres), jelszó rotálva, Gitleaks a CI-ban (`.github/workflows/deploy.yml`) | Lezárva; a CI secret-scan a 07-24 P0-8-cal együtt zárult |
| S2 | 07-04 #2 | Query cost limiting | ✅ | `@escape.tech/graphql-armor`: maxDepth 7, costLimit 1000, maxAliases 15, maxTokens 1000 — [route.ts](../src/app/api/graphql/route.ts) | Az eredeti javaslatnak megfelelő |
| S3 | 07-04 #3, #4, #7, #8 | limit-normalizálás, rating range, ingredient/step sanitizálás, strict limiter | ✅ | `resolveQueryLimit` (max 100), `rateRecipe` 1–5 guard, `sanitizeRecipeInput`, strict limiter 6 műveletre | Sanitizálás `sanitize-html`-lel (nem DOMPurify) — jobb: nincs jsdom-függés, Vercel serverless-safe |
| S4 | 07-04 #18, 07-06 #20, 07-24 P0-7 | **Nonce-alapú CSP** | ✅ **jobb megoldás** | A javaslat `next.config.ts`-beli statikus CSP-t javított volna; ehelyett **per-request nonce** generálódik a [proxy.ts](../src/proxy.ts)-ben (`randomUUID()` → base64, `x-nonce` header), a `next.config.ts` csak fallback statikus headereket ad | Az eredeti javaslatnál erősebb: dinamikus nonce, `unsafe-eval` prod-ban nincs. A motion/Mantine inline style-ok kompatibilitását az UX-tervnél figyelembe kell venni |
| S5 | 07-04 #12, 07-24 P0-2, P0-3 | User-alapú + fail-closed rate limiting, trusted proxy | ✅ | `limiter.limit(userId ?? ip)`; strict műveleteknél Redis-hiba → 503 + `Retry-After`; `TRUSTED_PROXY_MODE=vercel` policy — [rateLimit.ts](../src/lib/rateLimit/rateLimit.ts), [clientIp.ts](../src/lib/rateLimit/clientIp.ts) | Fail-open csak nem-szenzitív műveletekre maradt (szándékos) |
| S6 | 07-04 #13, 07-06 #19, 07-24 P1-4 | Valódi persisted-query allowlist | ✅ | [persistedQueryRegistry.ts](../src/lib/graphql/persistedQueryRegistry.ts): szerveroldali hash-registry, a kliens SHA-256 persisted-query metaadatot küld; ismeretlen/eltérő hash elutasítva | A 07-06-ban jelzett „csak rossz hash-t büntet” hiányosság megszűnt |
| S7 | 07-04 #25, 07-24 P1-5 | Field-level auth deklaratívan | ✅ **jobb megoldás** | A hardcoded `User.email` check helyett policy map: [fieldPolicies.ts](../src/lib/graphql/fieldPolicies.ts) + plugin | A 07-06 kritikája (hardcode) alapján lett deklaratív |
| S8 | 07-24 P0-1 | Parsolt operation authorizálása | ✅ | `assertGraphQLOperationAuthorized()` a resolved `operationName`-en — [authorization.ts](../src/lib/graphql/authorization.ts) | |
| S9 | 07-24 P0-4 | Request body méretkorlát | ✅ | 1 MiB limit Content-Length + UTF-8 bytehossz alapján, 413 válasz | |
| S10 | 07-24 P0-5, C-5 | Revokálható session (`sessionVersion`) | ✅ / 🟡 | `User.sessionVersion` + JWT-check + increment jelszóváltásnál — migráció: `20260724000000_add_session_version` | A minimál-megoldás kész; eszközönkénti session-lista (C-5 teljes scope) továbbra sincs —**maradó P2** |
| S11 | 07-24 P0-6 | `rememberMe` félrevezető viselkedés kivezetése | ✅ | Egységes 14 napos JWT session, nincs rememberMe control — [auth.config.ts](../src/lib/auth/auth.config.ts) | |
| S12 | 07-04 #9, 07-06 #8, 07-24 P1-15 | **next-auth beta → stabil** | ❌ | `next-auth: 5.0.0-beta.32` — továbbra is beta production-ben | **Még mindig releváns, az egyik legrégebb óta nyitott kockázat** |
| S13 | 07-06 #7 | **Saját recept értékelésének szerveroldali tiltása** | ✅ **(2026-08-30 lezárva)** | `RecipeService.rateRecipe` most `FORBIDDEN`-t dob, ha `recipe.createdBy === userId`; a kliens `RecipeRating` a saját recepten `readOnly`-ra vált ([RecipeService.ts](../src/lib/services/RecipeService.ts), [RecipeDetailClient.tsx](../src/app/recipes/[id]/RecipeDetailClient.tsx)) | Unit teszt: `RecipeService.test.ts` „rejects rating your own recipe” |
| S14 | 07-24 C-3 | Cookie security attribútumok integrációs tesztje | ✅ **(2026-08-30 lezárva)** | A session-cookie kontraktja explicitté vált (`getSessionCookieConfig` a [auth.config.ts](../src/lib/auth/auth.config.ts)-ben: HttpOnly, SameSite=Lax, path `/`, `Secure` + `__Secure-` prefix csak https-en) + a locale-cookie is kap `Secure`-t https-en ([locale.client.ts](../src/lib/locale/locale.client.ts)) — mindkettő kontraktteszttel lefedve, nem élő Playwright-integrációval | Kontraktteszt Playwright helyett (nincs élő szerver/DB ehhez a workspace-hez) — élő cookie-header ellenőrzés Playwright-tal továbbra is nyitott, kisebb kiegészítésként hagyható |
| S15 | 07-24 C-4 | Consent-modell (essential vs. analytics) | ❌ | Nincs consent state; analytics jelenleg csak Vercel Speed Insights | Analytics bevezetése ELŐTT kötelező — új backlogban szerepel |
| S16 | 07-04 #17, 07-06 #24 | Social login | ❌ | Csak Credentials provider — [auth.ts](../src/lib/auth/auth.ts) | Releváns marad (Google OAuth ingyenes) |

## 2. SEO és tartalom-kiszolgálás

| # | Eredeti forrás | Tétel | Státusz | Tényleges megoldás | Megjegyzés |
|---|---|---|---|---|---|
| SEO1 | 07-06 B, 5.2(c) | Recept `generateMetadata` DB-mezőkből | ✅ | `seoTitle`/`seoDescription`/`socialImage` + canonical + OG/Twitter — [page.tsx](../src/app/recipes/[id]/page.tsx) | |
| SEO2 | 07-06 C, 5.2(a)(b), 07-24 P2-2 | sitemap.ts + robots.ts + kontrakt-tesztek | ✅ | [sitemap.ts](../src/app/sitemap.ts), [robots.ts](../src/app/robots.ts), és **tesztjeik is**: `sitemap.test.ts`, `robots.test.ts` | A P2-2 tesztjavaslat is teljesült |
| SEO3 | 07-04 #34, 07-06 #2 (N2) | JSON-LD escape + server-render | ✅ | `JSON.stringify(...).replaceAll('<', '\u003c')` a **szerveroldali** [page.tsx](../src/app/recipes/[id]/page.tsx#L190)-ben; `aggregateRating`, author, datePublished, validált VideoObject | Pontosan a javasolt defense-in-depth készült el |
| SEO4 | 07-06 F, 5.2(e) | Slug-alapú URL-ek + id→slug redirect | ✅ | `getRecipeBySlugOrId` + redirect; kártya/kereső linkek slug-preferáltak | |
| SEO5 | 07-04 #22, 07-06 #11, 07-24 P1-2 | ISR/SSG vs. explicit cache policy | 🚫→✅ **eltérő megoldás** | Az ISR-javaslat helyett **explicit route-family cache policy** született: [cache-policy.md](cache-policy.md), cookie-alapú HTML dinamikus marad, sitemap óránként revalidál | Tudatos döntés: a cookie-alapú locale mellett a publikus HTML-cache félrevezető lenne. Egyenértékű, dokumentált |
| SEO6 | 07-24 P1-1, C-2, P2-14 | URL-locale (`/en-gb/...`) | 🚫 | **Elvetett termékdöntés** — cookie-alapú locale marad, canonical locale-semleges | Lezárva; recept-tartalom fordítás (P2-14) is emiatt parkolva |
| SEO7 | 07-06 #33 (N7), 07-24 P2-11 | Dinamikus OG-image (`next/og`) | ✅ **(2026-08-30 lezárva)** | [src/app/recipes/[id]/opengraph-image.tsx](../src/app/recipes/%5Bid%5D/opengraph-image.tsx): `ImageResponse` címmel, kategóriával, nehézségi szinttel és főzési idővel, brand-színekkel; hiányzó receptnél generikus branded kártya fallback | Unit tesztelve (`opengraph-image.test.tsx`) |
| SEO8 | 07-06 #41 (N15), 07-24 P2-11 | RSS/Atom feed | ✅ **(2026-08-30 lezárva)** | [src/app/feed.xml/route.ts](../src/app/feed.xml/route.ts): RSS 2.0, legutóbbi 20 recept, XML-escape, `s-maxage=3600`; a root layout `alternates.types['application/rss+xml']` hivatkozza | Unit tesztelve (`route.test.ts`) |

## 3. Architektúra, adat, teljesítmény

| # | Eredeti forrás | Tétel | Státusz | Tényleges megoldás | Megjegyzés |
|---|---|---|---|---|---|
| A1 | 07-04 #5, 07-06 #6, 07-24 P1-9 | Cursor-alapú pagináció + Load More | ✅ | Opaque `(createdAt,id)` cursor + `pageInfo` + lokalizált Load More — RecipeService, RecipesPage | |
| A2 | 07-04 #14, 07-06 #12, 07-24 P1-10 | **Full-text keresés** | ✅ **eltérő megoldás** | A javasolt `tsvector` helyett **`pg_trgm` trigram GIN indexek** (title, description, tips, substitutions, **ingredient name**) — migráció: `20260724000100_add_recipe_trigram_search` | Egyenértékű/jobb ehhez a méretez­­hez: typo-toleráns, nyelvfüggetlen (magyar toldalékokkal a tsvector English stemmer rosszabb lenne) |
| A3 | 07-24 P1-11 | Cache-kulcs centralizálás + invalidáció | ✅ | [cacheKeys.ts](../src/lib/cache/cacheKeys.ts) + Redis namespace-verzió, mutációk bump-olják | |
| A4 | 07-24 P1-13, 07-06 3.3 | **Metadata: statikus tömb → DB** | ✅ **eltérő megoldás** | `Metadata` modell (`MetadataType` enum, `isActive`, `sortOrder`) — migráció `20260726000000_add_metadata_model`; **seed-alapú feltöltés** a [prisma/seed.ts](../prisma/seed.ts)-ből (`METADATA_DEFINITIONS`); a recept JSON-snapshot tárolás megmaradt | A 07-06 terv `MetadataEntry` + admin CRUD-ot javasolt; a megvalósítás a modell + seed. Az admin CRUD UI még hiányzik → az [admin-panel-plan-2026-08-30.md](admin-panel-plan-2026-08-30.md) erre épít |
| A5 | 07-24 P1-12 | Lista- vs. detail-projekciók szétválasztása | ✅ **(2026-08-30 lezárva)** | `getRecipes`/`getRecipesByUserId` mostantól `select: RECIPE_LIST_SELECT`-tel (minden skalár mező, `ingredients`/`preparationSteps` nélkül) fut `include` helyett — [RecipeService.ts](../src/lib/services/RecipeService.ts) | A kliens list-query-k (`GET_LATEST_RECIPES`, `GET_RECIPES_BY_USER_ID`) amúgy sem kértek ingredients/steps mezőt; a detail lekérdezések (`getRecipeById`, `getRecipeBySlugOrId`) változatlanul `include`-osak |
| A6 | 07-24 P1-14 | Prisma/Redis timeout observability | 🟡 | `createPrismaTimeoutProxy(prisma, 10000)` a GraphQL route-on + unit tesztek; **de** nincs metrika/per-op budget, cache-miss vs. backend-hiba nem megkülönböztetett | Részben releváns; alacsony prioritás monitoring nélkül |
| A7 | 07-24 P1-8 | Strukturált GraphQL metrikák + request ID | ✅ | `X-Request-Id` propagálás, structured JSON log (op, duration, status, userClass) | |
| A8 | 07-24 P1-3 | GraphQL `no-store` + `Vary` | ✅ | Minden válaszon `Cache-Control: no-store`, `Vary: Cookie, Authorization` | |
| A9 | 07-24 P2-8 | GraphQL domain-modulokra bontás | 🟡 | Resolvers domain-mappákban (recipe/user/metadata), operationsConfig + fieldPolicies + authorization külön modul | A jelenlegi méretnél elegendő; admin bevezetésekor bővítendő |
| A10 | 07-04 #20 | Apollo Client cache (typePolicies) | ✅ | keyFields, merge policy-k, errorPolicy `'all'` + ErrorLink + lokalizált notification | 07-06-ban zárult |
| A11 | 07-06 #17 (4.3) | **darkTheme bekötése** | 🟡 | A [darkTheme.ts](../src/providers/mantine/darkTheme.ts) és a hozzá tartozó teszt elkészült, de a [mantine.tsx](../src/providers/mantine/mantine.tsx) továbbra is **csak** a `lightTheme`-et adja át; a dark mode wiring ezért még nincs élesben bekötve | **Részben megvalósult**: a sötét paletta és override-ok kész, a production integráció hiányzik |
| A12 | 07-06 #42, 10. szekció | Microfrontend / monorepo | 🚫 | Elemzés alapján elvetve (0/5 feltétel) | Helyes döntés; admin Multi-Zones csak ha kinövi |
| A13 | 07-24 P2-5 | Neon branch preview DB-k | ❌ | CI-ban nincs branch-per-PR | Releváns (Neon free tier tudja), M |

## 4. DX, tooling, tesztelés

| # | Eredeti forrás | Tétel | Státusz | Tényleges megoldás | Megjegyzés |
|---|---|---|---|---|---|
| D1 | 07-24 P1-7 | GraphQL codegen SDL-ből | 🟡 | `codegen.ts` (client preset) + `codegen:check` a CI-ban ✅; **de** a generált típusokat **egyetlen app-fájl sem importálja** — a [queries.ts](../src/lib/graphql/queries.ts) kézzel írt interfészekkel + `TypedDocumentNode` casttal dolgozik | A „migrate remaining handwritten interfaces incrementally” rész nem történt meg → [type-unification-2026-08-30.md](type-unification-2026-08-30.md) |
| D2 | 07-04 #29, 07-24 P1-16 | `noImplicitAny: true` | 🚫 | [tsconfig.json](../tsconfig.json): explicit `false`; a projekt a teljes app-re kiterjesztett `noImplicitAny`-kötelezés helyett a kritikus GraphQL/auth/route területekre fókuszál | Tudatosan elvetett: a teljes kódbázisra szigorú `any`-tiltás jelenlegi roadmapban nem arányos a projekt méretéhez és a codegen/GraphQL worklowhoz; a biztonságos, kritikus területeken a pontos típusok maradtak meg |
| D3 | 07-04 #19, #40, 07-06 #21 | `react-icons` + `@mantine/nprogress` trim | 🟡 | A `@mantine/nprogress` helyett a projekt már a [mantine.tsx](../src/providers/mantine/mantine.tsx)-ben használt `nextjs-toploader`-t használja; a `react-icons` azonban továbbra is aktív használatban van, ezért a teljes deps-trim nem fejeződött be | Részben megoldott: a top-loader csere elkészült, a teljes ikon-dependency cleanup még nyitott |
| D4 | 07-24 P2-1 | GraphQL route integrációs tesztek | ✅ | `route.test.ts` + `route.branch.test.ts`: request-validáció, headerek, hibaválaszok, konfig-kontraktok | |
| D5 | 07-24 P2-4 | CI gate-ek | 🟡 | Van: Gitleaks, Biome, codegen:check, typecheck, unit+integration teszt. **Nincs**: `pnpm audit`, `prisma validate`, migration-status check | Hiányzó része S méretű |
| D6 | 07-06 #39 (F8) | a11y audit (axe a Playwrightban) | ❌ | Nincs axe-core | Releváns, ingyenes, M |
| D7 | 07-06 #27 (N9), 07-24 P2-3 | Hibamonitoring (Sentry/GlitchTip) | ❌ | Nincs monitoring, nincs `instrumentation.ts`; a maszkolt prod-hibák nyomtalanok | **A legrégebb óta nyitott observability-rés** |
| D8 | 07-24 C-1 | Locale cookie írás centralizálása | 🟡 | `locale.client.ts` / `locale.server.ts` külön olvas; attribútumok nincsenek egy helyen definiálva | S méretű, releváns |

## 5. Funkciók, UX

| # | Eredeti forrás | Tétel | Státusz | Tényleges megoldás | Megjegyzés |
|---|---|---|---|---|---|
| F1 | 07-06 #18 (6. szekció) | **Recently viewed — valós tracking** | ❌ | A HomePage továbbra is a [mockRecentlyViewed.ts](../src/app/mockRecentlyViewed.ts) hardcode-olt tömbjét mutatja | **Mock adat production UI-ban — prioritás** |
| F2 | 07-06 #9 (7.2) | Rating UI: optimista update + törlés gomb | 🟡 | Átlag és saját értékelés megjelenítése szétvált ✅, motion-visszajelzés van; **de** továbbra is `refetchQueries`, nincs `optimisticResponse`, nincs Remove gomb (a `DELETE_RATING` mutation-t egyetlen komponens sem hívja) | Releváns, M |
| F3 | 07-06 #25 (8.2) | Create flow: slug-gen, szekció-hibajelzés, autosave-jelző, DnD | 🟡 | Slug-gen ✅ (`slugify.ts` + ↻ gomb), szekció-hibabadge ✅; DnD ❌ (nincs dnd lib), autosave-indikátor ❌ | Maradék: R1, R8 |
| F4 | 07-06 #26, 07-24 P2-7 | Server-side draft (`RecipeStatus`) | ❌ | Csak localStorage draft | Releváns, admin-moderációval együtt éri meg (lásd admin terv) |
| F5 | 07-04 #15, 07-06 #22, 07-24 döntésfüggő | Komment rendszer | ❌ | Nincs Comment modell | Döntésfüggő (moderáció!) — admin panel után |
| F6 | 07-04 #16, 07-06 #23, 07-24 P2-9 | Kép-feltöltés (managed media) | ❌ | `imgSrc` külső URL | Releváns (Vercel Blob free) |
| F7 | 07-04 #23, 07-24 P2-12 | Összetevő-alapú keresés | 🟡 | A trigram keresés **lefedi az ingredient name-eket** (index + SQL) ✅; de nincs „mi van a hűtőmben” chips-UI és hiányzó-összetevő rangsor | A backend-alap kész, a UI-réteg hiányzik |
| F8 | 07-04 #24, #31, 07-24 P2-13 | Bevásárlólista + gyűjtemények | ❌ | Nincs | P2 marad |
| F9 | 07-04 #39, 07-06 #40, 07-24 P2-10 | Print CSS + cook mode | ❌ | Nincs `@media print`, nincs Wake Lock | Olcsó, nagy értékű — új backlogban |
| F10 | 07-06 #32 | Adagszám-skálázás + tört mennyiségek | ❌ | Nincs servings-szorzó a detail oldalon | S, releváns |
| F11 | 07-04 #33, 07-24 döntésfüggő | PWA / Service Worker | ❌ | Csak `site.webmanifest` | P2 |
| F12 | 07-04 #32, #37, #38, 07-06 #34, #38 | Tápérték, AI, menütervező, pgvector, badge-ek | ❌ | Nincs | Döntésfüggő P2 — nem sürgős |
| F13 | 07-04 #35, 07-06 #13–16, 07-24 P2-6 | **Admin dashboard** | ❌ (alapok 🟡) | Nincs `/admin` UI; **de** az infrastruktúra jelentős része kész: `admin` route family a [routePolicies.ts](../src/lib/auth/routePolicies.ts)-ben, 5 admin GraphQL művelet az operationsConfig-ban, ADMIN field-policy, Metadata DB-modell | → [admin-panel-plan-2026-08-30.md](admin-panel-plan-2026-08-30.md) |

## 6. Ahol az implementáció eltér az eredeti javaslattól (explicit összevetés)

| Terület | Eredeti javaslat | Tényleges megoldás | Értékelés |
|---|---|---|---|
| **CSP** | Statikus CSP javítás a `next.config.ts`-ben, `unsafe-inline` kivezetés | Per-request **nonce a proxy-ban** (`x-nonce` header), statikus fallback headerek a configban | **Jobb**: valódi nonce-alapú védelem; minden inline scriptnek (JSON-LD, theme init) nonce-t kell kapnia — az új UI-munkáknál kötelező szempont |
| **Typed routes** | Nem szerepelt explicit javaslatként | `typedRoutes: true` + saját [routes.ts](../src/types/routes.ts) konvenció (PUBLIC/AUTH/PROTECTED + helper fn-ek + type guardok) | **Jobb** mint a nyers string route-ok; minden új route-nak (admin!) ezt kell követnie |
| **Metadata kezelés** | 07-06: `MetadataEntry` modell + azonnali admin CRUD | `Metadata` modell + **seed-alapú** feltöltés (`METADATA_DEFINITIONS` marad a source of truth), admin CRUD elhalasztva | **Egyenértékű** átmeneti állapotként: a DB-modell megvan, a seed determinisztikus. Hátrány: két igazságforrás (definitions fájl + DB) — az admin CRUD bevezetésekor a definitions fájl szerepét seed-only-ra kell szűkíteni |
| **Full-text keresés** | `tsvector` + GIN | `pg_trgm` trigram GIN 5 mezőn | **Jobb** többnyelvű tartalomhoz (nincs stemmer-függés), typo-toleráns; nagy korpusznál a tsvector olcsóbb lenne — később hibrid lehet |
| **APQ** | Apollo APQ (dinamikus hash-regisztráció) | **Statikus allowlist-registry** exportált kliens-dokumentumokból | **Jobb** biztonságilag: zárt allowlist, nem „first-write-wins” APQ |
| **Session revoke** | DB session modell VAGY sessionVersion | `sessionVersion` (minimál változat) | **Egyenértékű** a jelenlegi igényhez; eszköz-lista nélkül |
| **Error handling kliensen** | `errorPolicy: 'all'` | `errorPolicy: 'all'` + központi ErrorLink + lokalizált Mantine notification | A javasoltnál teljesebb |

---

## 7. Vezetői összefoglaló

**Számszerűen** (a három forrás 60 egyedi, összevont tételéből, 2026-08-30 esti állapot):

| Státusz | Darab | Arány |
|---|---|---|
| ✅ Lezárt | 35 | ~58% |
| 🟡 Részleges | 12 | ~20% |
| ❌ Nyitott | 8 | ~13% |
| 🚫 Elvetett (tudatos döntés) | 5 | ~8% |

A 2026. júliusi auditok óta a projekt **a P0 biztonsági réteget teljesen lezárta** (GraphQL authz, rate limiting, CSP nonce, sessionVersion, request-size limit, secret-scan), és a P1 architektúra-tételek nagy részét is (cursor pagináció, trigram keresés, cache-invalidáció, persisted query allowlist, observability-alapok, Metadata DB-modell). **2026-08-30 folyamán további 5 tétel zárult le**: a saját recept értékelésének tiltása (S13), a session- és locale-cookie biztonsági attribútumainak explicit, tesztelt kontraktja (S14), a receptek dinamikus OG-image-e (SEO7), az RSS-feed (SEO8), és a lista-/detail-projekciók szétválasztása (A5).

**A legkritikusabb nyitott pontok** (részletesen az új backlogban):

1. **next-auth beta production-ben** (S12) — 3 audit óta nyitott.
2. **Nincs hibamonitoring** (D7) — a maszkolt prod-hibák láthatatlanok.
3. **Mock „recently viewed” a főoldalon** (F1) — éles UI-ban placeholder adat.
4. **Codegen-típusok nem használtak** (D1) + kézi típusduplikáció — lásd típusegységesítési terv.
5. **darkTheme részben megvalósult, de még nincs bekötve** (A11) — a sötét paletta elkészült, a production integráció hiányzik.
6. **Admin UI hiánya** (F13) — az összes előfeltétel (RBAC, route family, DB-modell) kész, csak a felület hiányzik.


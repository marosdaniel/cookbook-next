# Cookbook Next — Improvement Backlog

Audit dátum: **2026-08-30**
Előzmény: [improvement-backlog-2026-07-24.md](improvement-backlog-2026-07-24.md) · Státusz-alap: [audit-status-consolidated-2026-08-30.md](audit-status-consolidated-2026-08-30.md)

Scope: friss mélyaudit — biztonság, architektúra, teljesítmény, kódminőség, tesztlefedettség, DX, SEO, a11y. **Minden javaslat ingyenes / free-tier megoldásra épül**; ahol fizetős eszköz lenne az ideális, azt jelezzük, de az elsődleges javaslat mindig ingyenes.

Kapcsolódó résztervek (külön dokumentumban, ide csak hivatkozva):
[admin-panel-plan-2026-08-30.md](admin-panel-plan-2026-08-30.md) · [ux-motion-upgrade-plan-2026-08-30.md](ux-motion-upgrade-plan-2026-08-30.md) · [footer-redesign-2026-08-30.md](footer-redesign-2026-08-30.md) · [responsive-audit-2026-08-30.md](responsive-audit-2026-08-30.md) · [validation-unification-2026-08-30.md](validation-unification-2026-08-30.md) · [type-unification-2026-08-30.md](type-unification-2026-08-30.md)

---

## P0 — Kritikus / biztonsági

| ID | Terület | Probléma | Javasolt megoldás | Méret | Miért ingyenes |
|---|---|---|---|---|---|
| **N-P0-1** | Adat-integritás | **Saját recept értékelhető**: a [RecipeService.rateRecipe](../src/lib/services/RecipeService.ts#L479) betölti a receptet, de nem ellenőrzi a `createdBy`-t → rating-inflálás. (07-06 óta nyitott.) | A már betöltött `recipe`-en: `if (recipe.createdBy === userId) throwCustomError('You cannot rate your own recipe', ErrorTypes.FORBIDDEN)` + unit teszt + kliensen a saját recepten a rating input elrejtése. | **S** | Csak kód, nincs függőség |
| **N-P0-2** | Auth | **next-auth `5.0.0-beta.32` production-ben** — három audit óta nyitott; beta csomagra nincs security-patch garancia. | Ellenőrizni az Auth.js v5 stabil elérhetőségét; ha van, verzió-bump + a `sessionVersion`/JWT callback kontraktok regressziós tesztjei. Ha nincs: a beta verzió pin-elése + Renovate riasztás (lásd N-P1-8). | **M/L** | Auth.js nyílt forráskódú |
| **N-P0-3** | Observability | **Nincs hibamonitoring**: a prod GraphQL-hibák maszkoltak és nyomtalanok, a `console.error`-ok a Vercel logban 1 óra után elvesznek (Hobby tier). | **GlitchTip** (self-host, ingyenes, Sentry-kompatibilis SDK) vagy **Sentry free tier** (5k event/hó). `instrumentation.ts` + `@sentry/nextjs` SDK, PII-scrub (beforeSend), GraphQL operation tag a meglévő `X-Request-Id`-vel korrelálva. | **S/M** | Sentry free tier 5k event/hó elég egy hobbiprojektnek; GlitchTip teljesen ingyen self-hostolva |
| **N-P0-4** | Adatvédelem | A GraphQL route strukturált logja user-azonosítót tartalmazhat; monitoring bevezetése előtt nincs definiált PII-policy. | Log-policy dokumentálása: mit szabad logolni (requestId, opName, durationMs, userClass — a jelenlegi mezőlista jó), userId hash-elése a logokban. | **S** | Csak kód/dokumentáció |

## P1 — Fontos

| ID | Terület | Probléma | Javasolt megoldás | Méret | Miért ingyenes |
|---|---|---|---|---|---|
| **N-P1-1** | UX/adat | **Mock „recently viewed” a főoldalon** ([mockRecentlyViewed.ts](../src/app/mockRecentlyViewed.ts)) — éles UI hamis adattal. | A 07-06 audit 6.1 Fázis 1 terve változatlanul érvényes: localStorage (`cookbook:recently-viewed:v1`, max 12 elem) + `getRecipesByIds` query; mounted-guard az SSR-mismatch ellen; cookie-policy oldalon a localStorage-kulcs feltüntetése. | **S/M** | Kliensoldali + 1 olcsó query |
| **N-P1-2** | Teljesítmény | **Lista-lekérdezések teljes relációkkal**: `listRecipes` `include: { ingredients, preparationSteps }`-szel fut a kártyákhoz is → felesleges DB-munka + Redis-payload + hálózati méret. | Explicit Prisma `select` a lista-projekcióhoz (kártya-mezők: id, slug, title, description, imgSrc, cookingTime, servings, category, difficultyLevel, createdBy, createdAt); a detail marad `include`. GraphQL oldalon a lista-query-k már ma is kevesebb mezőt kérnek — a service-réteg pazarol. | **M** | Csak kód |
| **N-P1-3** | Kódminőség | **`noImplicitAny: false`** — a strict mód kiskapuja explicit nyitva. | Fokozatos migráció: `tsc --noImplicitAny --noEmit` hibalista → modulonként javítás → flag bekapcsolása CI-ban. | **M** | TypeScript |
| **N-P1-4** | Típusrendszer | **A codegen generált típusai használatlanok** — kézzel írt operation-interfészek a [queries.ts](../src/lib/graphql/queries.ts)-ben, drift-veszély. | Lásd [type-unification-2026-08-30.md](type-unification-2026-08-30.md): client preset `graphql()` használat + `typescript-resolvers` a szerveren. | **M/L** | GraphQL Codegen ingyenes |
| **N-P1-5** | Validáció | Recept-input szerveroldalon csak kézi `validateRequiredFields` + sanitizálás — a Zod-szabályok (hossz, URL, pozitív számok) nem futnak le szerveren. | Lásd [validation-unification-2026-08-30.md](validation-unification-2026-08-30.md): megosztott atom-sémák + szerveroldali `recipeInputSchema.safeParse` a resolver-utilokban. | **M** | Zod már dependency |
| **N-P1-6** | Design | **darkTheme dead code** — a [mantine.tsx](../src/providers/mantine/mantine.tsx) csak a lightTheme-et köti be; a 07-06-ban megtervezett `SchemeAwareTheme` sosem készült el. | `MantineThemeProvider` + `useComputedColorScheme` a 07-06 audit 4.3 szerint; a meglévő theme-tesztek zöldek maradnak. | **S** | Mantine beépített |
| **N-P1-7** | DX/CI | Hiányzó CI gate-ek: nincs `pnpm audit`, `prisma validate`, migration-status check. | A `quality-checks` job bővítése: `pnpm audit --prod --audit-level=high` (non-blocking warn először), `pnpm prisma validate`, `prisma migrate status` a CI DB-n. | **S** | GitHub Actions free (public repo), pnpm/prisma beépített |
| **N-P1-8** | DX | Nincs automatikus dependency-frissítés → beta/elavult csomagok észrevétlen ragadnak be (lásd next-auth). | **Renovate** GitHub App (ingyenes) vagy Dependabot: heti PR-ok, `next-auth` külön riasztási szabállyal. | **S** | Renovate/Dependabot ingyenes |
| **N-P1-9** | a11y | Nincs automatizált a11y-ellenőrzés; carousel, rating input, multi-step form tipikus gócok. | `@axe-core/playwright` a meglévő e2e-suite-okba (home, recipes, detail, login, create): `new AxeBuilder({ page }).analyze()` + kritikus/serious szabályokra fail. | **M** | axe-core nyílt forráskódú |
| **N-P1-10** | UX | Rating: nincs optimista update (refetch-alapú), nincs értékelés-törlés UI, pedig a `DELETE_RATING` operáció létezik és rate-limitelt. | `optimisticResponse` + normalized cache merge (refetch elhagyása); „Remove my rating” gomb; hibánál rollback + notification. 07-06 7.2 terv szerint. | **M** | Csak kód |
| **N-P1-11** | Dependency-trim | `react-icons`, `@mantine/nprogress` továbbra is dependency (3 audit óta); react-icons még importban is. | Ikonok migrálása `@tabler/icons-react`-re (~9 fájl), `@mantine/nprogress` törlése (a `nextjs-toploader` a használt). | **S** | Csomagtörlés |
| **N-P1-12** | SEO | Nincs dinamikus OG-image → a receptek social-megosztása generikus kártyát kap. | `src/app/recipes/[id]/opengraph-image.tsx` a beépített `next/og` `ImageResponse`-szal: cím + kategória + brand-szín; input-szanitizálás (a title már sanitizált). | **S/M** | `next/og` a Next.js része |
| **N-P1-13** | Admin | Nincs admin felület, miközben minden előfeltétel (RBAC, route family, Metadata modell) kész. | MVP az [admin-panel-plan-2026-08-30.md](admin-panel-plan-2026-08-30.md) szerint. | **L** | Meglévő stack |
| **N-P1-14** | Biztonság | Cookie-attribútumok (HttpOnly/Secure/SameSite) nincsenek integrációs teszttel rögzítve (07-24 C-3). | Playwright teszt: login után a session cookie attribútumainak assertálása; locale cookie attribútumok tesztje. | **S** | Playwright már bevezetett |
| **N-P1-15** | i18n | Locale cookie írása/olvasása szétszórt, attribútumok nem egy helyen (07-24 C-1). | Egy `setLocaleCookie()` helper (`path`, `max-age`, `SameSite=Lax`, prod-ban `Secure`), kliens+szerver közös konstansokkal + tesztek. | **S** | Csak kód |

## P2 — Nice-to-have

| ID | Terület | Probléma | Javasolt megoldás | Méret | Miért ingyenes |
|---|---|---|---|---|---|
| **N-P2-1** | UX | Nincs print-nézet és cook mode — főzés közben a képernyő lezár, a nyomtatás layout-szemetet visz. | `@media print` szabályok a recept-detail CSS-ébe (navbar/footer/gombok elrejtése) + „Cook mode” kliens-komponens: Screen Wake Lock API + lépésenkénti nagybetűs nézet, graceful fallback. | **M** | Natív böngésző API-k |
| **N-P2-2** | UX | Nincs adagszám-skálázás: a hozzávalók fixen az eredeti `servings`-re szólnak. | Kliensoldali szorzó a detail oldalon (`ingredient.quantity * servings/baseServings`), szép tört-formázás (½, ¼). | **S** | Kliensoldali számítás |
| **N-P2-3** | SEO | Nincs RSS/Atom feed. | `src/app/feed.xml/route.ts` — legutóbbi 20 recept, `Cache-Control: s-maxage=3600`. | **S** | Beépített route handler |
| **N-P2-4** | Feature | Kép-URL-ek külső domainekről: elérhetőség + adatvédelem + CDN-kontroll hiánya. | **Vercel Blob** (Hobby: ingyenes kvóta) feltöltési flow: signed upload, MIME+méret validáció, allowlisted URL-minta a Zod sémában. Alternatíva: ImageKit free tier. | **L** | Vercel Blob Hobby-kvóta ingyen |
| **N-P2-5** | Feature | Server-side draft + moderációs státusz hiánya (`RecipeStatus`). | `RecipeStatus: DRAFT/PUBLISHED/HIDDEN` enum + státusz-szűrés a publikus query-kben + „Save as draft” — az admin moderációval közös séma-munkában (admin terv 5. szekció). | **L** | Prisma migráció |
| **N-P2-6** | Feature | „Mi van a hűtőmben?” — a trigram keresés már lefedi az ingredient name-eket, de nincs dedikált UI. | Ingredient-chips input a RecipesPage szűrősávjába → a meglévő `search` filterre képezve; később hiányzó-összetevő rangsor SQL-lel. | **M** | Meglévő index |
| **N-P2-7** | DX | Preview deploymentek közös DB-n futnak. | Neon branch-per-PR GitHub Action: branch létrehozás + `DATABASE_URL` inject + cleanup PR-zárásnál. | **M** | Neon free tier támogatja a branchinget |
| **N-P2-8** | Teljesítmény | Nincs automatizált teljesítmény-regresszió-mérés. | **Lighthouse CI** GitHub Action a preview URL-re (perf + a11y + SEO score küszöbökkel, először csak reportolva). | **S/M** | LHCI nyílt forráskódú, GH Actions ingyen |
| **N-P2-9** | Analytics | Csak Vercel Speed Insights; nincs privacy-barát látogatottsági adat. | **Umami** self-host (Vercel + ugyanazon Neon Postgres free tieren) — cookie-mentes, GDPR-barát; **előfeltétel** a consent-modell tisztázása (N-P2-10). | **M** | Umami MIT-licencű, a meglévő free infrastruktúrán fut |
| **N-P2-10** | Adatvédelem | Nincs consent-modell (07-24 C-4) — analytics bevezetése előtt kötelező. | Minimál consent-réteg: essential (auth/locale) vs. optional kategória, elutasításnál analytics-script ki sem kerül a DOM-ba; cookie-policy oldal frissítése. | **M** | Csak kód |
| **N-P2-11** | UX | Create flow maradék: nincs drag-and-drop átrendezés, nincs autosave-indikátor. | `@dnd-kit` (ingyenes, karbantartott) az ingredients/steps listákra; „Saved · just now” jelző a composer headerben. | **M** | dnd-kit MIT |
| **N-P2-12** | Feature | Bevásárlólista / gyűjtemények hiánya. | Fázis 1: kliensoldali bevásárlólista-aggregátor (kijelölt receptek hozzávalóinak összesítése, localStorage). Collection-modell csak utána. | **M** | Kliensoldali |
| **N-P2-13** | Tesztelés | A vitest coverage-küszöbök alacsonyak (23/23/19/17%), és nem emelkednek. | Ratchet-stratégia: minden sprintben +2-3% küszöb; kritikus modulokra (services, auth, validation) külön 80%-os per-file küszöb. | **S** | Vitest beépített |
| **N-P2-14** | Arch | Redis/Prisma timeout-viselkedés metrika nélkül (07-24 P1-14 maradéka). | A monitoring (N-P0-3) bevezetése UTÁN: timeout/circuit-breaker események eseményként a Sentry/GlitchTip felé. | **S** | A monitoring melléktermékeként |

## Fizetős eszköz lenne ideális — ingyenes alternatívával

| Igény | Ideális (fizetős) | Választott ingyenes alternatíva |
|---|---|---|
| Hibamonitoring nagy eventszámmal | Sentry Team ($26/hó) | Sentry free 5k event/hó **vagy** GlitchTip self-host |
| Kép CDN + transzformáció | Cloudinary Plus | Vercel Blob Hobby-kvóta + `next/image` |
| Uptime/synthetic monitoring | Checkly | GitHub Actions cron + egyszerű health-check endpoint |
| Web analytics | Plausible Cloud | Umami self-host a meglévő Neon-on |

## Sprint-javaslat

1. **Sprint 1 — „lezárás és láthatóság” (csupa S/M)**: N-P0-1, N-P0-3, N-P0-4, N-P1-6, N-P1-7, N-P1-8, N-P1-11, N-P1-14, N-P1-15
2. **Sprint 2 — „adat és típusréteg”**: N-P1-2, N-P1-3 (indítás), N-P1-4, N-P1-5, N-P0-2 (verifikáció)
3. **Sprint 3 — „UX-hullám”**: N-P1-1, N-P1-10, N-P1-12, N-P2-1, N-P2-2 + [ux-motion-upgrade-plan](ux-motion-upgrade-plan-2026-08-30.md) 1. üteme + [footer-redesign](footer-redesign-2026-08-30.md)
4. **Sprint 4–6 — „admin”**: N-P1-13 (MVP az admin terv szerint), N-P2-5 vele közös sémamunkában
5. **Utána**: N-P1-9, N-P2-3, N-P2-4, N-P2-6…N-P2-13 érték/erőfeszítés arány szerint

## Megjegyzések

- A 07-24-es backlog nyitva maradt tételei közül ami itt nem szerepel újra (pl. URL-locale), az **tudatos döntéssel lezárt** — lásd a konszolidált státusz-doksit.
- Titkok, env-értékek nem szerepelnek a dokumentumban.

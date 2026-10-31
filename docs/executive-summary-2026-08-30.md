# 📊 Cookbook-Next — Vezetői összefoglaló

> **Dátum**: 2026-08-30 · A teljes dokumentumcsomag: lásd lent, „Kapcsolódó dokumentumok”.

> **Frissítés (2026-10-10):** az admin MVP elkészült: védett admin felület, metadata CRUD és auditnaplózás. Az alábbi audit-összesítés és a többi nyitott feladat a 2026-08-30-i állapotot tükrözi; a teljes dashboard és a felhasználó-/receptmoderáció továbbra is későbbi fejlesztés.

> **Frissítés (2026-10-31):** a 10 legfontosabb teendő státuszát a kóddal egyeztetve frissítettem (jelölések: ✅ kész, 🟡 részben kész, ❌ nyitott). Az admin felület azóta bővült: elkészült a dashboard (statisztikák és diagramok, 2026-10-30), a felhasználólista keresése, szűrése és lapozása, a szerepváltás, a felhasználó törlése és a részletező modál (2026-10-31). A felfüggesztés és a receptmoderáció továbbra is későbbi fázis.

## Mi valósult meg eddig

A 2026. júliusi auditok (07-04, 07-06, 07-24) 60 egyedi, összevont tételéből **30 lezárult (50%), 10 részleges, 16 nyitott, 4 tudatosan elvetett** a 2026-08-30-i felülvizsgálat szerint. A projekt a **teljes P0 biztonsági réteget lezárta**: nonce-alapú CSP (a javasoltnál erősebb megoldással), GraphQL operation- és field-szintű authorizáció, fail-closed strict rate limiting, sessionVersion-alapú token-revokáció, request-size limit, CI secret-scan. (A persisted-query registry nincs a request path-ra kötve, ezért nem tekintendő aktív allowlist-védelemnek.) Az architektúra-oldalon kész: cursor-pagináció, trigram full-text keresés (5 mezőn), centralizált cache-invalidáció, Metadata DB-modell + seed, sitemap/robots + kontrakt-tesztek, szerveroldali escaped JSON-LD, strukturált GraphQL-logging.

**Több helyen az implementáció eltért az eredeti javaslattól** (nonce-CSP a proxy-ban, trigram a tsvector helyett, deklaratív field-policy) — ezeket a konszolidált státusz-doksi 6. szekciója tételesen dokumentálja.

## A 10 legfontosabb teendő (javasolt sorrendben)

Állapot a kód alapján, 2026-10-31. A kész tételek át vannak húzva, a részlegesen kész és nyitott tételek mellett a hiányzó rész szerepel.

| #   | Teendő                                                                                                                                                                                                                                                                                                                                                              | Miért                                                                                       | Méret | Sprint |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- | ----- | ------ |
| 1   | ~~Saját recept értékelésének tiltása (N-P0-1)~~ ✅ **Kész (2026-08-30)**                                                                                                                                                                                                                                                                                            | Utolsó nyitott integritási rés; 07-06 óta ismert                                            | —     | —      |
| 2   | ❌ Hibamonitoring: Sentry free / GlitchTip (N-P0-3) — **nyitott**: a kódban nincs monitoring SDK és `instrumentation.ts`                                                                                                                                                                                                                                            | A maszkolt prod-hibák ma nyomtalanok                                                        | S/M   | **1**  |
| 3   | ~~darkTheme bekötése + dependency-trim (react-icons, nprogress) (N-P1-6, N-P1-11)~~ ✅ **Kész (ellenőrizve 2026-10-31)**: a `mantine.tsx` a színséma szerint választ a light és a dark téma között; a `react-icons` és a `@mantine/nprogress` nincs a `package.json`-ban                                                                                             | Kétszer megtervezett, olcsó, azonnali minőség                                               | —     | —      |
| 4   | 🟡 CI-kiegészítés: pnpm audit, prisma validate, Renovate (N-P1-7, N-P1-8) — **kész**: heti Dependabot (`.github/dependabot.yml`), gitleaks secret-scan, `codegen:check`; **hiányzik**: `pnpm audit` és `prisma validate` lépés a workflowból                                                                                                                         | A next-auth-beta-szerű beragadások megelőzése                                               | S     | **1**  |
| 5   | ❌ next-auth beta → stabil verifikáció (N-P0-2) — **nyitott**: a `package.json` még `5.0.0-beta.32`-t tartalmaz                                                                                                                                                                                                                                                     | 3 audit óta nyitott production-kockázat                                                     | M/L   | **2**  |
| 6   | 🟡 Validáció- és típusegységesítés ([validation](validation-unification-2026-08-30.md), [type](type-unification-2026-08-30.md) tervek) — **kész**: a típusok (a kliens a generált Document-eket, a resolverek a generált resolver-típusokat használják, a CI futtatja a `codegen:check`-et); **nyitott**: a szerveroldali megosztott recept-validáció (nincs `recipeInputSchema` a kódban) | Szerveroldali recept-validációs rés + használatlan codegen; a noImplicitAny-t is előkészíti | M/L   | **2**  |
| 7   | ~~Lista-projekciók szétválasztása (N-P1-2)~~ ✅ **Kész (2026-08-30)**: a listák és a DataLoaderek a `RECIPE_LIST_SELECT` projekciót használják                                                                                                                                                                                                                      | Felesleges DB/Redis/hálózati terhelés minden listaoldalon                                   | —     | —      |
| 8   | 🟡 UX-hullám: footer C-variáns ✅ **kész**; ❌ a mock recently-viewed még él (a `HomePage` a `mockRecentlyViewed.ts`-t használja); a rating-UX, a motion-upgrade 1–2. üteme és a responsive fixek állapotát nem ellenőriztem                                                                                                                                          | Látható termékminőség; a footer redesign elkészült, a többi feladat külön követendő         | M×4   | **3**  |
| 9   | ~~Admin MVP: Metadata CRUD + AuditLog + guard~~ ✅ **Kész (2026-10-10)** ([admin terv](admin-panel-plan-2026-08-30.md)); azóta a dashboard (2026-10-30) és a felhasználókezelés (szerepváltás, törlés, részletező modál, 2026-10-31) is kész                                                                                                                         | Védett admin felület, adatbázis-alapú taxonómia-karbantartás és admin auditnaplózás         | —     | —      |
| 10  | 🟡 a11y-automatizálás (axe a Playwrightban) ❌ + OG-image ✅ (**kész**: `opengraph-image.tsx` teszttel) + print/cook mode ❌                                                                                                                                                                                                                                         | Olcsó, ingyenes, felhasználói és SEO-érték                                                  | M     | **6**  |

Minden javaslat **ingyenes / free-tier** megoldásra épül (Sentry free vagy GlitchTip self-host, Neon branching, next/og, axe-core, Renovate, Vercel Blob Hobby).

### Mi alapján ellenőriztem a státuszokat (2026-10-31)

- `package.json`: nincs `react-icons`, `@mantine/nprogress`, monitoring SDK és `@axe-core/playwright`; a `next-auth` verziója `5.0.0-beta.32`.
- `.github/workflows/deploy.yml` és `.github/dependabot.yml`: a CI-ban van gitleaks, lint, `codegen:check`, typecheck, tesztek, e2e; nincs `pnpm audit` és `prisma validate`; a Dependabot heti frissítést futtat.
- `src/providers/mantine/mantine.tsx`: a téma a számított színséma szerint változik.
- `src/server/modules/recipe/types.ts`: `RECIPE_LIST_SELECT`, amelyet a repository, a user repository és a DataLoaderek használnak.
- `src/lib/graphql/queries.ts`, `mutations.ts`, a resolverek és a `codegen.ts`: generált Document-ek és resolver-típusok.
- `src/app/HomePage.tsx`: a mock recently-viewed lista még be van kötve.
- `src/app/recipes/[id]/opengraph-image.tsx` és a hozzá tartozó teszt létezik.

## Kapcsolódó dokumentumok

| Dokumentum                                                                         | Tartalom                                                                              |
| ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| [audit-status-consolidated-2026-08-30.md](audit-status-consolidated-2026-08-30.md) | Mindhárom korábbi doksi tételes, kód-evidenciás státusza + eltérő megoldások elemzése |
| [improvement-backlog-2026-08-30.md](improvement-backlog-2026-08-30.md)             | Új backlog: P0×4, P1×15, P2×14, sprint-tervvel                                        |
| [admin-panel-plan-2026-08-30.md](admin-panel-plan-2026-08-30.md)                   | A 07-06-os admin terv kritikai felülvizsgálata, MVP-státusz és későbbi fázisok        |
| [ux-motion-upgrade-plan-2026-08-30.md](ux-motion-upgrade-plan-2026-08-30.md)       | Motion-audit + komponensenkénti kód-javaslatok (StrictMode/CSP/reduced-motion-safe)   |
| [footer-redesign-2026-08-30.md](footer-redesign-2026-08-30.md)                     | Három footer-koncepció, a C variáns implementációs és ellenőrzési státuszával         |
| [logo-concepts-2026-08-30.md](logo-concepts-2026-08-30.md)                         | 8 logó-koncepció SVG-kóddal + használati mátrix                                       |
| [responsive-audit-2026-08-30.md](responsive-audit-2026-08-30.md)                   | 10 mobil/töréspont-probléma kódszintű javítással + motion-teljesítmény szabályok      |
| [validation-unification-2026-08-30.md](validation-unification-2026-08-30.md)       | Megosztott Zod-réteg terve (user-flow már megosztott; a recept-rés zárása)            |
| [type-unification-2026-08-30.md](type-unification-2026-08-30.md)                   | Négy típusforrás → codegen-központú architektúra, fájlonkénti lépésekkel              |
| [admin-users-and-content-plan-2026-10-30.md](admin-users-and-content-plan-2026-10-30.md) | A felhasználói admin tartalmak és a további admin-funkciók terve, státuszokkal   |
| [admin-user-management-plan-2026-10-31.md](admin-user-management-plan-2026-10-31.md) | A szerepváltás, a törlés és a részletező modál terve és döntései                    |

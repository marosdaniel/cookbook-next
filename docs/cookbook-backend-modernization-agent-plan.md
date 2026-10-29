# Cookbook-Next: backend modernizálási és átszervezési terv (LLM agentnek)

Dátum: 2026-10-29. Alapállapot: `package.json` 3.13.0, Next.js 16.4.x, Apollo Server 5, Prisma 7.10.x (Neon adapter), Upstash Redis, Auth.js `5.0.0-beta.32`, Biome, Vitest, Playwright, semantic-release, Sonar.

A dokumentum lépésenként kiadható feladatokat tartalmaz. Minden lépés önálló, ellenőrizhető és külön commitolható. A terv a `docs/cookbook-next-improvement-summary.md` (B1-B22) és a legutóbbi kódátnézés eredményein alapul.

---

## 0. Hogyan használd ezt a dokumentumot

1. Add oda az agentnek az **1. szakaszt (szabályok)** rendszerutasításként, majd egyetlen lépést egyszerre.
2. A lépések fázisokba rendezettek: **A** (biztonság), **B** (átszervezés), **C** (hatékonyság), **D** (eszközök és megfigyelhetőség). A fázisokon belül a sorrend számít, a fázisok között az A fázis az első.
3. Ahol a lépés "ELLENŐRIZD ELŐSZÖR" jelölést tartalmaz, az állítás nem teljesen bizonyított. Az agentnek előbb meg kell erősítenie, és ha nem igaz, jeleznie kell, nem szabad javítást erőltetni.
4. Ahol "EMBERI DÖNTÉS" szerepel, az agent nem dönthet egyedül: írja le a lehetőségeket, és álljon meg.

---

## 1. Szabályok az agentnek (minden lépésre érvényes)

```text
Projekt: cookbook-next (Next.js App Router, TypeScript, pnpm, Apollo Server 5, Prisma 7 + Neon, Upstash Redis, Auth.js v5 beta, Mantine).

Általános szabályok:
- Csak pnpm-et használj. Új csomagot csak akkor telepíts, ha a lépés kifejezetten megnevezi, vagy előbb jóváhagyást kérsz.
- A generált fájlokat (src/lib/graphql/generated/**, Prisma kliens) ne szerkeszd kézzel. GraphQL séma vagy operáció módosítása után futtasd: pnpm codegen.
- A publikus GraphQL API (mezők, műveletek, hibakódok) visszafelé kompatibilis marad, ha a lépés másképp nem mondja.
- Kód, kommentek és commit-üzenetek angolul; a dokumentáció (docs/) magyarul.
- Commit: Conventional Commits (semantic-release generálja belőle a verziót és a CHANGELOG-ot). A CHANGELOG.md-t soha ne szerkeszd kézzel.
- Egy lépés = egy PR-méretű commit (vagy kis commitsorozat). Ne keverj össze két lépést.
- Biztonság: titkot (jelszó, token, kulcs) ne logolj és ne írj tesztbe; a CSP-t (src/proxy.ts) ne gyengítsd; felhasználói adatot (email) ne logolj.
- Tesztek: minden viselkedésváltozáshoz frissíts vagy írj Vitest tesztet. A coverage küszöbök (vitest.config.mts: lines 23, statements 23, functions 19, branches 17) nem csökkenhetnek.
- Minden lépés végén futtasd, és csak akkor fejezd be, ha mind hibamentes:
    pnpm lint
    pnpm typecheck
    pnpm test:unit
    pnpm codegen:check
    pnpm build
- Mielőtt egy Next.js, Apollo, Prisma, Upstash vagy Auth.js API-t használsz, ellenőrizd a telepített verzió dokumentációját; ne feltételezz szignatúrát. A terv kódrészletei vázlatok.
- Ha egy feltevés nem igaz a kódban, állj meg és írd le, mit találtál.
- A lépés végén frissítsd a releváns dokumentumokat (docs/GRAPHQL.md, docs/cache-policy.md, README), és add meg a változások rövid összefoglalóját.
```

---

## 2. Megállapítások (kontextus az agentnek)

| ID  | Terület              | Megállapítás                                                                                                                                                                                                                                                                    | Fájlok                                                                                                   | Állapot                      |
| --- | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- | ---------------------------- |
| F1  | Jogosultság          | Az operation-szintű jogosultság az operation _nevén_ alapul, amit a kliens ír a dokumentumba                                                                                                                                                                                    | `src/app/api/graphql/route.ts` (`authPlugin`), `src/lib/graphql/operationsConfig.ts`, `authorization.ts` | Nyitott                      |
| F2  | Rate limit           | A limiter az operation nevét a kérés törzséből veszi (név vagy regex), így egy mutáció átnevezhető egy laza limitű műveletnek                                                                                                                                                   | `route.ts` (`extractOperationName`, `enforceRateLimit`), `src/lib/rateLimit/rateLimit.ts`                | Nyitott                      |
| F3  | Allowlist            | A `persistedQueryRegistry.ts` (`isPersistedQueryAllowed`) a repó kódjában nincs bekötve (ELLENŐRIZD ELŐSZÖR); a `docs/audit-status-consolidated-2026-08-30.md` S6 tétele "kész"-nek jelöli                                                                                      | `src/lib/graphql/persistedQueryRegistry.ts`, `protection.ts`                                             | Nyitott / dokumentáció eltér |
| F4  | Rate limit           | A `strictRateLimiter` egyetlen, 5 kérés/10 perces vödör az összes szigorú műveletre (resetPassword, create/edit/deleteRecipe, rate/deleteRating, admin metadata)                                                                                                                | `rateLimit.ts`                                                                                           | Nyitott                      |
| F5  | Rate limit           | A `createUser`, `changePassword`, `setNewPassword` csak a globális limitet kapja; a `resetPassword`-nek nincs email szerinti limitje                                                                                                                                            | `rateLimit.ts`, `UserService.ts`                                                                         | Nyitott                      |
| F6  | Belépés              | Az `authorize` nem limitált, nem kisbetűsíti az emailt (a regisztráció igen), nincs időzítés-kiegyenlítés, a bcrypt-hash-ek nem frissülnek argon2-re                                                                                                                            | `src/lib/auth/auth.ts`, `password.ts`                                                                    | Nyitott                      |
| F7  | Session              | A `session` callback visszavont tokennél hibát dob, az `await auth()` a route-ban `try/catch`-en kívül van; valószínűleg 500 jön 401 helyett (ELLENŐRIZD ELŐSZÖR)                                                                                                               | `auth.ts`, `route.ts`                                                                                    | Nyitott                      |
| F8  | Jelszó-visszaállítás | Email-küldési hiba csak létező fióknál ad 500-at (felhasználó-felderítés), szinkron küldés (időzítés), az email cím logba kerül                                                                                                                                                 | `UserService.resetPassword`                                                                              | Nyitott                      |
| F9  | Halott kód           | A `cleanUserRecipes` resolver no-op, jogosultság-ellenőrzés nélkül tölti be a felhasználó összes receptjét                                                                                                                                                                      | `src/lib/graphql/resolvers/user/mutations/cleanUserRecipes.ts`                                           | Nyitott                      |
| F10 | Adatmodell           | `Recipe.author` relációnál nincs `onDelete`; kötelező relációnál a Prisma alapértelmezése `Restrict`, így a felhasználótörlés receptes usernél elbukhat (ELLENŐRIZD ELŐSZÖR a migrációkban)                                                                                     | `prisma/schema.prisma`                                                                                   | Nyitott                      |
| F11 | Keresés              | A keresési ág nem használ `take`-et, memóriában rendez `indexOf`-fal, az `endCursor` `createdAt` alapú, a találati sorrend relevancia-alapú; a lapozás keresés közben valószínűleg következetlen                                                                                | `src/lib/services/RecipeService.ts` (`getRecipes`)                                                       | Nyitott                      |
| F12 | Cache                | A `rateRecipe` és `deleteRating` nyers `recipe:${id}` kulcsot töröl a `cacheKeys` helyett; a `UserService` beégetett `:all` kulcsokat használ; a Redis JSON-ból a `Date` mezők stringként jönnek vissza, de a típusok `Date`-et ígérnek (ELLENŐRIZD ELŐSZÖR a `cacheKeys.ts`-t) | `RecipeService.ts`, `UserService.ts`, `src/lib/cache/cacheKeys.ts`                                       | Nyitott                      |
| F13 | Rétegek              | A service-ek a GraphQL-rétegből importálnak (`@/lib/graphql/resolvers/...`, `MESSAGE_KEYS`) és GraphQL alakú payloadot adnak (`{ success, message, statusCode }`)                                                                                                               | `RecipeService.ts`, `UserService.ts`                                                                     | Nyitott                      |
| F14 | Hibakezelés          | Kétféle hibamodell: `throwCustomError` és `{ success: false, statusCode }` objektumok (kedvencek, követés)                                                                                                                                                                      | `UserService.ts`                                                                                         | Nyitott                      |
| F15 | Audit                | A `deleteAllUser` és `deleteAllRecipes` `console.warn`-nal naplóz, holott van `AuditLog`; az `AdminService.writeAuditLog` a művelet után fut és elnyeli a hibát                                                                                                                 | `UserService.ts`, `AdminService.ts`                                                                      | Nyitott                      |
| F16 | Teljesítmény         | A `jwt` callback minden hitelesítésnél DB-lekérdezést futtat a `sessionVersion`-ért                                                                                                                                                                                             | `auth.ts`                                                                                                | Nyitott                      |
| F17 | Teljesítmény         | `rateRecipe` három DB-hívás; a lista-DataLoaderek (`userRecipes`, `userFavoriteRecipes`) korlátlanok és hozzávalókat/lépéseket töltenek                                                                                                                                         | `RecipeService.ts`, `src/lib/dataloader/loaders.ts`                                                      | Nyitott                      |
| F18 | Rate limit           | A szigorú limiter 750 ms Redis-timeoutnál 503-at ad (fail-closed); nincs tartalék; `analytics: true` extra Redis-parancsokat használ                                                                                                                                            | `route.ts`, `rateLimit.ts`                                                                               | Nyitott                      |
| F19 | Redis                | `ConsecutiveBreaker(1)`: egyetlen átmeneti hiba 5 másodpercre kikapcsolja a cache-t                                                                                                                                                                                             | `src/lib/redis/redis.ts`                                                                                 | Nyitott                      |
| F20 | Config               | `NEXTAUTH_SECRET: z.string().min(1)`                                                                                                                                                                                                                                            | `src/env.ts`                                                                                             | Nyitott                      |
| F21 | Megfigyelhetőség     | `console.*` hívások, nincs tracing                                                                                                                                                                                                                                              | több fájl                                                                                                | Nyitott                      |
| F22 | Prisma               | A generator `prisma-client-js`, amely a Prisma 7 dokumentációja szerint a jövőben megszűnik                                                                                                                                                                                     | `prisma/schema.prisma`                                                                                   | Nyitott                      |

Már megtörtént (ne nyúlj hozzá): Redis `cockatiel` megszakító, Prisma `$allOperations` timeout bővítmény, `@t3-oss/env-nextjs`, admin metadata MVP `AuditLog`-gal, pg_trgm GIN indexek, nonce-alapú CSP.

Hatókörön kívül: GraphQL Yoga vagy Pothos migráció, az Effect bevezetése, adatbázis-szolgáltató csere, URL-alapú locale, next-auth stabil verzióra váltása (külön döntés).

---

## 3. A cél architektúra

```text
src/server/
├─ platform/            // db, cache, ratelimit, email, logger, env, errors
├─ modules/
│  ├─ recipe/           // service, repository, policy, schema (zod), cache
│  ├─ user/             // account, favorites, follows külön fájlban
│  ├─ metadata/
│  └─ admin/
└─ graphql/
   ├─ server.ts         // Apollo példány
   ├─ context.ts
   ├─ typeDefs/
   ├─ resolvers/        // vékony: auth + service hívás + hibafordítás
   └─ plugins/          // allowlist, rootFieldAuth, rateLimit, fieldAuth, logging
```

Függőségi irány (egyirányú): `resolver -> service -> repository -> Prisma`. A service nem importálhat a `graphql/` mappából. Az átállás fokozatos (strangler): a régi `src/lib/...` útvonalak addig maradnak működő re-exportként, amíg az utolsó importáló át nem kerül. Egy lépésben ne mozgass mindent.

---

## 4. A fázis: biztonság (P0/P1)

### A1. A persisted-query allowlist ténylegesen bekötése

**ELLENŐRIZD ELŐSZÖR (F3)**: keresd meg, hogy a `persistedQueryRegistry` bárhol be van-e kötve a futó kódban (route, plugin, proxy). Nézd meg, hogyan küld a kliens (Apollo Client) persisted query metaadatot. Írd le, mit találtál.

**Feladat**
1. Ha nincs bekötve: írj egy Apollo plugint (`src/server/graphql/plugins/allowlist.ts`, kezdetben `src/lib/graphql/plugins/`), amely a `didResolveOperation` előtt (például `requestDidStart` + `parsingDidStart`/`didResolveOperation`) a beérkező dokumentum normalizált SHA-256 hash-ét (`getPersistedQueryHashFromDocument`) ellenőrzi a `persistedQueryHashes` halmazban. Ismeretlen dokumentumot utasítson el `GraphQLError`-ral (`PERSISTED_QUERY_NOT_ALLOWED`, 400).
2. A regiszternek tartalmaznia kell a kliens összes dokumentumát. Vesd össze az `operations.graphql`, `queries.ts`, `mutations.ts` tartalmával és a `operationsConfig.ts` műveleteivel; a hiányzókat vedd fel. A `GET_RECIPES` és hasonló, a regiszterből hiányzó, de használt műveleteket külön jelezd.
3. Fejlesztői környezetben (`NODE_ENV !== 'production'`) legyen kikapcsolható környezeti kapcsolóval (`GRAPHQL_ALLOWLIST_ENFORCE`, alapértelmezés: bekapcsolva production-ben), hogy a GraphQL-eszközök (introspection) fejlesztéskor működjenek. A kapcsolót vedd fel az `src/env.ts`-be.
4. Frissítsd a `docs/GRAPHQL.md` fájlt, és javítsd az audit-státusz dokumentum S6 sorát a valós állapotra.

**Elfogadási feltételek**
- Egy a regiszterben nem szereplő dokumentum production módban elutasításra kerül; a kliens összes műveletét átengedi.
- Vitest teszt: ismert dokumentum átmegy, ismeretlen elbukik, normalizálás (`__typename` eltávolítás) után is egyezik.
- Playwright E2E (ha van GraphQL-t hívó teszt) zöld.

**Commit**: `feat(graphql): enforce persisted-query allowlist`

---

### A2. Jogosultság a gyökérmezők alapján

**Cél (F1)**: a művelet nevétől függetlenül a ténylegesen kért Query/Mutation gyökérmezők határozzák meg, ki hívhatja.

**Feladat**
1. Hozz létre egy szabálytérképet: `ROOT_FIELD_POLICY: Record<string, 'PUBLIC' | 'USER' | 'ADMIN'>` a séma összes Query és Mutation mezőjére. Forrás: a jelenlegi `operationsConfig.ts` (publicOperations, userOperations, adminOperations). A térkép alapértelmezése ismeretlen mezőre: `ADMIN` (fail-closed).
2. Írj plugint (`rootFieldAuth`), amely a `didResolveOperation`-ben a `requestContext.document` és `requestContext.operation` alapján összegyűjti a gyökérmezőket, a fragmenseket és inline fragmenseket is feloldva, majd minden mezőre ellenőrzi a szerepkört. Vázlat:

```ts
import {
  type DocumentNode,
  type FragmentDefinitionNode,
  Kind,
  type OperationDefinitionNode,
  type SelectionSetNode,
} from 'graphql';

export function collectRootFields(
  doc: DocumentNode,
  op: OperationDefinitionNode,
): string[] {
  const fragments = new Map<string, FragmentDefinitionNode>();
  for (const def of doc.definitions) {
    if (def.kind === Kind.FRAGMENT_DEFINITION)
      fragments.set(def.name.value, def);
  }
  const names: string[] = [];
  const walk = (set: SelectionSetNode) => {
    for (const sel of set.selections) {
      if (sel.kind === Kind.FIELD) names.push(sel.name.value);
      else if (sel.kind === Kind.INLINE_FRAGMENT) walk(sel.selectionSet);
      else {
        const frag = fragments.get(sel.name.value);
        if (frag) walk(frag.selectionSet);
      }
    }
  };
  walk(op.selectionSet);
  return names;
}
```

3. A `__typename` és (ha engedélyezett) introspekciós mezők kezelését külön döntsd el és teszteld. A jelenlegi operation-név ellenőrzés maradhat másodlagos, de nem lehet az egyetlen kapu.
4. Az operation nevet továbbra is kötelezővé teheted naplózási célra, de jogosultságra ne használd.
5. Írj egy **séma-lefedettségi tesztet**: a `typeDefs`-ből összes Query/Mutation mezőre létezik szabály a térképben (új mező felvételekor a teszt elbukik).

**Elfogadási feltételek**
- Teszt: `mutation GetRecipes { deleteAllUser(confirmation: "DELETE_ALL") }` névhamisítással elutasításra kerül nem-admin felhasználónak.
- Teszt: fragmentbe vagy inline fragmentbe rejtett gyökérmező is ellenőrzött.
- A séma-lefedettségi teszt zöld.

**Commit**: `feat(graphql): authorize operations by root fields`

---

### A3. Rate limit a valós műveletre, külön vödrök

**Cél (F2, F4, F5, F18)**

**Feladat**
1. Az operation-specifikus rate limitet vidd át egy Apollo pluginba (`rateLimit`), amely a `didResolveOperation`-ben a gyökérmezők alapján választ limitert. A route-ban csak az olcsó, parse előtti globális (IP alapú) limiter maradjon. Túllépésnél `GraphQLError` `RATE_LIMITED` kóddal és 429 http státusszal.
2. Cseréld a közös `strictRateLimiter` vödröt csoportonkénti limiterekre, külön prefixszel. Javasolt kiindulás (az értékeket indokold és tedd konfigurálhatóvá):

| Csoport           | Műveletek                                       | Kulcs  | Kiinduló limit     |
| ----------------- | ----------------------------------------------- | ------ | ------------------ |
| `auth-sensitive`  | `resetPassword`, `setNewPassword`, `createUser` | IP     | 5 kérés / 10 perc  |
| `password-change` | `changePassword`                                | userId | 5 kérés / 10 perc  |
| `content-write`   | `createRecipe`, `editRecipe`, `deleteRecipe`    | userId | 30 kérés / 10 perc |
| `rating`          | `rateRecipe`, `deleteRating`                    | userId | 60 kérés / 10 perc |
| `admin`           | admin metadata mutációk                         | userId | 60 kérés / 10 perc |

3. Adj hozzá email szerinti limitet a `resetPassword`-höz (kulcs: az email SHA-256 hash-e, például 3 kérés / óra), hogy egy áldozat postaládája ne legyen elárasztható több IP-ről. A hash-t használd kulcsnak, a nyers emailt ne.
4. Fail-closed viselkedés megtartása a szenzitív csoportoknál, de adj hozzá **példányszintű memóriabeli tartalék limitert** (egyszerű csúszóablak), amely Redis-kiesésnél aktiválódik, így az írás nem blokkolódik teljesen, de nem is marad védtelen.
5. Állítsd át az `analytics: true`-t konfigurálhatóra (alapértelmezés: kikapcsolva), hogy ne fogyassza fölöslegesen az Upstash ingyenes parancskeretét (500 ezer parancs/hó).

**Elfogadási feltételek**
- Teszt: két különböző csoport vödrei függetlenek (egy `rateRecipe` nem fogyasztja a `createRecipe` limitjét).
- Teszt: névhamisítás nem kerüli meg a limitet.
- Teszt: Redis-hiba esetén a tartalék limiter lép életbe.

**Commit**: `feat(ratelimit): per-group limiters on resolved operation`

---

### A4. Belépés védelme

**Cél (F6)**

**Feladat**
1. Az `authorize` függvényben (az Auth.js `authorize(credentials, request)` második paramétere a kérés; ELLENŐRIZD a beta.32-ben) alkalmazz rate limitet két kulccsal: email (SHA-256 hash, pl. 5 próba / 15 perc) és IP (pl. 20 próba / 15 perc). Túllépéskor ugyanaz az általános hibaüzenet legyen, mint rossz jelszónál.
2. Kisbetűsítsd az emailt (`credentials.email.toLowerCase()`), konzisztensen a regisztrációval.
3. Időzítés-kiegyenlítés: ha nincs ilyen felhasználó, futtass egy dummy `argon2.verify`-t egy előre generált hash ellen, hogy a válaszidő ne áruljon el semmit.
4. Transzparens hash-frissítés: sikeres belépéskor, ha a tárolt hash bcrypt (`$2...`) vagy `argon2.needsRehash` igaz, hashelj újra az `ARGON2_OPTIONS` szerint és mentsd el.
5. Ne logolj emailt vagy jelszót.

**Elfogadási feltételek**
- Teszt: `User@Example.com` és `user@example.com` ugyanazt a fiókot találja.
- Teszt: bcrypt hash sikeres belépés után argon2-re cserélődik.
- Teszt: limit túllépésekor nem derül ki, hogy létezik-e a fiók.

**Commit**: `feat(auth): throttle credentials login and harden authorize`

---

### A5. Visszavont session kezelése

**ELLENŐRIZD ELŐSZÖR (F7)**: tesztben (vagy Playwrighttal) igazold, hogy visszavont token esetén a GraphQL route 500-at ad.

**Feladat**
1. A route-ban az `await auth()` hívást tedd `try/catch` blokkba; hiba (visszavont session) esetén a kérés anonimként folytatódjon.
2. Gondold át, hogy a `session` callback hibadobás helyett adhat-e `null` session-t az Auth.js v5 beta.32 szerint; ha igen, azt preferáld.

**Elfogadási feltételek**: visszavont tokennel a védett művelet `UNAUTHENTICATED`/`FORBIDDEN` hibát ad, nem 500-at; a publikus lekérdezések működnek.

**Commit**: `fix(auth): treat revoked sessions as anonymous`

---

### A6. Jelszó-visszaállítás megerősítése

**Cél (F8)**

**Feladat**
1. A `resetPassword` mindig ugyanazt az általános választ adja, akár létezik a fiók, akár nem, akár sikerül az email-küldés, akár nem.
2. Az email-küldés a válasz után fusson a Next.js `after()` segítségével (`next/server`), a hibát logolja, de ne dobja vissza a kliensnek.
3. Távolítsd el a nem létező email cím és a felhasználó email címének logolását (`console.log` a `resetPassword`-ben és a `setNewPassword`-ben).
4. A `sendWelcomeEmail` "fire-and-forget" hívását is `after()`-re cseréld.

**Elfogadási feltételek**: teszt, hogy létező és nem létező email azonos választ ad email-hiba esetén is; nincs email cím a logban.

**Commit**: `fix(auth): uniform password-reset response and post-response email`

---

### A7. A `cleanUserRecipes` eltávolítása

**Cél (F9)**

**Feladat**: töröld a `cleanUserRecipes` resolvert, tesztjét, a séma és `operations.graphql` bejegyzéseit, az `operationsConfig.ts` és az `OPERATION_NAMES` hivatkozásait, a resolver-indexből a kivezetést. Futtasd a `pnpm codegen`-t.

**Elfogadási feltételek**: nincs maradék hivatkozás (`pnpm typecheck` zöld, a kódkeresés nem talál); a `codegen:check` zöld.

**Commit**: `chore(graphql): remove no-op cleanUserRecipes mutation`

---

### A8. `onDelete` döntés (EMBERI DÖNTÉS)

**Cél (F10)**

**Feladat**
1. **ELLENŐRIZD ELŐSZÖR**: a `prisma/migrations` alatt keresd meg a `recipes_createdBy_fkey` kényszert és az `ON DELETE` záradékát.
2. Írd le a lehetőségeket a tulajdonosnak, és **állj meg, amíg nem dönt**:
   - (a) `onDelete: Cascade`: a felhasználó törlésekor a receptjei is törlődnek;
   - (b) anonimizálás: `createdBy` nullable, `onDelete: SetNull`, a recept "törölt felhasználó" szerzővel megmarad (ez több kód- és UI-változtatást igényel);
   - (c) soft delete (`deletedAt`) a felhasználón.
3. A döntés után: írj Prisma migrációt, módosítsd a `deleteUser` és `deleteAllUser` logikáját, frissítsd a cache-érvénytelenítést (a törölt felhasználó receptjeinek kulcsai), és írj tesztet.

**Commit**: `fix(prisma): define referential action for recipe author`

---

### A9. Környezeti változók szigorítása

**Cél (F20)**: az `src/env.ts`-ben a `NEXTAUTH_SECRET` legyen `z.string().min(32)`. Ellenőrizd, hogy a Vercel és a helyi környezetek titkai megfelelnek (különben a build elbukik; erről tájékoztasd a tulajdonost). Adj hozzá minden új környezeti kapcsolót az `.env.example`-hez (ha van) és a README-hez.

**Commit**: `chore(env): enforce minimum secret length`

---

## 5. B fázis: átszervezés

### B1. A plugin-ok kiemelése a `route.ts`-ből

**Feladat**
1. Hozd létre a `src/server/graphql/plugins/` mappát. Mozgasd át a `loggingPlugin`, `authPlugin` (vagy az A2-ben írt `rootFieldAuth`), `fieldAuthPlugin`, az A1 allowlist és az A3 rate limit plugint külön fájlokba, egy `index.ts`-ből exportálva.
2. Mozgasd át az Apollo példány létrehozását (`server.ts`) és a kontextus-gyártót (`context.ts`). A `route.ts` ezután csak a HTTP-szintű ellenőrzéseket (metódus, content-type, törzsméret, globális limiter), a request-azonosítót és a handler hívását tartalmazza.
3. A viselkedés nem változhat; a meglévő `route.test.ts` és `route.branch.test.ts` tesztek változatlanul (legfeljebb az importok frissítésével) zöldek.

**Elfogadási feltételek**: `route.ts` rövid (az indikatív cél: a jelenlegi ~12 KB töredéke), a tesztek zöldek, a viselkedés azonos.

**Commit**: `refactor(graphql): extract plugins, server and context from route`

---

### B2. Domain-hibatípusok és egységes hibakezelés

**Cél (F14)**

**Feladat**
1. **Jóváhagyás kell az új csomaghoz**: `neverthrow`. Ha nincs jóváhagyva, használj egyszerű, saját `Result<T, E>` típust (`{ ok: true, value } | { ok: false, error }`).
2. Definiálj domain-hibatípusokat (`NOT_FOUND`, `FORBIDDEN`, `CONFLICT`, `VALIDATION`, `RATE_LIMITED`, `INTERNAL`) a `src/server/platform/errors.ts` fájlban.
3. Egyetlen helyen (resolver-segéd) fordítsd a domain-hibákat `GraphQLError`-ra és a meglévő payload-alakra (`{ success, message, messageKey, statusCode }`), hogy a kliens-szerződés ne változzon.
4. Kezdd a kedvencek és követés műveletekkel (`addToFavoriteRecipes`, `removeFromFavoriteRecipes`, `followUser`, `unfollowUser`), amelyek ma objektumot adnak vissza. A service Result-ot adjon, a payload-összeállítás a resolverbe kerüljön.
5. Fokozatosan a többi service is áttérhet; ebben a lépésben csak a fentiek.

**Elfogadási feltételek**: a kliens által látott válaszok (mezők, üzenetkulcsok, státuszkódok) változatlanok; a meglévő tesztek zöldek; új tesztek a hibafordításra.

**Commit**: `refactor(services): introduce domain errors and result types`

---

### B3. Service-ek leválasztása a GraphQL-rétegről

**Cél (F13)**

**Feladat**
1. A `RecipeService` által importált segédeket (`buildRecipeData`, `resolveRecipeMetadata`, `sanitizeRecipeInput`, `validateRequiredFields`, `NormalizedRecipeInput`) mozgasd a `src/server/modules/recipe/` alá.
2. A `UserService` GraphQL-függő importjait (`MESSAGE_KEYS`, `resolvers/types`, generált típusok) szüntesd meg: a service saját domain-típusokat használ, az üzenetkulcsok hozzárendelése a resolverbe kerül.
3. Hozz létre egy lint-szabályt a határ védelmére: a Biome `noRestrictedImports` override-jával tiltsd, hogy a `src/server/modules/**` importáljon a `src/server/graphql/**` vagy a `src/lib/graphql/**` mappából (a meglévő `biome.json` override mintáját kövesd).

**Elfogadási feltételek**: a service-ek nem importálnak a GraphQL-rétegből; a lint-szabály él, és a tesztek zöldek.

**Commit**: `refactor(services): decouple services from graphql layer`

---

### B4. Repository-réteg

**Feladat**
1. Hozz létre `RecipeRepository` és `UserRepository` modulokat, amelyek az egyetlen helyek, ahol Prisma-hívás történik az adott aggregátumra (lekérdezések, projekciók, `RECIPE_LIST_SELECT`).
2. A service-ek a repositoryt hívják, Prisma-típusokat nem szivárogtatnak ki a modul határán.
3. Tranzakciót igénylő többlépéses írások a repositoryn belül `prisma.$transaction`-nel fussanak.

**Elfogadási feltételek**: a service-fájlokban nincs közvetlen `prisma.` hívás; a tesztek a repositoryt mockolják (egyszerűbb, mint a Prisma mockolása).

**Commit**: `refactor(recipe,user): add repository layer`

---

### B5. A `UserService` szétbontása

**Feladat**: bontsd a `UserService`-t (~22 KB) modulokra: `AccountService` (regisztráció, jelszókezelés, profil, törlés), `FavoritesService`, `FollowService`. A régi `UserService` maradjon átmenetileg vékony homlokzat (facade) ugyanazokkal a metódusnevekkel, hogy a resolverek és a tesztek egyszerre ne törjenek el; a következő lépések eltávolíthatják.

**Elfogadási feltételek**: nincs viselkedésváltozás; minden meglévő teszt zöld; egyik új fájl sem nagyobb ~8 KB-nál (indikatív).

**Commit**: `refactor(user): split UserService into account, favorites and follows`

---

### B6. Egységes cache-modul

**Cél (F12)**

**ELLENŐRIZD ELŐSZÖR**: nézd meg a `cacheKeys.ts` kulcsformátumait, és hasonlítsd össze a `RecipeService`/`UserService` által törölt kulcsokkal. Írd le, melyik érvénytelenítés nem találja el a valódi kulcsot.

**Feladat**
1. Hozz létre egy `cached()` segédet a `src/server/platform/cache.ts` fájlban:

```ts
export async function cached<T>(opts: {
  key: string;
  ttlSeconds: number;
  load: () => Promise<T>;
}): Promise<T>;
```

Olvasás cache-ből, hiány esetén `load`, majd írás; Redis-hiba esetén csendes visszaesés az adatbázisra (a meglévő `redis` megszakító-burkoló használatával); strukturált naplózás a `console.warn` helyett (lásd D1).
2. **Dátumkezelés**: a cache-be kerülő értékekben a `Date` mezők stringként jönnek vissza. Alapértelmezett megoldás: a cache-elt értékhez DTO-t képezz, amelyben a dátumok ISO-stringek, és a GraphQL `DateTime` skalár (graphql-scalars) ezt fogadja. Ha szükséges, `superjson` bevezetése (új csomag, jóváhagyás kell).
3. **Single-flight** védelem: azonos kulcsra párhuzamos hiányok esetén egy `load` fusson példányon belül (memóriabeli `Map<string, Promise>`).
4. Minden kulcsot kizárólag a `cacheKeys.ts` építsen; távolítsd el a beégetett kulcsokat (`recipe:${id}`, `user:${id}:favorites:all`, `recipes:user:${id}:all`). A `rateRecipe` és `deleteRating` a `cacheKeys.recipeDetail`/`recipeLookup` kulcsokat érvénytelenítse (a slug kulcsot is).
5. Az érvénytelenítés a mutációk végén egyetlen helyen (`invalidate({ recipeId, slug, userId })`) történjen.

**Elfogadási feltételek**: teszt, hogy minden mutáció a helyes kulcsokat törli (különösen értékelésnél: a detail és a slug kulcs); a cache-elt és a frissen olvasott érték azonos alakú; a meglévő tesztek zöldek.

**Commit**: `refactor(cache): unify caching helper and key invalidation`

---

### B7. Architektúra-határok és holt kód ellenőrzése

**Feladat**
1. **Jóváhagyás kell**: `knip` fejlesztői függőségként. Hozz létre egy `knip.json`-t a projekthez (belépési pontok: Next.js app, a `scripts/`, a teszt- és konfigurációs fájlok). Futtasd, és jelents a talált használatlan fájlokról, exportokról és függőségekről.
2. Ne töröld automatikusan az összeset: a biztosan használatlanokat töröld, a bizonytalanokról készíts listát a tulajdonosnak.
3. Adj hozzá egy `pnpm knip` scriptet a `package.json`-ba, és (opcionálisan, kérdezd meg) egy CI lépést jelentés-módban.

**Commit**: `chore: add knip and remove dead code`

---

## 6. C fázis: hatékonyság

### C1. Keresés újraírása (TERVEZÉSI JÓVÁHAGYÁS KELL)

**Cél (F11)**

**Feladat**
1. **Előbb csak tervet írj** (egy rövid dokumentum a `docs/`-ba), amely leírja a keresési lekérdezést, a lapozási kurzor szerkezetét és a szűrőkkel való kombinálás módját. Állj meg a tulajdonos jóváhagyásáig.
2. Követelmények: a keresés SQL-ben történjen `LIMIT`-tel; a rendezés (relevancia, azonosító) legyen determinisztikus; a kurzor kódolja a `(score, id)` párt; a szűrők (kategória, nehézség, címkék, főzési idő) és a keresés együtt helyes lapozást adjanak; a `LEFT JOIN ingredients` + `GROUP BY` helyett fontold meg az `EXISTS` vagy előszűrt alkérdés használatát. Vázlat:

```sql
WITH scored AS (
  SELECT r.id,
         ROUND(MAX(GREATEST(
           similarity(r.title, $1),
           similarity(COALESCE(r.description, ''), $1),
           similarity(COALESCE(i.name, ''), $1)
         ))::numeric, 6) AS score
  FROM recipes r
  LEFT JOIN ingredients i ON i."recipeId" = r.id
  WHERE r.title % $1
     OR COALESCE(r.description, '') % $1
     OR COALESCE(r.tips, '') % $1
     OR COALESCE(r.substitutions, '') % $1
     OR COALESCE(i.name, '') % $1
  GROUP BY r.id
)
SELECT id, score FROM scored
WHERE ($2::numeric IS NULL OR (score, id) < ($2::numeric, $3))
ORDER BY score DESC, id DESC
LIMIT $4;
```

3. A teljes találatszám (`totalRecipes`) külön, olcsóbb lekérdezéssel vagy a keresési ágon opcionálisan számolt legyen.
4. A cursor-kódolás/dekódolás és az SQL-összeállítás egységtesztelhető legyen (a Vitestben nincs valódi adatbázis). Az end-to-end ellenőrzést a tulajdonos végzi Neon fejlesztői branchen; írd le a kézi tesztlépéseket.

**Commit**: `feat(recipe): keyset-paginated trigram search`

---

### C2. Session-ellenőrzés gyorsítótárazása

**Cél (F16)**

**Feladat**
1. Az `auth.ts` `jwt` callbackjében a `sessionVersion`-t előbb a Redisből olvasd (`session:v:{userId}`, TTL 60 másodperc), hiány esetén az adatbázisból, majd írd vissza. A Redis-hiba esetén visszaesés az adatbázisra.
2. A `sessionVersion` növelésekor (jelszóváltás, jelszó-visszaállítás, felhasználótörlés) a kulcsot azonnal töröld vagy frissítsd, hogy a visszavonás ne késsen a TTL-lel.
3. Dokumentáld a maximális visszavonási késleltetést.

**Elfogadási feltételek**: teszt, hogy jelszóváltás után a régi token elutasításra kerül; teszt, hogy a második hitelesítés cache-ből szolgálódik ki (nincs Prisma-hívás).

**Commit**: `perf(auth): cache session version in redis`

---

### C3. Kevesebb adatbázis-hívás

**Cél (F17)**

**Feladat**
1. A `rateRecipe` hívásait csökkentsd tranzakcióval (`$transaction`) és az `upsert` eredményének használatával; az értékelés utáni újraolvasást csak akkor tartsd meg, ha a válasz alakja megköveteli.
2. A `userRecipes` és `userFavoriteRecipes` DataLoaderek ne töltsenek hozzávalókat és lépéseket listanézethez (`RECIPE_LIST_SELECT`), és kapjanak felső korlátot (például a `resolveQueryLimit` szerinti maximum).
3. A `getFavoriteRecipes` és `getFollowing` használja a listaprojekciót és korlátot. A `getFollowing` felhasználónként legfeljebb 4 receptet tölt, ez maradhat, de hozzávalók nélkül.
4. **ELLENŐRIZD ELŐSZÖR** a Prisma 7 dokumentációjában a `relationLoadStrategy: 'join'` állapotát; ha stabil, mérd, hogy csökkenti-e a körutakat a listalekérdezéseknél.

**Elfogadási feltételek**: a GraphQL-válaszok alakja változatlan (a lista-lekérdezések amúgy sem kérnek hozzávalókat); a tesztek zöldek.

**Commit**: `perf(services): trim queries and bound list loaders`

---

### C4. Redis megszakító és limiter finomhangolása

**Cél (F18, F19)**

**Feladat**
1. A `ConsecutiveBreaker(1)` küszöböt tedd konfigurálhatóvá (alapértelmezés: 3-5 egymást követő hiba) az `src/env.ts`-ből vagy egy konstansból.
2. A szigorú limiter 750 ms-os időkorlátját tedd konfigurálhatóvá és dokumentáld; a tartalék limiter (A3) lépjen életbe, ne 503.
3. **ELLENŐRIZD ELŐSZÖR**: a `vercel.json` `regions` beállítását és a Neon/Upstash régióit; ha eltérnek, jelezd a tulajdonosnak (késleltetési hatás).

**Commit**: `chore(redis): tune circuit breaker threshold`

---

## 7. D fázis: eszközök és megfigyelhetőség

### D1. Strukturált naplózás (pino)

**Feladat**
1. **Jóváhagyás kell**: `pino`.
2. Hozz létre egy `src/server/platform/logger.ts` modult: JSON kimenet, redakció (`password`, `token`, `authorization`, `cookie`, `email`), `requestId` automatikus hozzáadása az `AsyncLocalStorage` kontextusból (a route-ban már van `requestStorage`).
3. Cseréld a `console.*` hívásokat a service-ekben, a cache-ben, a Redis- és a rate limit modulban és a GraphQL logging pluginban. A formátum a jelenlegi `graphql.request` eseménnyel kompatibilis maradjon.

**Commit**: `feat(observability): structured logging with pino`

---

### D2. OpenTelemetry

**Feladat**
1. **Jóváhagyás kell**: `@vercel/otel` és opcionálisan `@prisma/instrumentation`.
2. Hozz létre `instrumentation.ts` fájlt (a projekt `src/` mappát használ, ezért a `src/instrumentation.ts` útvonalon; ELLENŐRIZD a Next.js dokumentációban), `registerOTel` hívással.
3. Adj saját spant a GraphQL műveletekhez (operation név, durationMs, userClass a logolt formában) a logging plugin mellett.

**Commit**: `feat(observability): add opentelemetry instrumentation`

---

### D3. `after()` és audit tranzakcióban

**Cél (F15)**

**Feladat**
1. A visszafordíthatatlan admin műveletek (`deleteAllUser`, `deleteAllRecipes`) írjanak `AuditLog` bejegyzést ugyanabban a `prisma.$transaction`-ben, mint maga a törlés, a `console.warn` helyett.
2. Az `AdminService` metadata-műveleteinél az audit-írás maradhat a művelet után, de hiba esetén ne csak `console.error` legyen: használd a loggert (D1), és fontold meg az `after()`-t.
3. Az `assertAdminRole` duplikációját szüntesd meg egy központi `policy` modullal (`UserRole` enum használatával a jelenlegi `string` helyett).

**Elfogadási feltételek**: teszt, hogy a törlés és az audit-bejegyzés együtt sikerül vagy együtt bukik.

**Commit**: `feat(admin): transactional audit log for destructive actions`

---

### D4. Prisma 7 `prisma-client` generator (KÜLÖN BRANCH)

**Cél (F22)**

**Feladat**
1. Külön branchen cseréld a `generator client` providert `prisma-client`-re, add meg a kötelező `output` útvonalat, és frissítsd az importokat (`@prisma/client` → a generált útvonal) az egész kódbázisban és a Biome `noRestrictedImports` szabályában.
2. **ELLENŐRIZD ELŐSZÖR**: a Next.js 16 + Turbopack kombinációnál ismert buktatókat (például `serverExternalPackages`, `.prisma/client` feloldás); a `pnpm build`, `pnpm dev` és a Vercel build is menjen át.
3. A `package.json` `build`, `typecheck` és `postinstall` scriptjei maradjanak helyesek.
4. Ha bármi instabil, állj meg és jelents; a lépés elhalasztható.

**Commit**: `chore(prisma): migrate to prisma-client generator`

---

### D5. Dokumentáció és státusz frissítése

**Feladat**
1. Frissítsd: `docs/GRAPHQL.md` (allowlist, jogosultsági modell, rate limit csoportok), `docs/cache-policy.md` (új cache-modul), `README.md` (új környezeti változók, scriptek).
2. Javítsd a `docs/audit-status-consolidated-2026-08-30.md` S6 sorát (vagy a folytatásban hozz létre új státuszdokumentumot a mai dátummal), és jelöld az elkészült tételeket.
3. Írj egy `docs/architecture.md` fájlt a 3. szakasz struktúrájával és a függőségi szabályokkal.

**Commit**: `docs: document backend architecture and security model`

---

## 8. Állapotkövető

| Lépés | Téma                                     | Prioritás | Állapot |
| ----- | ---------------------------------------- | --------- | ------- |
| A1    | Persisted-query allowlist bekötése       | P0        | [x]     |
| A2    | Jogosultság gyökérmezők alapján          | P0        | [x]     |
| A3    | Rate limit valós műveletre, külön vödrök | P0        | [x]     |
| A4    | Belépés védelme                          | P0        | [x]     |
| A5    | Visszavont session kezelése              | P1        | [x]     |
| A6    | Jelszó-visszaállítás megerősítése        | P1        | [x]     |
| A7    | `cleanUserRecipes` eltávolítása          | P1        | [x]     |
| A8    | `onDelete` döntés (`Cascade`)            | P1        | [x]     |
| A9    | Környezeti változók szigorítása          | P2        | [x]     |
| B1    | Plugin-ok kiemelése a route-ból          | P1        | [x]     |
| B2    | Domain-hibák, egységes hibakezelés       | P2        | [x]     |
| B3    | Service-ek leválasztása a GraphQL-ről    | P1        | [x]     |
| B4    | Repository-réteg                         | P2        | [x]     |
| B5    | `UserService` szétbontása                | P2        | [x]     |
| B6    | Egységes cache-modul                     | P1        | [x]     |
| B7    | Knip és holt kód                         | P2        | [x]     |
| C1    | Keresés újraírása                        | P1        | [x]     |
| C2    | Session-ellenőrzés cache                 | P2        | [x]     |
| C3    | Kevesebb DB-hívás                        | P2        | [x]     |
| C4    | Redis megszakító és limiter hangolás     | P2        | [x]     |
| D1    | pino naplózás                            | P2        | [x]     |
| D2    | OpenTelemetry (elhalasztva)              | P2        | [-]     |
| D3    | Tranzakciós audit                        | P1        | [x]     |
| D4    | Prisma `prisma-client` generator (hal.)  | P2        | [-]     |
| D5    | Dokumentáció                             | P2        | [x]     |

---

## 9. Végső ellenőrzőlista (Definition of Done)

- [x] `pnpm lint`, `pnpm typecheck`, `pnpm test:unit`, `pnpm codegen:check`, `pnpm build` zöld.
- [ ] A `pnpm test:e2e` (Playwright) zöld.
- [x] A coverage küszöbök nem csökkentek.
- [x] Névhamisítással (más operation név) sem kerülhető meg a jogosultság és a rate limit (A2, A3 tesztjei).
- [x] Nem szerepelnek titkok, email címek vagy jelszavak a logban.
- [x] A service-ek nem importálnak a GraphQL-rétegből, és ezt a lint kikényszeríti.
- [x] A dokumentáció és az audit-státusz a valós állapotot tükrözi.
- [x] A tulajdonos jóváhagyta az "EMBERI DÖNTÉS" és "JÓVÁHAGYÁS KELL" jelölésű lépéseket (A8, B2, B6 `superjson`, B7, C1, D1, D2, D4).

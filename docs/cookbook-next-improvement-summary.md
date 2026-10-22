# Cookbook-Next: Improvement javaslatok összefoglalója

Készült: 2026-10-13. Hatókör: a beszélgetésekben tárgyalt összes fejlesztési javaslat (backend, biztonság, adatmodell, UX/motion, új technológiák, ingyenes platform-szolgáltatások).

Jelmagyarázat: **P0** = kritikus/biztonsági, **P1** = fontos, **P2** = nice-to-have. Munkaigény: **S** (órák), **M** (1-2 nap), **L** (több nap).

> Fontos: a backend-lelet a `marosdaniel/cookbook-next` repó olvasott fájljain alapul (`RecipeService`, `UserService`, `AdminService`, `schema.prisma`, `route.ts`, `operationsConfig.ts`, `rateLimit.ts`, `persistedQueryRegistry.ts`, `auth.ts`, `password.ts`, `loaders.ts`, `proxy.ts`, `package.json`). **Nem** olvastam: email-modul, `env.ts`, `MetadataService`, recept-resolverek, migrációk, `auth.config.ts`. Ahol bizonytalan a következtetés, "ellenőrizd" jelölés szerepel.

---

## 0. Gyors áttekintés (prioritás szerint)

| ID  | Téma                                                               | Prioritás | Munka |
| --- | ------------------------------------------------------------------ | --------- | ----- |
| B1  | Operation-name alapú jogosultság és rate limit kijátszható         | P0        | M     |
| B2  | Persisted-query allowlist nincs bekötve                            | P0        | M     |
| B3  | Belépés (login) rate limit/zárolás hiánya                          | P0        | S     |
| B4  | Közös "strict" rate limit vödör (5/10 perc) túl szűk               | P1        | S     |
| B5  | `Recipe.author` `onDelete` hiánya, `deleteUser` hibája             | P1        | S     |
| B6  | Jelszó-visszaállítás: felhasználó-felderítés, email szerinti limit | P1        | S     |
| B7  | Visszavont session 500-as hibát okozhat                            | P1        | S     |
| B8  | Keresés: lapozás, rendezés, indexek                                | P1        | M     |
| B9  | Login: email kisbetűsítés, időzítés-kiegyenlítés                   | P1        | S     |
| B10 | Versenyhelyzetek ("check-then-write")                              | P1        | S     |
| B11 | Redis cache: Date-típushiba, következetlen invalidálás             | P1        | M     |
| B12 | `cleanUserRecipes` no-op resolver törlése                          | P1        | S     |
| B13 | Hibakezelés egységesítése (`Result`)                               | P2        | M     |
| B14 | Audit tranzakcióba, `deleteAll*` műveletek naplózása               | P1        | S     |
| B15 | Megfigyelhetőség (OTel, pino)                                      | P2        | M     |
| B16 | `after()` az email és audit műveletekhez                           | P2        | S     |
| B17 | Adatmodell: JSON mezők, státusz, soft delete                       | P2        | L     |
| B18 | DataLoaderek lapozása, lista-lekérdezések                          | P2        | M     |
| B19 | Prisma 7 `prisma-client` generator                                 | P2        | M     |
| B20 | Jelszó-hash frissítés (bcrypt → argon2)                            | P2        | S     |
| B21 | Integrációs tesztek valódi Postgresszel                            | P2        | M     |
| B22 | CSP reporting, Trusted Types                                       | P2        | S     |

---

## 1. Backend: biztonság

### B1. Az operation name nem hiteles (P0, M)

**Hol**: `src/app/api/graphql/route.ts` (`authPlugin`, `enforceRateLimit`), `src/lib/graphql/operationsConfig.ts`, `src/lib/rateLimit/rateLimit.ts`.

**Probléma**: a jogosultsági ellenőrzés (`assertGraphQLOperationAuthorized`) és a rate limiter is az operation name alapján dönt. Ezt a nevet a kliens írja a GraphQL dokumentumba. Egy támadó a mutációját elnevezheti egy publikus műveletnek (pl. `GetRecipes`), ekkor:
- az auth-ellenőrzés publikus műveletnek látja,
- a rate limiter a laza globális limitet (100/perc) alkalmazza a szigorú helyett.

A kommentár szerint a kliens által küldött `operationName` nem megbízható, de az Apollo által feloldott név is a kliens által írt név.

**Enyhítő tényező**: a resolverek és a service-ek külön ellenőrzik a `userId`-t és a szerepkört (pl. `changePassword`, `deleteAllUser`, `AdminService.assertAdminRole`), tehát a tényleges kár korlátozott. Ez azonban nem mentesít a rétegezett védelem kijavítása alól.

**Javítás**:
1. A jogosultságot a művelet **gyökérmezői (root field)** szerint ellenőrizd (`requestContext.operation.selectionSet`), ne a név szerint. Térképezd a gyökérmezőket szerepkörökre (`createRecipe` → USER, `deleteAllUser` → ADMIN, stb.).
2. A rate limitet is az Apollo `didResolveOperation` fázisában alkalmazd (a valós művelettel), ne a nyers kérés-törzsből regexszel kinyert névvel.
3. A `GraphQLError` kóddal (`RATE_LIMITED`) lehet visszautasítani.

### B2. A persisted-query allowlist nincs bekötve (P0, M)

**Hol**: `src/lib/graphql/persistedQueryRegistry.ts`.

**Probléma**: az `isPersistedQueryAllowed` függvény létezik és tesztelt, de a kódkeresés szerint sehol nem hívják meg. Az alkalmazás kliens-dokumentumainak fix halmaza van (26 dokumentum a regiszterben), ez tökéletes engedélyezőlista lenne.

**Javítás**: kényszerítsd ki az allowlistet a route-ban vagy egy Apollo pluginban: a beérkező dokumentum hash-e szerepeljen a regiszterben. Ezzel a név és a dokumentum tartalma összekötődik, és a B1 kijátszási útvonala bezárul. A persisted queries mint "az első féltől származó műveletek engedélyezőlistája" az Apollo hivatalos mintája. Az Apollo Client oldalon a manifest generálható a build során.

**Figyelem**: az Apollo Router (GraphOS) fizetős; a szerveroldali ellenőrzést a saját pluginodban érdemes megírni.

### B3. A belépés védtelen a brute force ellen (P0, S)

**Hol**: `src/lib/auth/auth.ts`, `authorize`; az `src/app/api/auth` alatt a kódkeresés nem talált rate limitet.

**Probléma**: a credentials-alapú belépésnek nincs rate limitje vagy zárolása. Az argon2 beállítás 64 MiB memóriát használ hashenként, így a párhuzamos próbálkozás erőforrás-kimerítésre is alkalmas.

**Javítás**: Upstash rate limit az `authorize`-ban: egyik kulcs az email (pl. 5 próba/15 perc), másik az IP (pl. 20 próba/15 perc). Mindkét limiternél egységes hibaüzenet.

### B4. A "strict" rate limit vödör közös és túl szűk (P1, S)

**Hol**: `src/lib/rateLimit/rateLimit.ts`.

**Probléma**: a `strictRateLimiter` egyetlen, 5 kérés/10 perces vödör, amelyet a `resetPassword`, `createRecipe`, `editRecipe`, `deleteRecipe`, `rateRecipe`, `deleteRating` és az admin metadata-műveletek közösen használnak. Egy felhasználó 10 perc alatt összesen 5 szerkesztést vagy értékelést tud végezni. Ez valószínűleg nem szándékos.

**Javítás**: műveletcsoportonként külön limiter (auth/érzékeny, tartalom-írás, értékelés, admin), külön prefixszel és ésszerű limitekkel. A `createUser`, `changePassword` és `setNewPassword` is kapjon saját szigorú limitet.

### B6. Jelszó-visszaállítás (P1, S)

**Hol**: `UserService.resetPassword`.

**Problémák**:
- Ha az email-küldés elbukik, csak létező fióknál jön 500 hiba. Ez felhasználó-felderítést enged.
- A küldés szinkron, így az időkülönbség is elárulja a fiók létezését.
- A nem létező email-cím és a felhasználó email-címe is bekerül a logba (PII).
- Nincs email szerinti limit, így egy áldozat postaládája több IP-ről elárasztható.

**Javítás**: a küldés `after()`-ben, mindig azonos válasz, PII nélküli log, email szerinti limiter (pl. 3/óra).

### B7. A visszavont session 500-at okozhat (P1, S)

**Hol**: `auth.ts` `session` callback (`throw new Error('Session has been revoked')`), `route.ts` (`await auth()` a `try` blokkon kívül).

**Probléma**: valószínűleg 500 hiba jön 401 helyett (**ellenőrizd** tesztben).

**Javítás**: az `auth()` hívást `try/catch`-be, a visszavont session legyen anonim kérés.

### B9. Belépés: email és időzítés (P1, S)

- A regisztráció kisbetűsíti az emailt, az `authorize` nem: `User@Example.com` címmel a belépés hibát ad. Kisbetűsíts az `authorize`-ban is.
- Ha nincs ilyen felhasználó, a függvény azonnal visszatér, ha van, argon2 ellenőriz. Ez időzítés-alapú felhasználó-felderítést enged. Javítás: dummy hash-ellenőrzés.

### B10. Versenyhelyzetek (P1, S)

**Hol**: `createUser`, `assertSlugAvailable`, `addToFavoriteRecipes`, `followUser`.

**Probléma**: "először ellenőrzöm, aztán írom" minta. A `userName` DB-szintű egyedisége kis-nagybetű érzékeny, az ellenőrzés nem (`Dani` és `dani` versenyhelyzetben is létrejöhet).

**Javítás**: az egyediségi megszorításra támaszkodj és kezeld a `P2002` hibát (az `AdminService` már így csinálja). A felhasználónévhez `citext` vagy `lower()` egyedi index.

### B12. `cleanUserRecipes` (P1, S)

Egy régi no-op: az összes receptet betölti egy felhasználóhoz, jogosultság-ellenőrzés nélkül, és mindig `true`-t ad. **Töröld** a resolverrel, a típusdefinícióval, az operation konfigurációval és a tesztekkel együtt.

### B14. Audit (P1, S)

- A `deleteAllUser` és `deleteAllRecipes` `console.warn`-nal naplóz, holott van `AuditLog` tábla. Írjon oda is.
- Az `AdminService.writeAuditLog` a művelet után fut és elnyeli a hibát. A visszafordíthatatlan műveleteknél ugyanabba a `prisma.$transaction`-be tedd, hogy ne lehessen napló nélküli törlés.

### B20. Jelszó-hash frissítés (P2, S)

Az argon2id beállítás (64 MiB, t=3, p=1) az OWASP minimuma (19 MiB, t=2, p=1) fölött van. A `verifyPassword` támogatja a régi bcrypt-hash-eket, de nem frissíti őket. Javítás: sikeres belépéskor, ha a hash bcrypt vagy `argon2.needsRehash` igaz, hashelj újra és mentsd.

### B22. CSP-fejlesztések (P2, S)

- `report-to`/`report-uri` direktíva, `Content-Security-Policy-Report-Only` módban új direktívák gyűjtéséhez.
- `require-trusted-types-for 'script'` először csak Report-Only módban (saját ajánlás, éles bekapcsolás előtt ellenőrizd).

---

## 2. Backend: adat és teljesítmény

### B5. `onDelete` hiánya (P1, S)

**Hol**: `schema.prisma`, `Recipe.author` (`@relation("UserRecipes", ...)`).

**Probléma**: nincs megadva `onDelete`. Kötelező relációnál a Prisma alapértelmezése `Restrict`, így a `deleteUser` és `deleteAllUser` valószínűleg elbukik, ha a usernek van receptje. A migráció SQL-jét nem néztem, **ellenőrizd**.

**Javítás**: döntsd el a szándékot: kaszkádolt törlés, anonimizálás (a recept megmarad "törölt felhasználó" szerzővel), vagy soft delete (`deletedAt`). Írj hozzá migrációt és tesztet.

### B8. Keresés (P1, M)

**Hol**: `RecipeService.getRecipes`, keresési ág.

**Problémák**:
- a keresési ág nem használ `take`-et,
- a találatokat similarity szerint kéri, majd memóriában `indexOf`-fal rendezi újra,
- az `endCursor` `createdAt` alapú, a találati sorrend viszont relevancia alapú, így a következő oldal valószínűleg következetlen,
- a sémában csak btree `@@index([title])` van, ami a `%` trigram-operátort nem gyorsítja (a migrációkat nem néztem).

**Javítás**:
1. Keyset-lapozás (score, id) szerint SQL-ben, `LIMIT`-tel.
2. GIN `gin_trgm_ops` indexek a keresett oszlopokra.
3. Alternatíva: Postgres full-text (`tsvector` generált oszlop) `unaccent`-tal a magyar ékezetekhez.

### B11. Redis cache (P1, M)

**Problémák**:
- az Upstash JSON-ból a `Date` mezők stringként jönnek vissza, de a típusok `Date`-et ígérnek,
- a `rateRecipe` és `deleteRating` nyers `recipe:${id}` kulcsot töröl a `cacheKeys` helyett (a tényleges kulcsformát nem ismerem, stale cache gyanú, **ellenőrizd**),
- a `UserService` beégetett `:all` kulcsokat használ, és csak a limit nélküli változatot érvényteleníti,
- a cache-segédfüggvények duplikáltak a `RecipeService` és a `UserService` között, `console.warn/error` logolással.

**Javítás**: egyetlen cache-modul `cached(key, ttl, loader, schema)` függvénnyel: sémavalidált olvasás (Zod) vagy `superjson`, egységes kulcsok a `cacheKeys`-ből, single-flight (stampede védelem), strukturált logolás.

### B17. Adatmodell (P2, L)

- **JSON metaadat-mezők** (`category`, `difficultyLevel`, `labels`, ...): JSON-path szűrés index nélkül. Mivel a `Metadata` tábla kulcsait már seedelted, vezess be `categoryKey` és `difficultyKey` skalár oszlopot vagy FK-t.
- **Státusz**: `status` (DRAFT/PUBLISHED) a piszkozatokhoz.
- **Soft delete**: `deletedAt` a visszavonható törléshez.
- **Értékelés**: az átlag és a darabszám jelenleg DataLoaderrel, `groupBy`-jal számolódik, ami jó. Denormalizált `avgRating`/`ratingCount` csak akkor kell, ha rating szerint akarsz rendezni.

### B18. Listák és DataLoaderek (P2, M)

- A `getFavoriteRecipes` és `getFollowing` listanézethez is betölti az összes hozzávalót és lépést, pagináció nélkül. Használd a `RECIPE_LIST_SELECT` mintát és cursor-lapozást.
- A `userRecipes` és `userFavoriteRecipes` DataLoader korlátlan, `include: { ingredients, preparationSteps }`-szel.
- A `recipeAuthor` loader az email-t is lekéri. A `fieldAuthPlugin` védi a `User` mezőit, de szűkebb `select` biztonságosabb.

### B19. Prisma 7 generator (P2, M)

A séma `prisma-client-js` generatort használ. A Prisma 7 dokumentációja szerint ez a jövőben eltávolításra kerül, az új provider a `prisma-client` kötelező `output` útvonallal. A Next.js 16 + Turbopack kombinációnál egyes beszámolók külön problémákat említenek (pl. `serverExternalPackages`), ezért **külön branchen** próbáld ki.

### B21. Tesztelés (P2, M)

Valódi Postgres elleni integrációs tesztek (Testcontainers vagy Neon branch), főleg a cursor-lapozásra, a trigram-keresésre és az `onDelete` viselkedésre. Ha a service-teszteid mockolt Prismát használnak (nem ellenőriztem), ezeket nem fedik le.

---

## 3. Backend: architektúra és eszközök

### B13. Egységes hibakezelés (P2, M)

A favorites/follow metódusok `{ success: false, statusCode, messageKey }` objektumot adnak, a többi `throwCustomError`-t. Válassz egy stílust. Javaslat: `neverthrow` `Result<T, E>` a service-ekben, a resolver egyetlen helyen fordítja `GraphQLError`-ra. Ez a fordítóval kényszeríti ki a hibaágak kezelését.

```ts
import { err, ok, type Result } from 'neverthrow';

type RecipeError =
  | { code: 'NOT_FOUND' }
  | { code: 'FORBIDDEN' }
  | { code: 'DB_ERROR'; cause: unknown };

async function updateRecipe(
  id: string,
  userId: string,
  data: UpdateRecipeInput,
): Promise<Result<Recipe, RecipeError>> {
  const recipe = await prisma.recipe.findUnique({ where: { id } });
  if (!recipe) return err({ code: 'NOT_FOUND' });
  if (recipe.createdBy !== userId) return err({ code: 'FORBIDDEN' });
  return ok(await prisma.recipe.update({ where: { id }, data }));
}
```

### Egyéb architektúra-javaslatok

- A `userRole` mindenhol sima `string`, holott van `UserRole` enum. Használd az enumot, az `assertAdminRole` duplikációját szüntesd meg egy központi `policy` modullal (vagy CASL könyvtárral).
- A visszafordíthatatlan műveletekhez használj `prisma.$transaction`-t.

### B15. Megfigyelhetőség (P2, M)

- `@vercel/otel` és `instrumentation.ts` (a `src` mappa használata esetén a `src` alatt). Next.js hivatalos útmutató.
- `@prisma/instrumentation` a lekérdezés-spanekhez.
- `pino` strukturált logolás PII-redakcióval a `console.*` hívások helyett. A `requestId` és az AsyncLocalStorage már megvan.

### B16. `after()` (P2, S)

A Next.js `after()` a válasz után futtat munkát (naplózás, email). Cseréld erre a "fire-and-forget" `.catch(...)` mintát (üdvözlő email), ami szerverlessen elveszhet.

### Háttérfeladatok (opcionális)

Újrapróbálható emailekhez ingyenes csomaggal rendelkezik az Inngest és az Upstash QStash. A pontos limiteket nem ellenőriztem, nézd meg a szolgáltatónál.

---

## 4. Az Effect képességeinek célzott kiváltása

Az Effect teljes bevezetését nem javaslom (meredek tanulási görbe, az egész kódbázist érintené). A képességeit célzott eszközökkel fedheted le:

| Effect képesség       | Jelenlegi állapot                | Javasolt eszköz                        |
| --------------------- | -------------------------------- | -------------------------------------- |
| Schema/validáció      | Zod 4 megvan                     | Maradj a Zodnál                        |
| Típusos hibák         | `try/catch`, GraphQL hibák       | neverthrow                             |
| Retry/timeout/backoff | Nincs                            | cockatiel vagy p-retry (saját ajánlás) |
| Dependency injection  | Service objektumok               | Kézi constructor injection             |
| Tracing/logging       | Csak Speed Insights              | `@vercel/otel` + pino                  |
| Env/config validáció  | Az `env.ts` tartalmát nem néztem | `@t3-oss/env-nextjs` (Zodra épül)      |
| Batching              | DataLoader megvan                | Nincs teendő                           |

Retry/timeout jelöltek: Nodemailer (átmeneti SMTP-hiba), Neon cold start, Upstash (tudatos fail-open/fail-closed döntés).

---

## 5. Cutting-edge technológiák (ingyenesek)

| Terület                               | Haszon           | Kockázat            | Javaslat               |
| ------------------------------------- | ---------------- | ------------------- | ---------------------- |
| View Transitions (`<ViewTransition>`) | Magas, látványos | Alacsony            | Kezdd ezzel            |
| `use cache` az adatrétegen            | Közepes          | Alacsony            | Második lépés          |
| Teljes PPR / Cache Components         | Magas            | Közepes (CSP nonce) | Csak külön branchen    |
| Passkey (SimpleWebAuthn)              | Közepes          | Közepes             | Opcionális, kiegészítő |
- **View Transitions**: a receptkártyáról a részletoldalra az kép és a cím "átrepülhet". A `view-transition-name` legyen egyedi (`recipe-${id}`). `prefers-reduced-motion` esetén kapcsold ki. A motion az oldalon belüli mikro-animációkat viszi.
- **Cache Components és PPR**: a nonce-alapú CSP és a cookie-ból olvasott locale kérésfüggő renderelést jelent, ami szembemegy a statikus váz elvével. Ezért előbb csak a `use cache` az adatrétegen (kategóriák, publikus listák, `revalidateTag` adminművelet után).
- **Passkey**: az Auth.js beépített Passkeys providere kísérleti és DB-adaptert igényel, nem ajánlott élesben. Kiegészítésként, a jelszavas belépés megtartásával vezesd be.

---

## 6. Új funkció-ötletek

| Ötlet                                        | Haszon   | Munka   | Kockázat                     |
| -------------------------------------------- | -------- | ------- | ---------------------------- |
| Főzés mód + Screen Wake Lock                 | Magas    | Kicsi   | Alacsony                     |
| Installálható PWA (manifest)                 | Magas    | Kicsi   | Alacsony                     |
| Web Push (követett felhasználók új receptje) | Közepes  | Közepes | iOS: csak telepített PWA-nál |
| Web Share API                                | Közepes  | Kicsi   | Alacsony                     |
| Popover API / anchor positioning             | Alacsony | Közepes | Egyenetlen böngészőtámogatás |
- **PWA**: a Next.js beépítetten támogatja a manifestet (`src/app/manifest.ts`). Az offline rész kísérleti, tényleges offline recepthez Serwist és IndexedDB kell. A CSP-ben ellenőrizd a `worker-src` és `manifest-src` direktívákat.
- **Főzés mód**: lépésenkénti nézet nagy betűvel, a képernyő nem alszik el. A PWA-ként telepített appban a leghasznosabb.
- **Recipe rich result**: a JSON-LD-t kösd össze a videóval `@id`-vel, ellenőrizd a Rich Results Testtel.
- **Mantine marad** a legtöbb lebegő UI-hoz, az anchor positioning csak saját könnyű tooltiphez éri meg.

---

## 7. UX és motion ötletek

- **`layoutId` szűrők**: a receptszűrők aktív jelzése átcsúszik a kiválasztott elemre. A `layoutId`-s elemeket az `AnimatePresence`-en kívül kell tartani.
- **Spring mikro-interakciók**: kedvenc szív `whileTap` rugós ugrással, animált adagszám az adagváltásnál.
- **Cursor-követő fény** a kártyákon (csak asztali gépen, `useSpring`).
- **Scrollhoz kötött receptoldal**: `useScroll` + `useTransform` a hero-képhez, `whileInView` a lépésekhez, oldalsó folyamatjelző.
- **CSS `animation-timeline`**: nulla JavaScriptes alternatíva dekoratív effektekhez, `@supports` védelemmel. Firefoxnál csak újabb verziótól támogatott, az MDN még nem tekinti Baseline-nak.
- **Drag gesztusok**: kártya-lapozás (kedvenc/elrejtés) és a hozzávalók/lépések átrendezése húzással (saját ajánlás: motion `Reorder`).

Elvárások: minden animációnál `prefers-reduced-motion` kezelés (`MotionConfig reducedMotion="user"`), a gesztusokhoz gombos alternatíva, mobilon a teljesítmény ellenőrzése.

---

## 8. Ingyenes Vercel-szolgáltatások

| Feature                 | Hobby limit                  | Haszon                                                               |
| ----------------------- | ---------------------------- | -------------------------------------------------------------------- |
| Flags SDK + Edge Config | 100 000 olvasás, 100 írás/hó | Dashboardból állítható feature flag és konfig-érték, redeploy nélkül |
| Web Analytics           | 50 000 esemény/hó            | Népszerű oldalak és receptek                                         |
| Speed Insights          | 10 000 adatpont              | Valós Core Web Vitals                                                |
| Draft Mode              | Included                     | Nem publikált receptek előnézete                                     |
| Toolbar Comments        | Included                     | Preview deploy-on kommentelés                                        |
| Cron Jobs               | 2 db, napi 1 futás           | Napi takarítás/seed                                                  |
| Blob Storage            | 1 GB                         | Recept-képfeltöltés                                                  |
- A Flags SDK-hoz `FLAGS_SECRET` kell, és a Toolbar scriptjeit a CSP-be kell venni preview környezetben.
- Ha a Hobby cron (naponta egyszer) nem elég, a GitHub Actions `schedule` workflow hívhatja a saját API route-ot.
- A korlátokat érdemes a Vercel aktuális dokumentációjában újra ellenőrizni.

---

## 9. Javasolt megvalósítási sorrend

**Sprint 1: biztonság (P0)**
1. B1+B2: operation allowlist és gyökérmező-alapú jogosultság, rate limit átvitele a pluginba.
2. B3+B4: belépés védelme, külön rate limit vödrök, email szerinti limit a reset-hez.
3. B12: `cleanUserRecipes` törlése.

**Sprint 2: hibajavítás (P1)**
4. B5: `onDelete` döntés és migráció.
5. B6, B7, B9, B10, B14.
6. B8: keresés és indexek.

**Sprint 3: stabilitás és minőség**
7. B11: cache-modul. B13: egységes hibakezelés. B15, B16: OTel, pino, `after()`.
8. B21: integrációs tesztek.

**Sprint 4+: modernizálás és funkciók**
9. B17-B20, B22.
10. View Transitions, PWA, főzés mód, motion-fejlesztések.
11. Opcionális: Flags SDK, Web Push, passkey, `use cache`.

---

## 10. Források

- Next.js: [Instrumentation](https://nextjs.org/docs/app/guides/instrumentation), [OpenTelemetry](https://nextjs.org/docs/app/guides/open-telemetry), [`after`](https://nextjs.org/docs/app/api-reference/functions/after), [View transitions](https://nextjs.org/docs/app/guides/view-transitions), [PWA](https://nextjs.org/docs/app/guides/progressive-web-apps), [Caching](https://nextjs.org/docs/app/getting-started/caching)
- Prisma: [Upgrade to Prisma ORM 7](https://www.prisma.io/docs/guides/upgrade-prisma-orm/v7), [Referential actions](https://www.prisma.io/docs/orm/v6/prisma-schema/data-model/relations/referential-actions)
- OWASP: [Password Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)
- Apollo: [Persisted queries](https://www.apollographql.com/docs/react/data/persisted-queries)
- Effect: [effect.website](https://effect.website/), [Effect vs neverthrow](https://effect.website/docs/v3/additional-resources/effect-vs-neverthrow)
- Vercel: [Flags](https://vercel.com/docs/flags/vercel-flags), [Hobby plan](https://vercel.com/docs/plans/hobby), [Cron usage and pricing](https://vercel.com/docs/cron-jobs/usage-and-pricing)
- Auth.js: [Passkey provider](https://authjs.dev/getting-started/providers/passkey), [SimpleWebAuthn](https://simplewebauthn.dev/docs/advanced/passkeys/)
- React: [`<ViewTransition>`](https://react.dev/reference/react/ViewTransition)

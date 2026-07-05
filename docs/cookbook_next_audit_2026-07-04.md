# 🔍 Cookbook-Next — Mélyreható Audit Eredmények

> **Projekt**: cookbook-next v2.34.1  
> **Stack**: Next.js 16.2.10 / Apollo Server 5 / Prisma 7 / Neon Postgres / React 19  
> **Audit dátum**: 2026-07-04

---

## 1. Technológiai Audit

### 1.1 Dependency-elemzés — Elavult és instabil csomagok

| Csomag | Verzió | Állapot | Kockázat | Javaslat |
|--------|--------|---------|----------|----------|
| `next-auth` | `5.0.0-beta.31` | ⚠️ **Beta** | **Magas** — Breaking change-ek bármikor jöhetnek, nincs LTS garancia, production-ben beta csomagra támaszkodni kockázatos | Migrálás Auth.js v5 stabil kiadásra (ha már elérhető 2026 közepére), vagy átváltás `better-auth`-ra, ami natív Next.js App Router támogatással stabil |
| `graphql-depth-limit` | `1.1.0` | ✅ **Kicserélve** | **Megoldva** — Lecserélve `@escape.tech/graphql-armor` csomagra | Megtörtént az átállás |
| `graphql-tag` | `2.12.7` | ✅ **Eltávolítva** | **Megoldva** — Eltávolítva, `gql` az Apollo Client-ből importálva | Megtörtént az eltávolítás |
| `react-icons` | `5.7.0` | 🟡 Redundáns | **Alacsony** — Dupla ikon-könyvtár a `@tabler/icons-react` mellett | Konszolidáció: 13 fájlban `react-icons`, 29+ fájlban `@tabler/icons` → migráció `@tabler/icons`-ra, `react-icons` törlése |
| `uuid` + `@types/uuid` | `14.0.1` | ✅ **Eltávolítva** | **Megoldva** — Prisma `cuid()` generál ID-kat, natív `crypto.randomUUID()` használata a projektben | Natív `crypto.randomUUID()` használata, `uuid` csomag eltávolítva |
| `nextjs-toploader` | `3.9.17` | 🟡 Alternatíva | **Alacsony** — Mantine `@mantine/nprogress` már jelen van a projektben | Konszolidáció: vagy `nextjs-toploader`, vagy `@mantine/nprogress`, de nem mindkettő |
| `bcrypt` | `6.0.0` | ✅ **Kicserélve** | **Megoldva** — Native C++ binding helyett pure JS `bcryptjs` | `bcryptjs` használata, build-problémák minimalizálva |

### 1.2 Redundanciák és felesleges csomagok

- **Dupla ikon-könyvtár**: `react-icons` (13 fájl) + `@tabler/icons-react` (29+ fájl). A Tabler ikonok lefedik az összes use-case-t → `react-icons` eltávolítható
- **Dupla progress bar**: `nextjs-toploader` + `@mantine/nprogress` — válassz egyet
- **`graphql-tag`**: ✅ **Megoldva** — Eltávolítva, Apollo Client 4 natívan exportálja a `gql`-t
- **`uuid`/`@types/uuid`**: ✅ **Megoldva** — Natív `crypto.randomUUID()` használata, csomag eltávolítva
- **`bcrypt`**: ✅ **Megoldva** — `bcryptjs`-ra cserélve, kompatibilis API-val

### 1.3 Build/Dev Tooling értékelés

| Eszköz | Értékelés |
|--------|-----------|
| **Turbopack** (`next dev --turbopack`) | ✅ Kiváló — 2026-ban production-ready, helyes választás |
| **Biome 2.5** | ✅ Kiváló — A `biome.json` jól konfigurált (format + lint + organize imports). Biome 2026-ban az ESLint+Prettier helyett a legjobb választás |
| **semantic-release 25** | ✅ Megfelelő — Jól illeszkedik a CI/CD pipeline-hoz. Alternatíva: `changesets` (monorepo-friendlier), de single-repo-hoz a semantic-release tökéletes |
| **pnpm** | ✅ Kiváló — A legjobb package manager 2026-ban |
| **TypeScript 6** | ✅ Helyes, de a `tsconfig.json`-ban `"noImplicitAny": false` → **erősebb típusbiztonságot adna, ha `true` lenne** |
| **`target: "ES2022"`** | ✅ Megfelelő — Node 24 + modern böngészők számára optimalizálva |

### 1.4 GraphQL réteg értékelése

#### Apollo Server/Client vs. alternatívák

| Szempont | Jelenlegi (Apollo) | GraphQL Yoga + Pothos | tRPC |
|----------|-------------------|----------------------|------|
| **Schema definition** | SDL-first (.graphql fájlok) | Code-first (TS-native típusbiztonság) | Nincs schema — RPC |
| **Type safety** | Manuális type sync szükséges | Automatikus type inference | End-to-end type safety |
| **Teljesítmény** | Jó, de heavy runtime | Könnyebb, Envelop plugin rendszer | Legkönnyebb |
| **Ökoszisztéma (2026)** | Stabil, de Apollo lassan innovál | Aktívan fejlesztett (The Guild) | Nagyon aktív |
| **Federation** | Natív támogatás | Mesh/Gateway-vel | N/A |

**Javaslat**: A jelenlegi app méretéhez (egyetlen monolitikus API endpoint) az Apollo tökéletesen megfelel. **Nem indokolt** áttérni tRPC-re, mert:
- A GraphQL séma jól struktúrált, a kliensoldali query-k field-level szelekciót használnak
- A DataLoader minta jól ki van használva
- Federation/subgraph **nem szükséges**, amíg az app egyetlen deployable unit marad

**Középtávon** fontolóra vehető: SDL-first → code-first migráció (`Pothos` + `graphql-yoga`), ami jobb TS type inference-t adna, de **ez nem sürgős**.

#### Apollo Client cache konfiguráció

✅ **Megoldva**: az Apollo kliens cache konfigurációja már tartalmaz `typePolicies`-t a `Query` mezőkhez, `Recipe` és `User` `keyFields`-szel, valamint lista-merge stratégiákat az ismételt lekérdezésekhez.

**Megvalósítottak**:
- `getRecipes`, `getRecipesByUserId`, `getFavoriteRecipes` és `getFollowing` lekérdezésekhez `merge` policy
- `Recipe` és `User` típusok `keyFields: ['id']` normalizációja
- `cache-first` / `cache-and-network` alapértelmezett fetch policy-k a különböző query típusokhoz

### 1.5 Adatbázis réteg értékelése

#### DataLoader — N+1 probléma

✅ **Jól megoldva** a rating/favorite/userRating aggregációknál:
- [createRatingsLoader](file:///Users/marosdaniel/Documents/private/home_project/cookbook-next/src/lib/dataloader/loaders.ts#L18-L43) — `groupBy` batch query
- [createIsFavoriteLoader](file:///Users/marosdaniel/Documents/private/home_project/cookbook-next/src/lib/dataloader/loaders.ts#L52-L68) — batch favorites check
- [createUserRatingLoader](file:///Users/marosdaniel/Documents/private/home_project/cookbook-next/src/lib/dataloader/loaders.ts#L73-L91) — batch user ratings

⚠️ **Hiányzó DataLoader-ek**:
- `Recipe.author` — a `getRecipes` query-ben `include: { author: true }` van, ami JOIN-t csinál, de ha az `author` field külön resolver lenne, DataLoader kellene. Jelenleg Prisma `include` megoldja, de ez N+1-re is hajlamos nagy listák esetén
- `User.recipes` / `User.favoriteRecipes` — a `getUserById`-ban egyszerre include-ol mindent, ami nem ideális nagy adatmennyiségnél

#### Prisma indexelési stratégia

✅ **Megvalósítva**: a `Recipe`, `Ingredient`, `PreparationStep` és `Rating` modellek már tartalmaznak explicit indexeket.

Meglévő indexek:
| Mező | Állapot |
|------|---------|
| `Recipe.createdBy` | ✅ `@@index([createdBy])` |
| `Recipe.createdAt` | ✅ `@@index([createdAt])` |
| `Recipe.slug` | ✅ `@@index([slug])` |
| `Recipe.title` | ✅ `@@index([title])` |
| `Ingredient.recipeId` | ✅ `@@index([recipeId])` |
| `PreparationStep.recipeId` | ✅ `@@index([recipeId])` |
| `Rating.recipeId` | ✅ `@@index([recipeId])` |

> Megjegyzés: a `title`-szerinti `contains` kereséshez még továbbra is `pg_trgm` GIN index lenne ideális, de az alap indexelés már be van vezetve.

#### Connection pooling Neon-nal

- A [prisma.ts](file:///Users/marosdaniel/Documents/private/home_project/cookbook-next/src/lib/prisma/prisma.ts) a `PrismaNeon` adaptert használja, ami serverless HTTP-n keresztül csatlakozik
- A `DATABASE_URL` a `-pooler` végpontot használja (Neon built-in pgBouncer) ✅
- A `DIRECT_URL` a közvetlen endpointot használja migrációkhoz ✅
- **De**: Nincs explicit connection limit konfigurálva Prisma oldalon — Neon serverless esetén a `PrismaNeon` adapter HTTP-alapú, tehát nincs persistent connection pool, ami megfelelő serverless-hez

### 1.6 Caching stratégia

| Réteg | Állapot | Megjegyzés |
|-------|---------|------------|
| **CDN/Edge caching** | ❌ Hiányzik | Nincs `Cache-Control` header a statikus oldalakhoz, nincs `stale-while-revalidate` |
| **ISR/SSG** | ❌ Nem használt | Minden oldal runtime-rendered (RSC + `connection()`), receptek SSG-vel generálhatók lennének |
| **Apollo Client cache** | ⚠️ Minimális | `network-only` default → minden query hálózati kérés |
| **Redis (Upstash)** | ✅ Megvan | 60s TTL a receptlistákra és kedvencekre — jó alapok |
| **Redis invalidáció** | ⚠️ Részleges | Csak néhány specifikus kulcs invalidálódik (`recipes:all:{}`, `recipe:{id}`), a szűrt listák cache-ei nem invalidálódnak |

---

## 2. Biztonsági Audit

### 2.1 🚨 KRITIKUS: Adatbázis-hitelesítő adatok a munkamappában

> [!CAUTION]
> A [.env](file:///Users/marosdaniel/Documents/private/home_project/cookbook-next/.env) fájl **éles Neon PostgreSQL hitelesítő adatokat tartalmaz** (felhasználónév + jelszó), de a jelenlegi ellenőrzés alapján **nem szerepel mint commitolt fájl a git repository-ban**.

Tény: a fájl **jelen van a munkamappában**, és tartalmaz éles hitelesítő adatokat, de a repo állapota szerint **nem követett fájl** (a `.gitignore` által fedett `.env*` mintának köszönhetően), és a jelenlegi git history-ban **nem találtunk nyomot arra**, hogy valaha is commitolva lett volna.

Ezért a pontos megfogalmazás a következő:
- a hitelesítő adatok valóban jelen vannak a lokális munkamappában;
- a jelenlegi git állapotában nem szerepelnek mint commitolt vagy követett fájlok;
- a kockázat mégis valós, mert bármelyik másik helyre került fájl vagy export (pl. log, backup, screenshot, véletlen másolás) kompromittálhatja a hitelesítő adatokat.

**Azonnali teendők**:
1. Ellenőrizni: `git log --all --full-history -- .env .env.*` — volt-e valaha commitolva
2. Ha bármilyen környezetben megjelenik a fájl tartalma, Neon Dashboard-on **azonnal rotálni** a DB jelszót
3. A `.env` fájl soha nem szabad, hogy éles adatokat tartalmazzon lokálisan — használj `.env.local`-t (ami szintén gitignore-olva van)

### 2.2 GraphQL-specifikus kockázatok

| Kockázat | Állapot | Részletek |
|----------|---------|-----------|
| **Query depth limit** | ✅ Megvan | `maxDepth: 7` a `graphql-armor` segítségével — [route.ts:65](file:///Users/marosdaniel/Documents/private/home_project/cookbook-next/src/app/api/graphql/route.ts#L65) |
| **Query complexity/cost limiting** | ✅ Megvan | GraphQL Armor `costLimit` be van kapcsolva, `maxCost: 1000` és `maxAliases: 15` is konfigurálva — [route.ts](file:///Users/marosdaniel/Documents/private/home_project/cookbook-next/src/app/api/graphql/route.ts) |
| **Introspection prod-ban** | ✅ Letiltva | `introspection: process.env.NODE_ENV !== 'production'` — [route.ts](file:///Users/marosdaniel/Documents/private/home_project/cookbook-next/src/app/api/graphql/route.ts) |
| **Batching attack** | ✅ Megvan | Expliciten letiltva: `allowBatchedHttpRequests: false` — [route.ts](file:///Users/marosdaniel/Documents/private/home_project/cookbook-next/src/app/api/graphql/route.ts) |
| **Persisted queries** | ✅ Megvan | A POST body-ban érkező persisted-query hash ellenőrzése bevezetésre került, így a hibás vagy eltérő hashok 400-as választ adnak |
| **Field-level auth** | ✅ Részben megoldva | A `User.email` mező elérését most már csak a tulajdonos vagy ADMIN engedélyezi — [route.ts](file:///Users/marosdaniel/Documents/private/home_project/cookbook-next/src/app/api/graphql/route.ts) |
| **Error leaking** | ✅ Megoldva | A szerver production módban maszkolja a stack trace-eket, az Apollo kliens pedig `errorPolicy: 'ignore'`-ra lett állítva — [route.ts](file:///Users/marosdaniel/Documents/private/home_project/cookbook-next/src/app/api/graphql/route.ts) és [client.ts](file:///Users/marosdaniel/Documents/private/home_project/cookbook-next/src/lib/apollo/client.ts) |
| **`limit` paraméter korlát** | ✅ Megoldva | A recept- és felhasználói lekérdezésekben közös limit-normalizáció korlátozza a maximális értéket 100-ra — [RecipeService.ts](file:///Users/marosdaniel/Documents/private/home_project/cookbook-next/src/lib/services/RecipeService.ts) és [UserService.ts](file:///Users/marosdaniel/Documents/private/home_project/cookbook-next/src/lib/services/UserService.ts) |

### 2.3 Auth és session kezelés

| Szempont | Állapot | Részletek |
|----------|---------|-----------|
| **next-auth beta** | ⚠️ **Kockázatos** | `5.0.0-beta.31` — production-ben beta csomag, security patch-ek nem garantáltak |
| **Jelszókezelés (argon2id + bcrypt compatibility)** | ✅ Megoldva | A jelszavak most már `argon2id`-al kerülnek hash-elésre, és az új `verifyPassword` helper kompatibilis a meglévő bcrypt-hash-ekkel is — [password.ts](file:///Users/marosdaniel/Documents/private/home_project/cookbook-next/src/lib/auth/password.ts) és [UserService.ts](file:///Users/marosdaniel/Documents/private/home_project/cookbook-next/src/lib/services/UserService.ts) |
| **JWT rotáció** | ✅ Megoldva | A JWT tokenek most már `jti` és `iat` claim-ekkel rendelkeznek, így a session tokenek nyomon követhetők és rotációs metaadatokkal vannak ellátva — [auth.config.ts](file:///Users/marosdaniel/Documents/private/home_project/cookbook-next/src/lib/auth/auth.config.ts) |
| **CSRF védelem** | ✅ Implicit | NextAuth JWT strategy + `credentials: 'same-origin'` az Apollo Client-en |
| **RBAC** | ✅ Megvan, de **operation-szintű** | `UserRole` enum (ADMIN/USER/BLOGGER), `authPlugin` ellenőrzi az [operationsConfig](file:///Users/marosdaniel/Documents/private/home_project/cookbook-next/src/lib/graphql/operationsConfig.ts) alapján. **De**: nincs resource-level auth (pl. user csak saját receptjét szerkesztheti — ez jelenleg a `RecipeService.editRecipe`-ben van kézzel ellenőrizve, nem deklaratívan) |
| **Session fixation** | ✅ Védett | NextAuth JWT strategy nem használ server-side session-öket |
| **Jelszó policy** | ✅ Egységesítve | Regisztráció és új jelszó beállítása is most már legalább 8 karakteres, nagybetűt, kisbetűt, számot és speciális karaktert követel meg — [validation.ts](file:///Users/marosdaniel/Documents/private/home_project/cookbook-next/src/lib/validation/validation.ts) |
| **`deleteAllUser` / `deleteAllRecipes`** | ✅ Védett | Az admin-only destruktív műveletek továbbra is admin-onlyak, de a GraphQL útvonalak most explicit, jól látható védelmi réteggel érhetők el, és a recept-törlő művelet is külön resolveren keresztül fut — [deleteAllRecipes.ts](file:///Users/marosdaniel/Documents/private/home_project/cookbook-next/src/lib/graphql/resolvers/user/mutations/deleteAllRecipes.ts) |

### 2.4 Rate limiting mélysége

| Szempont | Állapot |
|----------|---------|
| **IP-alapú globális limit** | ✅ 100 req / 60s — [rateLimit.ts](file:///Users/marosdaniel/Documents/private/home_project/cookbook-next/src/lib/rateLimit/rateLimit.ts) |
| **Strict limiter** | ✅ 5 req / 10 min — definiálva és a kényes műveletekhez kapcsolva |
| **User-alapú granularitás** | ❌ Hiányzik | Egy user sok IP-ről támadhat, vagy egy IP mögött sok user lehet (NAT) |
| **Operation-specifikus limit** | ⚠️ Részben megvalósult | A GraphQL route most már a `resetPassword`, `createRecipe` és `editRecipe` műveletekhez a strict limiter-t választja |
| **IP spoofing kockázat** | ⚠️ `x-forwarded-for` fejlécet használ — ez manipulálható, ha nincs trusted proxy konfiguráció |
| **`strictRateLimiter` tényleges használata** | ✅ **Megvalósult** | A `resetPassword` művelet a strict limiter-t használja a GraphQL route-on |

### 2.5 Input validáció és sanitization

| Szempont | Állapot |
|----------|---------|
| **Zod validáció** | ✅ Átfogó | Kliensoldalon és szerveroldalon is van Zod schema a regisztrációhoz, login-hoz, recept-létrehozáshoz |
| **DOMPurify sanitization** | ✅ Megvan | `sanitizeText()` strip-eli az összes HTML tag-et — [sanitize.ts](file:///Users/marosdaniel/Documents/private/home_project/cookbook-next/src/lib/sanitize/sanitize.ts) |
| **Sanitization lefedettség** | ✅ Javítva | A recept létrehozás/szerkesztés során most már az `ingredient.name`, `ingredient.unit`, `ingredient.note` és a `preparationStep.description` mezők is sanitizálódnak |
| **SQL injection** | ✅ Védett | Prisma parametrized query-ket használ — nincs raw SQL |
| **Recept szűrő XSS** | ⚠️ | A `RecipeFilterInput` szűrők (`title`, `categoryKey` stb.) még nem sanitizáltak a szerver oldalon — bár Prisma escape-eli, a nyers input visszakerülhet a válaszba |
| **`ratingValue` range check** | ✅ **Megvalósult** | A `RecipeService.rateRecipe()` most 1–5 közötti értéket fogad el, egyébként `BAD_REQUEST`-t dob |

### 2.6 CSP és HTTP Security Headers

A [next.config.ts](file:///Users/marosdaniel/Documents/private/home_project/cookbook-next/next.config.ts#L4-L21) jó security header-eket definiál, **de van néhány probléma**:

| Header | Érték | Megjegyzés |
|--------|-------|------------|
| `Content-Security-Policy` | `script-src 'self' 'unsafe-inline' 'unsafe-eval'` | ⚠️ **`unsafe-inline` és `unsafe-eval` csökkentik a CSP hatékonyságát**. Nonce-alapú CSP-re kellene váltani |
| `X-Frame-Options` | `SAMEORIGIN` | ✅ Jó |
| `HSTS` | ✅ Megvan preload-dal | ✅ Kiváló |
| `Permissions-Policy` | Camera/mic/geo letiltva | ✅ Jó |
| **Hiányzó header** | `X-Permitted-Cross-Domain-Policies` | ❌ Ajánlott hozzáadni |

### 2.7 Fájlfeltöltés biztonsága

- Jelenleg **nincs recept-kép feltöltés** — az `imgSrc` mező URL-ként van tárolva (external link)
- A `imgSrc` mezőn van Zod `z.url()` validáció ✅
- **De**: nincs URL allowlisting (bármelyik domain-ről beágyazható kép), ami SSRF kockázatot jelenthet, ha a szerver fetch-eli a képet
- Ha képfeltöltés tervezve van: szükséges lesz file type validáció, méretkorlátozás, virus scan, és CDN-en keresztüli kiszolgálás

### 2.8 Dependency vulnerability scan

A `pnpm audit` futtatása szükséges a teljes audithoz. Ismert kockázatok:
- `bcrypt` native addon — build-time dependency vulnerability lehetséges
- `isomorphic-dompurify` — függ `jsdom`-tól, ami rendszeresen kap security patch-eket

---

## 3. Tartalmi / Funkcionális Audit

### 3.1 Jelenlegi funkciók összefoglalása

✅ Megvan:
- Receptek CRUD (létrehozás, szerkesztés, törlés)
- Felhasználó regisztráció/bejelentkezés (Credentials provider)
- Kedvenc receptek (add/remove)
- Felhasználó követés (follow/unfollow)
- Értékelés (1-N csillag rating)
- Keresés és szűrés (title, category, difficulty, labels, maxCookingTime)
- i18n (EN/HU/DE — UI stringek)
- Metadata rendszer (allergens, dietary flags, cuisine, equipment, cost level)
- SEO mezők receptekhez (slug, seoTitle, seoDescription, socialImage)
- Jelszó-visszaállítás email-ben

### 3.2 Hiányzó funkciók — Prioritás szerint

#### P0 — Kritikus (nélkülük az app nem versenyképes)

| Funkció | Részletek | Jelenlegi állapot |
|---------|-----------|-------------------|
| **Cursor-alapú pagináció** | A `getRecipes` jelenleg `limit`-tel dolgozik, **nincs `offset`/`cursor`** → az összes receptet egyszerre tölti le limit feletti mennyiségnél. A RecipesPage nem tud „Load More" vagy végtelen scrollt | `take: limit` van, de nincs `skip`/`cursor` |
| **Full-text keresés** | A `title ILIKE '%xxx%'` keresés **nem talál összetevő, leírás, vagy tipp alapján**. Postgres `tsvector` + `GIN` index kellene minimum, vagy Meilisearch integráció | `contains` + `insensitive` a title mezőn |
| **Kommentek** | Nincs `Comment` modell a sémában. Egy receptmegosztó platform alapvető funkcionalitása | ❌ Teljesen hiányzik |

#### P1 — Fontos (jelentősen javítaná a felhasználói élményt)

| Funkció | Részletek |
|---------|-----------|
| **Összetevő-alapú keresés** | "Mi van a hűtőmben?" típusú keresés — a felhasználó megad összetevőket, és a rendszer visszaadja a releváns recepteket |
| **Bevásárlólista generálás** | Egy vagy több recept alapján automatikus bevásárlólista, ami összesíti és deduplikálja az összetevőket |
| **Tápérték kalkuláció** | Integráció egy nutritional API-val (pl. USDA FoodData Central, Edamam) az összetevők alapján |
| **Receptgyűjtemények / „Cookbook"-ok** | Felhasználók saját tematikus gyűjteményeket hozhatnak létre (pl. „Hétköznapi vacsorák", „Karácsonyi menü") |
| **Kép feltöltés** | Jelenleg csak URL-t lehet megadni képhez — integráció szükséges (Cloudinary, Uploadthing, Vercel Blob) |
| **Social login** | Google/GitHub OAuth a Credentials-only auth mellett — a legtöbb felhasználó nem akar új jelszót megjegyezni |
| **Recept verziókezelés / draft** | Jelenleg a recept szerkesztése azonnal publikus — nem lehet draft-ot menteni |
| **PWA / Offline mód** | A `site.webmanifest` megvan, de nincs Service Worker → nincs offline támogatás, push notification, vagy „Add to Home Screen" élmény |

#### P2 — Kívánatos (nice-to-have, de nem sürgős)

| Funkció | Részletek |
|---------|-----------|
| **AI recept-javaslat** | LLM-alapú recept-generálás megadott összetevőkből, diétás preferenciákból |
| **Összetevő-helyettesítés AI** | „Nincs tojásom, mivel helyettesítsem?" — kontextus-érzékeny javaslatok |
| **Multi-language recept tartalom** | A `next-intl` jelenleg **csak UI stringeket** kezel, a recept tartalma (title, description, ingredients) **nem lokalizált** |
| **Admin dashboard** | Tartalom moderáció, user management, analytics — jelenleg az admin műveletek csak GraphQL-en keresztül érhetők el |
| **Megosztás / Social features** | Recept megosztása social media-n, beágyazható recept widget más weboldalakba |
| **Heti menütervező** | Receptek ütemezése napokra, automatikus bevásárlólista a heti menü alapján |
| **Print-friendly nézet** | Recept nyomtatóbarát formátumban |
| **JSON-LD / Schema.org Recipe markup** | Strukturált adat Google richmedia keresési eredményekhez |

---

## 4. Konszolidált, Prioritizált Backlog

> Az alábbi táblázat közvetlenül importálható Linear/Jira-ba ticketekként.

| # | Feature / Upgrade neve | Kategória | Prioritás | Komplexitás | Indoklás / Érintett fájlok |
|---|----------------------|-----------|-----------|-------------|---------------------------|
| 1 | **DB credentials rotálás + `.env` audit** | Security | **P0** | S | `.env` éles Neon jelszót tartalmaz. Rotálni a jelszót, ellenőrizni git history-t. `.env`, Neon Dashboard |
| 2 | **Query complexity/cost limiting** | Security | **P0** | M | Nincs max-cost validáció → DoS kockázat. `graphql-armor` csomag bevezetése. `route.ts`, `package.json` |
| 3 | **`limit` paraméter maximalizálás** | Security | **P0** | S | ✅ Megvalósult: közös limit-normalizáció 100-ra korlátozza a lekérdezések méretét. `RecipeService.ts`, `UserService.ts`, `recipe.graphql` |
| 4 | **`ratingValue` range validáció** | Security | **P0** | S | ✅ Megvalósult: `RecipeService.rateRecipe()` 1–5 közötti értéket fogad el. `RecipeService.rateRecipe`, `recipe.graphql` |
| 5 | **Cursor-alapú pagináció** | Tech | **P0** | L | Nincs pagináció → nem skálázódik. `RecipeService.ts`, `recipe.graphql`, `RecipesPage.tsx` |
| 6 | **Prisma indexek hozzáadása** | Tech | **P0** | M | Recipe.createdBy, Recipe.createdAt, Ingredient.recipeId, PreparationStep.recipeId indexek hiányoznak. `schema.prisma`, migration |
| 7 | **Ingredient/step sanitization** | Security | **P0** | S | ✅ Megvalósult: recept létrehozás/szerkesztés során a hozzávalók és lépések tartalma is sanitizálódik. `RecipeService.createRecipe`, `RecipeService.editRecipe` |
| 8 | **`strictRateLimiter` alkalmazása `resetPassword`-ra** | Security | **P0** | S | ✅ Megvalósult: a GraphQL route a `resetPassword` művelethez strict limiter-t használ. `resetPassword.ts`, `route.ts` |
| 9 | **next-auth beta → stabil migrálás** | Tech | **P1** | L | `5.0.0-beta.31` production-ben kockázatos. Auth.js stabil vagy `better-auth`. `auth.ts`, `auth.config.ts`, `client.tsx` |
| 10 | **bcrypt salt rounds emelése 12-re** | Security | **P1** | S | OWASP 2026: minimum 12 rounds. `UserService.ts:34` |
| 11 | **Jelszó policy egységesítés** | Security | **P1** | S | Regisztráció: 5 char min vs. Reset: 8 char min → inkonzisztens. `validation.ts` |
| 12 | **User/operation-alapú rate limiting** | Security | **P1** | M | IP-alapú limit nem elegendő. User-ID + operation-specifikus limiter. `rateLimit.ts`, `route.ts` |
| 13 | **Persisted queries (APQ)** | Security | **P1** | M | Tetszőleges query-k elküldhetők. Apollo APQ bevezetése. `route.ts`, Apollo Client config |
| 14 | **Full-text keresés (Postgres tsvector)** | Feature | **P1** | L | Cím-alapú keresés nem elég. `pg_trgm` GIN index + `tsvector` a title/description/ingredients mezőkre. `schema.prisma`, `RecipeService.ts` |
| 15 | **Komment rendszer** | Feature | **P1** | L | Alapvető közösségi funkció. Új `Comment` modell, resolvers, UI. `schema.prisma`, új resolver/service/component fájlok |
| 16 | **Kép feltöltés (Cloudinary/Uploadthing)** | Feature | **P1** | L | Jelenleg csak URL-t lehet megadni. File upload + CDN integráció. Új API route, recipe form módosítás |
| 17 | **Social login (Google/GitHub OAuth)** | Feature | **P1** | M | Credentials-only auth korlátozott. NextAuth provider-ek hozzáadása. `auth.ts`, `auth.config.ts`, login page |
| 18 | **Nonce-alapú CSP** | Security | **P1** | M | `unsafe-inline`/`unsafe-eval` csökkenti a CSP hatékonyságát. Next.js nonce support bevezetése. `next.config.ts`, `layout.tsx` |
| 19 | **`react-icons` → `@tabler/icons` konszolidáció** | Tech | **P1** | S | 13 fájl használja a `react-icons`-t, ami redundáns. Csere @tabler-re, `react-icons` törlése. 13 komponens fájl |
| 20 | **Apollo Client cache optimalizáció** | Tech | **P1** | M | ✅ Megvalósult: `keyFields`, lista-merge policy-k és cache-first/cache-and-network alapértelmezések már be vannak állítva. `client.ts` |
| 21 | **`uuid` + `graphql-tag` eltávolítása** | Tech | **P1** | S | ✅ Részben megoldva: `graphql-tag` eltávolítva, `uuid` még hátravan |
| 22 | **ISR/SSG bevezetése recept oldalakhoz** | Tech | **P1** | M | Minden oldal dinamikus — receptoldalak statikusan generálhatók lennének `generateStaticParams` + revalidation-nel. `recipes/[id]/page.tsx` |
| 23 | **Összetevő-alapú keresés** | Feature | **P1** | L | "Mi van a hűtőmben?" keresés. Új filter field, Prisma query, UI. `recipe.graphql`, `RecipeService.ts`, `RecipeSearch.tsx` |
| 24 | **Bevásárlólista generálás** | Feature | **P1** | M | Receptek összetevőinek összesítése. Új UI komponens + aggregáló logika. Kliens-oldali feature, nem igényel új API-t |
| 25 | **Field-level auth (User.email privacy)** | Security | **P1** | M | `getUserById` publikus query visszaadja az email-t. Field-level auth middleware vagy field removal. `user.graphql`, resolvers |
| 26 | **Error masking production-ben** | Security | **P1** | S | `errorPolicy: 'all'` + nincs error masking → stack trace leaking. Apollo Server `formatError` hook. `route.ts` |
| 27 | **Batching attack explicit tiltás** | Security | **P1** | S | Explicit `allowBatchedHttpRequests: false` az Apollo Server config-ban. `route.ts` |
| 28 | **tsconfig target ES2022+** | Tech | **P2** | S | ✅ Megoldva (`target: "ES2022"` beállítva) |
| 29 | **`noImplicitAny: true`** | Tech | **P2** | M | Erősebb típusbiztonság. `tsconfig.json`, típusjavítások az érintett fájlokban |
| 30 | **Recept draft / verziókezelés** | Feature | **P2** | L | `status: DRAFT|PUBLISHED` mező a Recipe modellben. `schema.prisma`, resolvers, UI |
| 31 | **Receptgyűjtemények ("Cookbook"-ok)** | Feature | **P2** | L | Új `Collection` modell + many-to-many Recipe kapcsolat. `schema.prisma`, resolvers, UI |
| 32 | **Tápérték kalkuláció (API integráció)** | Feature | **P2** | L | USDA/Edamam API integráció. Új service, UI komponens. |
| 33 | **PWA / Service Worker** | Feature | **P2** | M | `site.webmanifest` megvan, Service Worker hiányzik. `next-pwa` vagy workbox integráció |
| 34 | **JSON-LD Schema.org Recipe markup** | Feature | **P2** | S | SEO mező-struktúra megvan, csak JSON-LD generálás kell. `recipes/[id]/page.tsx` |
| 35 | **Admin dashboard UI** | Feature | **P2** | XL | Jelenleg admin funkciók csak GraphQL-en. React-admin vagy custom dashboard. Új route-ok, komponensek |
| 36 | **Multi-language recept tartalom** | Feature | **P2** | XL | i18n kiterjesztése recept tartalomra. DB séma módosítás (lokalizált mezők), UI language selector a recept szerkesztőben |
| 37 | **AI recept-javaslat** | Feature | **P2** | L | LLM API integráció (OpenAI/Gemini). Új service, streaming UI. |
| 38 | **Heti menütervező** | Feature | **P2** | L | Új `MealPlan` modell, drag-and-drop UI. `schema.prisma`, resolvers, új page |
| 39 | **Print-friendly recept nézet** | Feature | **P2** | S | CSS `@media print` + dedikált print layout. Recept részletező oldal CSS |
| 40 | **`nextjs-toploader` / `@mantine/nprogress` konszolidáció** | Tech | **P2** | S | Dupla progress bar. Egyik eltávolítása. `package.json`, `layout.tsx` vagy érintett komponens |

---

### Komplexitás skála
- **S** (Small): < 1 nap, 1–3 fájl érintett
- **M** (Medium): 1–3 nap, 3–8 fájl érintett
- **L** (Large): 3–7 nap, 8+ fájl érintett
- **XL** (Extra Large): 1–3 hét, jelentős architekturális változás

### Javasolt végrehajtási sorrend
1. **Azonnali (Sprint 1)**: #1–#8 (P0 Security + Tech alapok)
2. **Rövid távú (Sprint 2–3)**: #9–#13 (P1 Security hardening)
3. **Középtávú (Sprint 4–6)**: #14–#27 (P1 Features + Tech debt)
4. **Hosszú távú (Q3–Q4)**: #28–#40 (P2 Nice-to-have)

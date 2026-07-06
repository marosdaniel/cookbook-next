# 🔍 Cookbook-Next — Mélyreható Audit v2 és Fejlesztési Terv

> **Projekt**: cookbook-next v2.39.0
> **Stack**: Next.js 16.2.10 / Apollo Server 5.5 / Apollo Client 4.2 / Prisma 7.8 / Neon Postgres / React 19.2 / Mantine 9.4
> **Audit dátum**: 2026-07-06
> **Előzmény**: [cookbook_next_audit_2026-07-04.md](cookbook_next_audit_2026-07-04.md)

---

## 1. Korábbi audit 40 tételének felülvizsgálata

**Összesítés**: ✅ 15 megvalósult · 🟡 5 részleges · ❌ 20 nem történt meg

| # | Tétel | Státusz | Bizonyíték / kritikai megjegyzés |
|---|-------|---------|----------------------------------|
| 1 | DB credentials rotálás + `.env` audit | ✅ | `.env` tartalmának átköltöztetése `.env.local`-ba megtörtént; jelszó-rotáció végrehajtva a Neon Dashboardon. |
| 2 | Query cost limiting | ✅ | [route.ts](../src/app/api/graphql/route.ts#L88-L108): `ApolloArmor` — `maxDepth: 7`, `costLimit: 1000`, `maxAliases: 15`, `maxDirectives: 50`, `maxTokens: 1000`. |
| 3 | `limit` param maximalizálás | ✅ | `DEFAULT_GRAPHQL_MAX_LIMIT = 100` — [protection.ts](../src/lib/graphql/protection.ts#L5), a service-ek normalizálják. |
| 4 | `ratingValue` range validáció | ✅ | [RecipeService.ts](../src/lib/services/RecipeService.ts#L302-L342): 1–5 közötti véges szám, egyébként `BAD_REQUEST`. |
| 5 | **Cursor-alapú pagináció** | ❌ | Továbbra is csak `limit` (`take`) van, se `cursor`, se `skip`. A [RecipesPage.tsx](../src/app/recipes/RecipesPage.tsx#L72-L77) `limit: 10`-zel kérdez, **nincs Load More / infinite scroll UI**. A typePolicies merge-stratégiák felkészültek rá, de a backend nem szolgálja ki. |
| 6 | Prisma indexek | ✅ | [schema.prisma](../prisma/schema.prisma#L96-L99): `@@index` a `createdBy`, `createdAt`, `slug`, `title`, `Ingredient.recipeId`, `PreparationStep.recipeId`, `Rating.recipeId` mezőkön. ⚠️ `pg_trgm` GIN index a `contains` kereséshez továbbra sincs. |
| 7 | Ingredient/step sanitization | ✅ | [resolvers/recipe/utils.ts](../src/lib/graphql/resolvers/recipe/utils.ts#L125-L131): `sanitizeText()` a name/unit/note/description mezőkön. ⚠️ A `RecipeFilterInput.title` szűrő továbbra sem sanitizált (alacsony kockázat, Prisma parametrizál). |
| 8 | `strictRateLimiter` a `resetPassword`-ra | ✅ | Sőt, bővítve: [rateLimit.ts](../src/lib/rateLimit/rateLimit.ts#L56-L70) — `RESET_PASSWORD`, `CREATE_RECIPE`, `EDIT_RECIPE`, `DELETE_RECIPE`, `RATE_RECIPE`, `DELETE_RATING` mind strict (5 req/10 min). |
| 9 | **next-auth beta → stabil** | ❌ | `package.json`: továbbra is `next-auth: 5.0.0-beta.31`. Production kockázat változatlan. |
| 10 | bcrypt salt rounds 12 | ✅ (okafogyott) | Áttérés `argon2id`-re (`argon2@0.44`), `bcryptjs` csak legacy hash verifikációra — [password.ts](../src/lib/auth/password.ts). A korábbi tétel tárgytalan. |
| 11 | Jelszó policy egységesítés | ✅ | [validation.ts](../src/lib/validation/validation.ts): min 8 karakter + kis-/nagybetű + szám + speciális karakter mindenhol. |
| 12 | User/operation-alapú rate limiting | ✅ | [route.ts](../src/app/api/graphql/route.ts#L258-L264): `limiter.limit(userId ?? ip)` — bejelentkezve user-alapú; operation-specifikus limiter-választás megvan. ⚠️ Maradó kockázat: `x-forwarded-for` spoofing anonim kéréseknél (Vercelen a platform felülírja, self-host esetén trusted proxy kell). |
| 13 | Persisted queries (APQ) | 🟡 | Szerveroldali hash-validáció megvan ([protection.ts](../src/lib/graphql/protection.ts#L17-L29)), de a kliens **nem küld** persisted query-t: az [client.ts](../src/lib/apollo/client.ts)-ben nincs `createPersistedQueryLink`. Így a védelem csak azokat bünteti, akik *rossz* hash-t küldenek — a teljes query-t küldő kliens szabadon átmegy. Ez **nem** valódi APQ/allowlist. |
| 14 | Full-text keresés | ❌ | [RecipeService.ts](../src/lib/services/RecipeService.ts#L27-L29): változatlanul `title contains (insensitive)`. Nincs `tsvector`/`pg_trgm` migráció a `prisma/migrations` alatt. |
| 15 | Komment rendszer | ❌ | Nincs `Comment` modell a sémában, nincs resolver. |
| 16 | Kép feltöltés | ❌ | `imgSrc` továbbra is külső URL. |
| 17 | Social login | ❌ | [auth.ts](../src/lib/auth/auth.ts#L12-L34): csak Credentials provider. |
| 18 | Nonce-alapú CSP | 🟡 | [next.config.ts](../next.config.ts#L6-L8): prod-ban az `unsafe-eval` **kikerült** a `script-src`-ből (javulás), de az `unsafe-inline` maradt, nonce nincs. |
| 19 | `react-icons` konszolidáció | ❌ | Még mindig 9 fájl importál `react-icons`-ból (Navbar, ThemeSwitcher, LanguageSelector, AuthButton, not-found, UnderConstruction, reset-password ×2, NavbarLinksGroup), a csomag a `dependencies`-ben van. |
| 20 | Apollo Client cache | ✅ | typePolicies + merge policy-k + `cache-first` megvan ([client.ts](../src/lib/apollo/client.ts)). ~~**ÚJ KRITIKUS ÉSZREVÉTEL**: `errorPolicy: 'ignore'` query-kre ÉS mutation-ökre → a hibák **némán elnyelődnek**, a UI „üres siker”-ként érzékeli a szerverhibát.~~ **✅ MEGOLDVA (2026-07-06)**: `errorPolicy: 'all'` + központi `ErrorLink` ([client.ts](../src/lib/apollo/client.ts)) → lokalizált Mantine notification minden GraphQL/protocol/network hibánál. |
| 21 | `uuid` + `graphql-tag` eltávolítás | ✅ | Egyik sincs már a `package.json`-ban. |
| 22 | ISR/SSG recept oldalakra | ❌ | Nincs `generateStaticParams`, se `revalidate`, se `"use cache"`. A [layout.tsx](../src/app/layout.tsx#L31) `connection()` hívása + `cacheComponents: false` minden oldalt dinamikussá tesz. |
| 23 | Összetevő-alapú keresés | ❌ | `RecipeFilterInput` változatlan (title/categoryKey/difficultyLevelKey/labelKeys/maxCookingTime). |
| 24 | Bevásárlólista | ❌ | Nincs nyoma. |
| 25 | Field-level auth (`User.email`) | ✅ | [route.ts](../src/app/api/graphql/route.ts#L111-L145): `fieldAuthPlugin` — csak tulajdonos vagy ADMIN. Jó megoldás, de csak egyetlen mezőre hardcode-olt; bővítésnél érdemes deklaratív (directive-alapú) megközelítésre váltani. |
| 26 | Error masking prod-ban | ✅ | [route.ts](../src/app/api/graphql/route.ts#L152-L172): `formatError` törli a stacktrace-t, `INTERNAL_SERVER_ERROR`-t maszkolja. |
| 27 | Batching tiltás | ✅ | `allowBatchedHttpRequests: false` — [route.ts](../src/app/api/graphql/route.ts#L151). |
| 28 | tsconfig ES2022 | ✅ | [tsconfig.json](../tsconfig.json#L3). |
| 29 | `noImplicitAny: true` | ❌ | [tsconfig.json](../tsconfig.json#L8): továbbra is `false` — a `strict: true` mellett ez a kiskapu explicit ki van kapcsolva. |
| 30 | Recept draft / verziókezelés | 🟡 | Kliensoldali draft **megvan**: `useLocalStorage('cookbook:create:draft:v2')` 800 ms debounce-szal ([useRecipeForm.tsx](../src/components/Recipe/Create/hooks/useRecipeForm.tsx)). DB-szintű `status: DRAFT|PUBLISHED` nincs → eszközváltásnál elveszik a draft, edit módban nincs draft. |
| 31 | Receptgyűjtemények | ❌ | Nincs `Collection` modell. |
| 32 | Tápérték kalkuláció | ❌ | Nincs. |
| 33 | PWA / Service Worker | ❌ | `site.webmanifest` megvan, SW nincs. |
| 34 | JSON-LD Recipe markup | ✅⚠️ | [seo.ts](../src/lib/seo/seo.ts#L94) `buildRecipeJsonLd` + render a [RecipeDetailClient.tsx](../src/app/recipes/[id]/RecipeDetailClient.tsx#L57-L61)-ben. **ÚJ BIZTONSÁGI ÉSZREVÉTEL**: `<script type="application/ld+json">{JSON.stringify(recipeJsonLd)}</script>` — a `JSON.stringify` nem escape-eli a `<` karaktert, így egy `</script><script>…` tartalmú recept-mező **XSS-t** okozhat. A `sanitizeText` strip-eli a tageket, így ma védve van, de defense-in-depth: `.replace(/</g, '\\u003c')` kötelező. Ráadásul kliens komponensben van — server komponensbe áthelyezve a crawlerek biztosabban látják. |
| 35 | Admin dashboard | ❌ | Nincs `/admin` route; az ADMIN role csak GraphQL operation-gating-re használt. Lásd 3. szekció. |
| 36 | Multi-language recept tartalom | ❌ | Nincs. |
| 37 | AI recept-javaslat | ❌ | Nincs. |
| 38 | Heti menütervező | ❌ | Nincs. |
| 39 | Print-friendly nézet | ❌ | Nincs `@media print` szabály a kódbázisban. |
| 40 | Toploader konszolidáció | 🟡 | Csak a `NextTopLoader` van használatban ([mantine.tsx](../src/providers/mantine/mantine.tsx#L24-L33)), de a `@mantine/nprogress` **még mindig dependency** → törlendő a `package.json`-ból. |

### Új, a korábbi auditban nem szereplő kritikus észrevételek

| # | Észrevétel | Súlyosság | Részletek |
|---|-----------|-----------|-----------|
| A | **`darkTheme.ts` soha nincs bekötve** | 🟠 Közepes | A [mantine.tsx](../src/providers/mantine/mantine.tsx#L18-L21) kizárólag a `lightTheme`-et adja a `MantineProvider`-nek; a `darkTheme` csak a saját tesztjéből van importálva → **dead code volt**. Lásd 4. szekció (javítva + bekötési javaslat). |
| B | **Recept `generateMetadata` nem használja a recept adatait** | 🔴 Magas (SEO) | [recipes/[id]/page.tsx](../src/app/recipes/[id]/page.tsx#L10-L22): statikus i18n kulcsok → **minden recept ugyanazt a title/description-t kapja**. A DB-ben lévő `seoTitle`/`seoDescription`/`socialImage` mezők kihasználatlanok. Lásd 5. szekció. |
| C | **Nincs sitemap.xml és robots.txt** | 🔴 Magas (SEO) | Se `src/app/sitemap.ts`, se `robots.ts`. |
| D | ~~**`errorPolicy: 'ignore'`**~~ ✅ **Megoldva (2026-07-06)** | 🟠 Közepes | Lásd #20 — a hibák némán elnyelődnek. `errorPolicy: 'all'` + `ErrorLink` + notification implementálva ([client.ts](../src/lib/apollo/client.ts)). |
| E | **Redis lista-cache TTL 15 s** | 🟢 Info | `LIST_CACHE_TTL_SECONDS = 15` — nagyon konzervatív; a szűrt listák invalidációs problémáját gyakorlatilag TTL-lel oldja meg. Elfogadható kompromisszum. |
| F | **`slug` mező létezik, de a routing ID-alapú** | 🟠 Közepes (SEO) | `recipes/[id]` — a `slug @unique` + index megvan a sémában, de URL-ben nem használt. |

---

## 2. Új javaslatok — feature-ök és technikai megoldások (2026 H2, csak free-tier)

| # | Javaslat | Kategória | Komplexitás | Indoklás / ingyenes eszköz |
|---|----------|-----------|-------------|---------------------------|
| N1 | ~~**`errorPolicy: 'all'` + Apollo error link + notification**~~ ✅ **Megvalósítva (2026-07-06)** | Tech/UX | **S** | A néma hibaelnyelés ma minden hibát „üres állapotnak” mutat. `ErrorLink` → Mantine notification, lokalizált (`en-gb`/`de`/`hu`) szöveggel ([client.ts](../src/lib/apollo/client.ts)). |
| N2 | **JSON-LD `<` escape + áthelyezés server komponensbe** | Security/SEO | **S** | Lásd 1/#34. `JSON.stringify(x).replace(/</g, '\\u003c')`. |
| N3 | **`pgvector` alapú „hasonló receptek”** | Feature | **M/L** | Neon free tier natívan támogatja a `pgvector` extensiont. Embedding: ingyenes modell (pl. Gemini API free tier `text-embedding-004`, vagy lokálisan generált a build/seed során). „Hasonló receptek” blokk a detail oldalon. |
| N4 | **Recept-import URL-ből (schema.org parser)** | Feature | **M** | A legtöbb receptoldal JSON-LD Recipe markupot publikál → fetch + parse + előtöltött create form. Csak szerveroldali fetch allowlist-tel (SSRF-védelem!). Teljesen ingyenes. |
| N5 | **„Cook mode” (képernyő ébren tartás + lépésenkénti nézet)** | Feature/UX | **S/M** | Natív `Screen Wake Lock API` + fullscreen step-by-step UI. Zero dependency, nagy UX-érték főzés közben. |
| N6 | **Adagszám-alapú hozzávaló-skálázás** | Feature | **S** | Kliensoldali szorzás a `servings` alapján a detail oldalon. Nincs API-igény. |
| N7 | **OG-image generálás `next/og`-gal** | SEO | **S/M** | `ImageResponse` a Next.js beépített (ingyenes) API-ja — recept címmel/képpel dinamikus social kártya. |
| N8 | **Umami / Plausible CE self-host analytics** | Tech | **M** | Vercel Analytics a Hobby tieren erősen limitált. Umami ingyen futtatható (akár Vercel + Neon ugyanazon a free Postgres-en). GDPR-barát, cookie-mentes. |
| N9 | **Sentry free tier (5k event/hó) vagy GlitchTip** | Tech | **S** | Jelenleg nincs hibamonitoring; a maszkolt szerverhibák nyomtalanul eltűnnek. |
| N10 | **Kép-feltöltés Vercel Blob-bal** | Feature | **M** | Vercel Hobby: Blob ingyenes kvótával. Alternatíva: Cloudinary free (25 credits/hó) vagy ImageKit free. File type + méret validáció kötelező. |
| N11 | **Resend free tier (3000 email/hó) a nodemailer SMTP helyett** | Tech | **S** | Megbízhatóbb kézbesítés a jelszó-reset emailekhez; a nodemailer megtartható fallbacknek. |
| N12 | **`noImplicitAny: true` migráció** | Tech | **M** | A `strict` család utolsó kiskapuja. Fokozatos: először `--noImplicitAny` hibalista, fájlonkénti javítás. |
| N13 | **Dependency-trim**: `react-icons`, `@mantine/nprogress` törlése | Tech | **S** | 1/#19 és 1/#40 lezárása; bundle-méret és karbantartási teher csökken. |
| N14 | **Neon branch-elt DB preview environmentek** | Tech/DX | **S** | Neon free tier támogatja a DB branchinget → PR-onkénti izolált DB a Vercel preview-hoz (GitHub Action ingyenes). |
| N15 | **RSS/Atom feed a legújabb receptekhez** | Feature/SEO | **S** | `app/feed.xml/route.ts` — ingyen, SEO- és retention-barát. |

---

## 3. Admin felület terve

### 3.1 Jelenlegi állapot

- **Nincs admin UI.** Az `ADMIN` role kizárólag a GraphQL [operationsConfig.ts](../src/lib/graphql/operationsConfig.ts) operation-gatingben és a `User.email` field-auth-ban él.
- A [proxy.ts](../src/proxy.ts) middleware csak a `/me` útvonalakat védi.
- **Master data**: a units/labels/categories/cuisines/allergens/equipment/costLevels **statikus TS tömb** a [metadata.ts](../src/lib/data/metadata.ts)-ben (~600 sor, `{ id, key, label, type, name }`), amit egy GraphQL passthrough query (`GET_ALL_METADATA`) → Redux slice → `useRecipeMetadata` hook juttat a formba. A recept a kiválasztott értéket **JSON snapshotként** tárolja (`category: Json?` stb.).

### 3.2 Route-struktúra és védelem

```
src/app/admin/
├── layout.tsx              ← szerveroldali RBAC guard + admin AppShell
├── page.tsx                ← Dashboard (analytics)
├── users/page.tsx          ← Felhasználó-kezelés
├── recipes/page.tsx        ← Recept-moderáció
├── metadata/
│   ├── page.tsx            ← Master data áttekintés
│   └── [type]/page.tsx     ← Típusonkénti CRUD (units, labels, categories…)
└── audit-log/page.tsx      ← Audit napló
```

**Kétrétegű védelem** (defense-in-depth):

```tsx
// src/app/admin/layout.tsx
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth/auth';
import { AdminShell } from './AdminShell';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') {
    redirect('/'); // vagy notFound() — ne áruljuk el, hogy létezik az admin
  }
  return <AdminShell>{children}</AdminShell>;
}
```

```ts
// src/proxy.ts — kiegészítés
if (pathname.startsWith('/admin')) {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/', request.url));
  }
}
```

> A middleware gyors elutasítást ad, a layout-guard pedig azt is védi, ha a middleware matcher kimarad. A GraphQL mutációk **harmadik rétegként** az `operationsConfig`-ban is ADMIN-onlyk.

### 3.3 Master data: statikus tömb → DB-alapú, admin által szerkeszthető

**Új Prisma modell** (a meglévő JSON-snapshot tárolás megtartásával — a régi receptek nem törnek el):

```prisma
enum MetadataType {
  CATEGORY
  LABEL
  DIFFICULTY_LEVEL
  UNIT
  CUISINE
  SERVING_UNIT
  DIETARY_FLAG
  ALLERGEN
  EQUIPMENT
  COST_LEVEL
}

model MetadataEntry {
  id        String       @id @default(cuid())
  key       String       // pl. "category-soup" — i18n kulcs is egyben
  type      MetadataType
  label     String       // fallback label, ha nincs fordítás
  sortOrder Int          @default(0)
  isActive  Boolean      @default(true) // soft delete — receptek hivatkozhatnak rá
  createdAt DateTime     @default(now())
  updatedAt DateTime     @updatedAt

  @@unique([type, key])
  @@index([type, isActive])
  @@map("metadata_entries")
}
```

**Migrációs stratégia**:
1. Migráció + seed script: a [metadata.ts](../src/lib/data/metadata.ts) tartalmának egyszeri beinsertálása.
2. A `getAllMetadata` resolver átáll `prisma.metadataEntry.findMany({ where: { isActive: true }, orderBy: [{ type: 'asc' }, { sortOrder: 'asc' }] })`-ra, Redis cache-eléssel (TTL 1 óra + invalidáció admin mutációknál — a master data ritkán változik).
3. A kliensoldali flow (Redux + `useRecipeMetadata`) **változatlan marad**, mert a válasz shape ugyanaz.
4. **Törlés = soft delete** (`isActive: false`): a meglévő receptek JSON snapshotja érintetlen, csak az új receptekben nem választható.

**GraphQL bővítés**:

```graphql
enum MetadataType { CATEGORY LABEL DIFFICULTY_LEVEL UNIT CUISINE SERVING_UNIT DIETARY_FLAG ALLERGEN EQUIPMENT COST_LEVEL }

input MetadataEntryInput {
  key: String!
  type: MetadataType!
  label: String!
  sortOrder: Int
}

type Mutation {
  createMetadataEntry(input: MetadataEntryInput!): MetadataEntry!    # ADMIN
  updateMetadataEntry(id: ID!, input: MetadataEntryInput!): MetadataEntry! # ADMIN
  setMetadataEntryActive(id: ID!, isActive: Boolean!): MetadataEntry! # ADMIN
  reorderMetadataEntries(type: MetadataType!, orderedIds: [ID!]!): [MetadataEntry!]! # ADMIN
}
```

### 3.4 Felhasználó-kezelés és recept-moderáció

**Séma-bővítések**:

```prisma
enum UserStatus { ACTIVE SUSPENDED }
enum RecipeStatus { DRAFT PUBLISHED HIDDEN }   // a HIDDEN = moderátor által levéve

model User {
  // ...meglévő mezők...
  status UserStatus @default(ACTIVE)
}

model Recipe {
  // ...meglévő mezők...
  status RecipeStatus @default(PUBLISHED)
  @@index([status])
}

model AuditLog {
  id         String   @id @default(cuid())
  actorId    String
  action     String   // pl. "USER_ROLE_CHANGED", "RECIPE_HIDDEN", "METADATA_UPDATED"
  targetType String   // "User" | "Recipe" | "MetadataEntry"
  targetId   String
  payload    Json?    // before/after diff
  createdAt  DateTime @default(now())

  @@index([actorId])
  @@index([targetType, targetId])
  @@index([createdAt])
  @@map("audit_logs")
}
```

**Admin GraphQL API** (mind ADMIN-only az `operationsConfig`-ban):

```graphql
type Query {
  adminUsers(search: String, role: UserRole, status: UserStatus, cursor: ID, limit: Int): AdminUserPage!
  adminRecipes(search: String, status: RecipeStatus, cursor: ID, limit: Int): AdminRecipePage!
  adminStats: AdminStats!            # dashboard aggregátumok
  adminAuditLog(cursor: ID, limit: Int): AuditLogPage!
}

type AdminStats {
  totalUsers: Int!
  newUsersLast30Days: Int!
  totalRecipes: Int!
  newRecipesLast30Days: Int!
  totalRatings: Int!
  activeUsersLast7Days: Int!
  topCategories: [CategoryCount!]!
}

type Mutation {
  adminSetUserRole(userId: ID!, role: UserRole!): User!
  adminSetUserStatus(userId: ID!, status: UserStatus!): User!
  adminDeleteUser(userId: ID!): Boolean!
  adminSetRecipeStatus(recipeId: ID!, status: RecipeStatus!): Recipe!
}
```

Az `AuditLog`-írás a service-rétegben történjen (pl. `AdminService.withAudit(actorId, action, target, fn)` wrapper), ne a resolverben — így egyetlen helyen garantált.

### 3.5 Admin UI (Mantine)

- **Layout**: külön `AppShell` (`navbar` 260 px) — a publikus Shell-től független; szekciók: Dashboard, Users, Recipes, Master data, Audit log; tetején `Breadcrumbs`.
- **Dashboard**: `SimpleGrid` + `Card` stat-kártyák (`AdminStats`), `@mantine/charts` **nem kell** — a meglévő stack-kel `Progress`/`RingProgress` elegendő; ha grafikon kell, a `@mantine/charts` ugyanabból a csomagcsaládból ingyenes.
- **Users/Recipes lista**: `Table` + `ScrollArea`, oszloprendezés, `TextInput` keresés (debounced), `Select` szűrők, `Menu` sor-akciók (role-váltás `Select`-tel, suspend `Switch`-csel, törlés `modals.openConfirmModal`-lal).
- **Master data CRUD**: `Tabs` típusonként; soronként inline `TextInput` (label), `NumberInput` (sortOrder), `Switch` (isActive); új elem `Modal`-ban; átrendezés fel/le `ActionIcon`-nal (drag-and-drop később).
- **Audit log**: read-only `Table` + `Pagination`, `Code` blokk a payload diffnek.

---

## 4. Új dizájn és theme (megvalósítva)

> **A [lightTheme.ts](../src/providers/mantine/lightTheme.ts) és [darkTheme.ts](../src/providers/mantine/darkTheme.ts) fájlok felül lettek írva** a lenti dizájnrendszerrel; mind a 9 kapcsolódó unit teszt zöld.

### 4.1 Színpaletta — brand anchor: `#E00890` (pink.7)

| Szerep | Szín | Tuple | Használat |
|--------|------|-------|-----------|
| **Primary** | `pink` (`#E00890` @ index 7) | `#FFEBF5 → #AD1374` | CTA, linkek, aktív állapotok. A `pink` tuple felül van írva, így **minden meglévő `color="pink"` használat automatikusan on-brand**. A `bright-pink` alias megmaradt kompatibilitásból. |
| **Accent 1** | `violet` (berry) | `#F5EDFF → #541898` | A meglévő `pink → violet, 45°` gradiensek harmonizált párja; `defaultGradient`-ként beállítva. |
| **Accent 2** | `teal` (herb) | `#E4FBF4 → #008F5F` | Siker-állapotok, „egészséges/vegán” badge-ek. |
| **Warning** | `orange` (saffron) | `#FFF4E1 → #AE5900` | Figyelmeztetés, költség-/csípősség-jelzők. |
| **Error** | `red` | Mantine-kompatibilis piros | Destruktív műveletek, hibák. |
| **Neutral** | `gray` (warm) | `#F9F8F9 → #262326` | Enyhén pink-alátónusú szürkeskála a brand-koherenciáért. |
| **Dark felületek** | `dark` (ink) | `#C9C9CE → #161619` | Semleges (nem kékes) sötét skála; body: `dark.7` (#26262B), kártya: `dark.6`. |

Kulcsdöntés: **`primaryShade: { light: 7, dark: 5 }`** — sötét módban a világosabb `#EC3EA4` a primary, így a fehér gombfelirat kontrasztja ≥ 4,5:1 marad.

### 4.2 Vizuális/UX irányelvek

| Terület | Irányelv |
|---------|----------|
| **Tipográfia** | System font stack (zero font-loading költség); headings `fontWeight: 700`, h1 34/1.25 → h4 18/1.4. Input label: 500-as súly, `gray.7` (light) / `gray.4` (dark). |
| **Border-radius** | `defaultRadius: 'md'` (10 px). Kártyák/modálok: `lg` (14 px), badge: `sm` (6 px) — a lekerekítés hierarchiát jelez (nagyobb felület → nagyobb rádiusz). |
| **Árnyékok** | Light: meleg tónusú (pink-alapú `rgba(38,6,28,…)`) dupla rétegű árnyékok. Dark: erősebb fekete árnyék + `withBorder: false` a kártyákon — sötétben az eleváció a felületszínből jöjjön, ne borderből. |
| **Spacing** | Mantine defaults (4/8/16/24/32); kártya-belső: `md`, szekciók között `xl`. |
| **Kártya-dizájn** | Light: `shadow: sm` + `withBorder: true` + `radius: lg`; hover: `shadow: md` + 2 px translateY (CSS module). Recept-kártya: 4:3 kép, kategória-badge a képen (blur backdrop), cím max 2 sor (`lineClamp={2}`). |
| **Dark kontraszt** | Body text `gray.2` (~11:1), másodlagos szöveg min. `gray.4`; tiszta fehér szöveg kerülendő (halo-effekt); képekre 8%-os sötétítő overlay dark módban. |
| **Motion** | `respectReducedMotion: true` beállítva; áttűnések ≤ 200 ms. |
| **Modal** | Overlay blur 4 px + 45% opacity — modern, tartalom-fókuszú. |

### 4.3 A darkTheme bekötése (jelenleg dead code!)

A `MantineProvider` csak a `lightTheme`-et kapja — a dark színsémát ma kizárólag a Mantine CSS-változói kezelik, a `darkTheme` overrideok (pl. `Text c: gray.2`) **soha nem érvényesülnek**. Javasolt bekötés (`MantineThemeProvider` a v9-ben theme-et cserél a fán belül):

```tsx
// src/providers/mantine/mantine.tsx — kiegészítés
import { MantineThemeProvider, useComputedColorScheme } from '@mantine/core';
import { darkTheme } from './darkTheme';

const SchemeAwareTheme = ({ children }: PropsWithChildren) => {
  const scheme = useComputedColorScheme('light');
  return (
    <MantineThemeProvider theme={scheme === 'dark' ? darkTheme : lightTheme}>
      {children}
    </MantineThemeProvider>
  );
};

// a MantineProvider-en BELÜL:
// <SchemeAwareTheme><ModalsProvider>{children}</ModalsProvider></SchemeAwareTheme>
```

---

## 5. SEO audit

### 5.1 Jelenlegi állapot

| Elem | Állapot | Részletek |
|------|---------|-----------|
| Root metadata | ✅ | [layout.tsx](../src/app/layout.tsx#L29-L68): locale-aware title/description, OG, twitter card, `metadataBase`. |
| **Recept-oldal metadata** | ❌ **Kritikus** | [recipes/[id]/page.tsx](../src/app/recipes/[id]/page.tsx#L10-L22): statikus i18n kulcsok — minden recept azonos title/description-nel jelenik meg a keresőben. A DB `seoTitle`/`seoDescription`/`socialImage` mezői **sehol nincsenek felhasználva**. |
| sitemap.xml | ❌ | Nincs. |
| robots.txt | ❌ | Nincs. |
| JSON-LD Recipe | 🟡 | Megvan, de kliens komponensben + escape nélkül (XSS-vektor, lásd 1/#34). |
| Canonical URL | ❌ | Nincs `alternates.canonical`. |
| hreflang | ❌/N.A. | A locale cookie-alapú, nincs locale-prefixes URL → hreflang jelenleg nem is értelmezhető. Hosszú távon `/{locale}/` prefix kellene a lokalizált indexeléshez. |
| Slug URL-ek | ❌ | `slug @unique` + index a DB-ben, de a routing `[id]`-alapú. |
| OG image | 🟡 | Statikus; nincs recept-specifikus `socialImage` vagy `next/og` generálás. |

### 5.2 Konkrét javítások

**(a) `sitemap.ts`** — új fájl `src/app/sitemap.ts`:

```ts
import type { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma/prisma';

const BASE_URL = process.env.NEXTAUTH_URL ?? 'https://cookbook-next.vercel.app';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const recipes = await prisma.recipe.findMany({
    select: { id: true, slug: true, updatedAt: true },
    orderBy: { updatedAt: 'desc' },
    take: 5000,
  });

  return [
    { url: BASE_URL, changeFrequency: 'daily', priority: 1 },
    { url: `${BASE_URL}/recipes`, changeFrequency: 'daily', priority: 0.9 },
    ...recipes.map((r) => ({
      url: `${BASE_URL}/recipes/${r.slug ?? r.id}`,
      lastModified: r.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
  ];
}
```

**(b) `robots.ts`** — új fájl `src/app/robots.ts`:

```ts
import type { MetadataRoute } from 'next';

const BASE_URL = process.env.NEXTAUTH_URL ?? 'https://cookbook-next.vercel.app';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/me/', '/admin/', '/login', '/signup', '/reset-password'],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
```

**(c) Recept-specifikus `generateMetadata`** — a DB SEO mezőkkel és canonical-lal:

```tsx
// src/app/recipes/[id]/page.tsx
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const recipe = await RecipeService.getRecipeById(id); // cache-elt (Redis, 60s)
  if (!recipe) return { title: 'Recipe not found' };

  const title = recipe.seoTitle ?? recipe.title;
  const description =
    recipe.seoDescription ?? recipe.description?.slice(0, 160) ?? undefined;
  const image = recipe.socialImage ?? recipe.imgSrc ?? undefined;
  const canonicalPath = `/recipes/${recipe.slug ?? recipe.id}`;

  return {
    title,
    description,
    alternates: { canonical: canonicalPath },
    openGraph: {
      title,
      description,
      type: 'article',
      url: canonicalPath,
      images: image ? [{ url: image }] : undefined,
    },
    twitter: { card: 'summary_large_image', title, description },
  };
}
```

**(d) JSON-LD hardening + server-render** — a `RecipeDetailClient`-ből a server `page.tsx`-be:

```tsx
const jsonLd = JSON.stringify(buildRecipeJsonLd(recipe)).replace(/</g, '\\u003c');
// ...
<script
  type="application/ld+json"
  // biome-ignore lint/security/noDangerouslySetInnerHtml: escaped above
  dangerouslySetInnerHTML={{ __html: jsonLd }}
/>
```

Bővítendő a `buildRecipeJsonLd` is: `aggregateRating` (megvan az adat!), `author`, `datePublished` mezőkkel — a Google rich result feltételei.

**(e) Slug-alapú URL-ek**: `recipes/[id]` → a param értelmezése „slug VAGY id”-ként (`RecipeService.getRecipeBySlugOrId`), és ha id-vel hívták, `permanentRedirect(`/recipes/${slug}`)`. Így a régi linkek nem törnek el.

**(f) ISR a recept-oldalakra**: `generateMetadata` + oldal `revalidate = 300` exporttal (a `connection()` hívás kivezetése után) — a receptoldal tartalma ritkán változik, a rating-blokk kliensoldali marad.

---

## 6. „Recently viewed recipes” feature terve

**Jelenlegi állapot**: a [HomePage.tsx](../src/app/HomePage.tsx) a [mockRecentlyViewed.ts](../src/app/mockRecentlyViewed.ts) hardcode-olt tömbjét rendereli „This is a mock recently viewed section” felirattal — **placeholder, valós tracking nincs**.

### 6.1 Javasolt architektúra — kétfázisú

**Fázis 1 (S) — localStorage-only, vendégnek és bejelentkezettnek egyaránt:**

- Kulcs: `cookbook:recently-viewed:v1`, tartalom: `Array<{ id: string; viewedAt: number }>`, max **12 elem**, FIFO + dedup (újranézés → elem előre).
- Írás: a recept-detail oldal kliens komponensében `useEffect`-ből (nem RSC-ben — ne blokkolja a renderelést).
- Olvasás: HomePage-en új GraphQL query hidratálja az ID-kat:

```graphql
query GetRecipesByIds($ids: [ID!]!) {
  getRecipesByIds(ids: $ids) {
    id title imgSrc cookingTime difficultyLevel averageRating ratingsCount
  }
}
```

  A resolver `where: { id: { in: ids } }` + max 12 id (védelmi limit), a kliens az eredeti sorrend szerint rendez. Törölt recept ID-k némán kimaradnak → a kliens ilyenkor purge-eli őket a localStorage-ból.

**Fázis 2 (M, opcionális) — DB-sync bejelentkezett usereknek:**

```prisma
model RecipeView {
  userId   String
  recipeId String
  viewedAt DateTime @default(now())
  user     User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  recipe   Recipe @relation(fields: [recipeId], references: [id], onDelete: Cascade)

  @@id([userId, recipeId])   // upsert → csak a legutolsó megtekintés
  @@index([userId, viewedAt])
  @@map("recipe_views")
}
```

- Írás: fire-and-forget `trackRecipeView` mutation (debounce/dedup kliensen, 1 view / recept / session); NEM strict rate limit alá.
- Merge-stratégia loginkor: localStorage lista felszinkronizálása egyszer, aztán a DB a forrás.
- Retenció: cron (Vercel cron ingyenes) vagy lusta törlés — 90 napnál régebbi sorok törlése, user-enként max 50 sor.

### 6.2 UI, teljesítmény, adatvédelem

- **Elhelyezés**: HomePage második carousel (a mock helyén), csak ha ≥ 3 elem; recept-detail alján „Korábban megnézted” sor.
- **Teljesítmény**: a query `cache-first`; a localStorage-írás mikrotaszk; SSR-mismatch elkerülése: a szekció `mounted` guard mögött renderel (a lista amúgy is kliens-specifikus).
- **GDPR**: Fázis 1: minden adat az eszközön marad → nem személyes adatkezelés a szerveren, de a cookie policy-ban ([cookie-policy](../src/app/cookie-policy)) fel kell sorolni a localStorage-kulcsot és célját. Fázis 2: a `RecipeView` személyes adat → (1) jogalap: jogos érdek vagy hozzájárulás, (2) törlés a fiók törlésekor (`onDelete: Cascade` ✅), (3) retenciós idő dokumentálása a privacy policy-ban, (4) opt-out kapcsoló a profil-beállításokban.

---

## 7. Recipe rating rendszer újragondolása

### 7.1 Jelenlegi implementáció problémái

| # | Probléma | Bizonyíték |
|---|----------|-----------|
| 1 | **Felesleges teljes refetch**: a mutation már visszaadja az `averageRating/ratingsCount/userRating` mezőket, amit az Apollo a `Recipe:id` normalizáció miatt automatikusan bemerge-el — a `refetchQueries: ['getRecipeById']` ([RecipeRating.tsx](../src/components/Recipe/Rating/RecipeRating.tsx)) egy komplett újra-lekérdezést indít feleslegesen. | UI-lag + dupla terhelés |
| 2 | **Nincs optimista update** — a csillag csak a szerver-válasz után frissül. | UX |
| 3 | **Saját recept értékelhető** — nincs szerveroldali tiltás → rating-inflálás. | `RecipeService.rateRecipe` nem ellenőrzi a `createdBy`-t |
| 4 | **Összemosott UI**: ugyanaz a `<Rating>` mutatja az átlagot ÉS fogadja a user értékelését (`userRating ?? averageRating`) — a user azt hiheti, az átlagot állítja. | [RecipeRating.tsx](../src/components/Recipe/Rating/RecipeRating.tsx) |
| 5 | **Nincs értékelés-törlés a UI-ban**, pedig a `deleteRating` mutation létezik. | resolver megvan, UI nincs |
| 6 | `ratingValue: Float` + `fractions={2}` → fél csillagok adhatók, de a legtöbb platform egész csillagot használ; a fél csillag az átlag *megjelenítésére* való, nem inputra. | schema + UI |
| 7 | A Redis detail-cache (60 s TTL) invalidálódik ratingkor ✅, de a **listaoldali** átlagok a lista-cache-ből (15 s) max ennyit késnek — elfogadható. | info |

### 7.2 Javasolt átalakítás (M)

1. **UI szétválasztás**: felül read-only átlag (`fractions={2}`, `readOnly`) + count; alatta „Your rating” interaktív `<Rating fractions={1}>` + „Remove” gomb (`DELETE_RATING`).
2. **Optimista update + refetch elhagyása**:

```tsx
const [rateRecipe] = useMutation(RATE_RECIPE, {
  optimisticResponse: ({ ratingInput }) => ({
    rateRecipe: {
      __typename: 'Recipe',
      id: recipeId,
      userRating: ratingInput.ratingValue,
      // becsült új átlag — a szerver-válasz úgyis felülírja
      averageRating: estimateNewAverage(averageRating, ratingsCount, userRating, ratingInput.ratingValue),
      ratingsCount: userRating == null ? ratingsCount + 1 : ratingsCount,
    },
  }),
  errorPolicy: 'all', // a néma 'ignore' helyett — hibánál rollback + notification
});
```

3. **Szerveroldali guard**: `rateRecipe`-ben `if (recipe.createdBy === userId) throw FORBIDDEN('You cannot rate your own recipe')`.
4. **Integer rating**: `ratingValue: Int` a GraphQL inputban (a DB `Float` maradhat a meglévő adatok miatt), UI `fractions={1}`.
5. **Skálázási opció** (csak ha szükség lesz rá, L): denormalizált `ratingSum Int` + `ratingCount Int` a `Recipe`-n, tranzakcióban frissítve — kiváltja a `groupBy` DataLoadert. Jelenlegi méretnél **nem indokolt**.
6. **Review + rating kombinálás**: ha a komment-rendszer (1/#15) megépül, a `Comment` kapjon opcionális `rating` linket (a Rating rekordra FK), így „értékeléses vélemény” jön létre — a Google `aggregateRating` + `review` rich resulthoz is ez kell.

---

## 8. Recept létrehozás flow felülvizsgálata

### 8.1 Jelenlegi flow (erős alap!)

A flow már most **4 szekciós multi-step composer** ([RecipeComposer.tsx](../src/components/Recipe/Create/RecipeComposer.tsx)): Basics → Media → Ingredients → Steps, sidebar navigációval, completion-számlálóval (8 mező, %), **localStorage draft autosave-vel** (800 ms debounce, `cookbook:create:draft:v2`), **preview Drawer-rel** (300 ms debounce), Zod validációval (`mantine-form-zod-resolver`), és hibánál szekcióra-ugrással (`goToSectionRef`). Ez a korábbi audit óta jelentős, dokumentálatlan fejlődés.

### 8.2 Hiányosságok és javaslatok

| # | Javaslat | Komplexitás | Részletek |
|---|----------|-------------|-----------|
| R1 | **Drag-and-drop átrendezés** | M | Ingredients: jelenleg **semmilyen** átrendezés nincs; Steps: csak fel/le nyilak. Javasolt: `@hello-pangea/dnd` (ingyenes, karbantartott) vagy `@dnd-kit` — mindkét listára, mobile touch-támogatással. A `order`/`localId` mezők már felkészültek erre. |
| R2 | **Szekció-szintű hibajelzés a sidebarban** | S | A sidebar nav elemekre piros pötty/`Badge` a hibás mezőszámmal — most a user csak submitkor tudja meg, melyik szekció hiányos. A `computeCompletion` mintájára `computeSectionErrors(form.errors)`. |
| R3 | **Slug auto-generálás** | S | A `slug` mezőt a title-ből generálni (diakritika-mentesítés + kebab-case) egy „↻” gombbal; ütközés-ellenőrzés a submitnál (`slug @unique`). Enélkül a slug-alapú SEO URL (5. szekció) nem tud elterjedni. |
| R4 | **Server-side draft** (`RecipeStatus.DRAFT`) | M | A 3.4-es `status` mezővel: „Save as draft” gomb → a draft eszközfüggetlen, és az edit-flow is drafttá tud válni. A localStorage-draft marad offline fallbacknek. |
| R5 | **Kép-URL élő validáció** | S | `onBlur`-ra egy rejtett `<img>` betöltési próba → azonnali visszajelzés törött URL-nél (a Zod `z.url()` csak formátumot ellenőriz). |
| R6 | **Mennyiség-input törtekkel** | S | `1/2`, `1,5` elfogadása és normalizálása a quantity mezőben — a receptek világában alapelvárás. |
| R7 | **Duplikálás meglévő receptből** | S/M | „Duplicate” akció a saját recept kártyáján → a create form előtöltése (id/slug nélkül). Olcsó, nagy érték a variánsokhoz. |
| R8 | **Autosave-indikátor** | S | „Saved to draft · just now” felirat a headerben — a user ma nem tudja, hogy van autosave. |
| R9 | **Mobil sticky footer nav** | S | A szekció-váltó és a submit gomb mobilon sticky footerbe — a jelenlegi sidebar Drawer mobilon sok interakciót igényel. |

---

## 9. Szabad ötletelés — további feature-ök

| # | Ötlet | Komplexitás | Indoklás |
|---|-------|-------------|----------|
| F1 | **„Mi van a hűtőmben?” v2 — hiányzó összetevők száma** | L | Az összetevő-keresés (1/#23) kiterjesztése: ne csak szűrjön, hanem rangsoroljon „N hiányzó hozzávaló” szerint. Postgres oldali aggregáció. |
| F2 | **Szezonális/ünnepi kollekciók a főoldalon** | S | Admin által kurált `Collection` (3. szekció modelljére építve) — azonnali tartalmi frissesség-érzet. |
| F3 | **Recept-embed widget (oEmbed/iframe)** | M | `/embed/recipes/[slug]` minimál-nézet — ingyenes terjesztési csatorna. |
| F4 | **Gamification: szakács-badge-ek** | M | „Első recept”, „10 értékelés”, „követett szerző” — `UserBadge` tábla + esemény-hookok a service-rétegben. Retention-növelő, zero külső függőség. |
| F5 | **Heti e-mail digest (Vercel Cron + Resend free)** | M | Top 5 új recept a követett szerzőktől. Opt-in, GDPR-kompatibilis leiratkozó linkkel. |
| F6 | **`pgvector` „ízlés-alapú” ajánló** | L | A kedvencek embedding-átlagából személyre szabott főoldali sor („Neked ajánljuk”). Neon free tier + ingyenes embedding API (lásd N3). |
| F7 | **Konyhai időzítő a lépésekben** | S | A lépés-szövegben felismert időtartamokra (`\d+ (perc|min)`) kattintható timer chip — Web Notifications API-val. Cook mode (N5) természetes párja. |
| F8 | **Accessibility audit + fixek** | M | `axe-core` a Playwright e2e-be (ingyenes) — a carousel, a rating és a multi-step form tipikus a11y-gócok. |

---

## 10. Microfrontend / Module Federation elemzés

### 10.1 Kiindulás

Az app **egyetlen, közepes méretű monolit**: 1 fejlesztő(?), 1 deployable unit, ~40 route, közös design system (Mantine theme), közös auth (NextAuth JWT cookie), közös GraphQL endpoint. A webpack-alapú `@module-federation/nextjs-mf` App Routerrel sosem működött megbízhatóan és EOL — **kizárva**.

### 10.2 Opciók összehasonlítása

| Szempont | **Marad monolit** (status quo) | **Turborepo monorepo** (packages) | **Vercel Multi-Zones** | **ESM / Module Federation 3.0** |
|----------|-------------------------------|----------------------------------|------------------------|--------------------------------|
| App Router kompatibilitás | ✅ natív | ✅ natív | ✅ natív (routing-szintű) | ⚠️ kísérleti, framework-idegen |
| Runtime kompozíció | N/A | ❌ (build-time) | ❌ (page-szintű, hard navigation zónák közt) | ✅ |
| Közös session/auth | ✅ | ✅ | 🟡 közös cookie-domain kell | 🔴 bonyolult |
| Közös Mantine theme/design | ✅ | ✅ (`packages/ui`) | 🟡 duplikált provider-setup | 🔴 verzió-konfliktusok |
| Deploy-függetlenség | ❌ | 🟡 (app-onként lehet) | ✅ | ✅ |
| Free-tier költség | ✅ 1 Vercel projekt | ✅ | 🟡 zónánként külön Hobby projekt (limitek szorzódnak, de ingyenes) | ✅/🟡 |
| Komplexitás-adó | — | +S | +M | +XL |

### 10.3 Döntési mátrix — mikor indokolt a microfrontend?

| Feltétel | Teljesül itt? |
|----------|---------------|
| ≥ 2–3 **önálló csapat** független release-igénnyel | ❌ |
| Eltérő technológiai stack indokolt területenként | ❌ (minden Mantine+Apollo) |
| Egy terület build-ideje blokkolja a többit (>10 perc) | ❌ (Turbopack, kis app) |
| Szervezeti határ = modul határ (Conway) | ❌ |
| Külön compliance/release cadence (pl. admin vs. publikus) | 🟡 legfeljebb az admin |

**0/5 erős igen → microfrontend jelenleg NEM indokolt.**

### 10.4 Ajánlás

1. **Most**: monolit marad, de **modulhatárok kikényszerítése** a repón belül — a `src/lib/services` réteg már jó irány; Biome `noRestrictedImports` szabállyal védhetők a határok (pl. UI nem importálhat közvetlenül Prismát). Költség: S.
2. **Ha az admin (3. szekció) nagyra nő**: első lépésként **Vercel Multi-Zones** — `admin.cookbook.hu` külön Next.js appként, közös auth cookie-val (ugyanaz a root domain), `rewrites`-szal a fő appból. Ez routing-szintű, App Router-kompatibilis, és nem igényel runtime federation-t. Előfeltétel: Turborepo monorepo `packages/ui` (theme) + `packages/graphql` (typedefs/queries) megosztott csomagokkal. Költség: L.
3. **MF 3.0 / ESM federation**: csak akkor, ha valódi runtime plugin-rendszer kell (pl. harmadik fél által fejlesztett modulok) — erre a projektméretnél és -struktúránál **nincs reális forgatókönyv 2026–27-ben**.

---

## 11. Konszolidált, prioritizált backlog (v2)

> Komplexitás: S < 1 nap · M 1–3 nap · L 3–7 nap · XL 1–3 hét

| # | Tétel | Kategória | Prio | Kompl. | Megjegyzés |
|---|-------|-----------|------|--------|------------|
| 1 | `.env` → `.env.local` + Neon jelszó-rotáció verifikálása | Security | **P0** | S | 1/#1 lezárása |
| 2 | JSON-LD `<` escape + server-render | Security/SEO | **P0** | S | 1/#34, 5.2(d) |
| 3 | ~~Apollo `errorPolicy: 'ignore'` → `'all'` + error link + notification~~ ✅ **Kész (2026-07-06)** | Tech/UX | **P0** | S | 1/#20, N1 |
| 4 | Recept `generateMetadata` DB-mezőkből + canonical | SEO | **P0** | M | 5.2(c) — legnagyobb SEO-hatás |
| 5 | `sitemap.ts` + `robots.ts` | SEO | **P0** | S | 5.2(a)(b) |
| 6 | Cursor-alapú pagináció + Load More UI | Tech | **P0** | L | 1/#5 — typePolicies már felkészült |
| 7 | Saját recept értékelésének tiltása (szerveroldal) | Security | **P0** | S | 7.1/#3 |
| 8 | next-auth beta → stabil Auth.js / better-auth | Tech | **P1** | L | 1/#9 — még mindig nyitott |
| 9 | Rating UI szétválasztás + optimista update + törlés gomb | UX | **P1** | M | 7.2 |
| 10 | Slug-alapú recept URL-ek + redirect | SEO | **P1** | M | 5.2(e) |
| 11 | ISR/`revalidate` a recept-oldalakra | Tech | **P1** | M | 1/#22, 5.2(f) |
| 12 | Full-text keresés (Postgres `tsvector` + GIN, Neon free) | Feature | **P1** | L | 1/#14 |
| 13 | Admin: RBAC guard + AppShell + Users/Recipes moderáció | Feature | **P1** | L | 3.2, 3.4 |
| 14 | Admin: Master data DB-modell + seed + CRUD UI | Feature | **P1** | L | 3.3 — statikus metadata.ts kiváltása |
| 15 | Admin: AuditLog modell + service wrapper | Feature | **P1** | M | 3.4 |
| 16 | Admin: Dashboard statisztikák (`adminStats`) | Feature | **P1** | M | 3.5 |
| 17 | `darkTheme` bekötése (`SchemeAwareTheme`) | Tech/Design | **P1** | S | 4.3 — az új theme-ek már a repóban vannak |
| 18 | Recently viewed — Fázis 1 (localStorage + `getRecipesByIds`) | Feature | **P1** | S/M | 6.1, kiváltja a mockot |
| 19 | Valódi APQ vagy query-allowlist a kliensben | Security | **P1** | M | 1/#13 — a mostani hash-check önmagában nem véd |
| 20 | Nonce-alapú CSP (`unsafe-inline` kivezetés) | Security | **P1** | M | 1/#18 |
| 21 | `react-icons` + `@mantine/nprogress` törlése | Tech | **P1** | S | 1/#19, 1/#40, N13 |
| 22 | Komment rendszer (Comment modell + UI, rating-linkkel) | Feature | **P1** | L | 1/#15 + 7.2/#6 |
| 23 | Kép-feltöltés (Vercel Blob free) | Feature | **P1** | M/L | N10 |
| 24 | Social login (Google OAuth, ingyenes) | Feature | **P1** | M | 1/#17 |
| 25 | Create flow: drag-and-drop + szekció-hibajelzés + slug-gen + autosave-indikátor | UX | **P1** | M | 8.2 R1–R3, R8 |
| 26 | Server-side draft (`RecipeStatus.DRAFT`) | Feature | **P1** | M | 8.2 R4 + 3.4 séma |
| 27 | Sentry/GlitchTip free hibamonitoring | Tech | **P1** | S | N9 |
| 28 | Recently viewed — Fázis 2 (DB-sync + retenció + opt-out) | Feature | **P2** | M | 6.1 |
| 29 | `noImplicitAny: true` migráció | Tech | **P2** | M | 1/#29, N12 |
| 30 | Recept-import URL-ből (JSON-LD parser, SSRF-védett) | Feature | **P2** | M | N4 |
| 31 | Cook mode (Wake Lock + step nézet) + lépés-timerek | Feature | **P2** | M | N5, F7 |
| 32 | Adagszám-skálázás + tört mennyiségek | Feature | **P2** | S | N6, R6 |
| 33 | `next/og` dinamikus OG-image | SEO | **P2** | S/M | N7 |
| 34 | `pgvector` hasonló receptek / ajánló | Feature | **P2** | L | N3, F6 |
| 35 | Bevásárlólista (kliensoldali aggregáció) | Feature | **P2** | M | 1/#24 |
| 36 | PWA / Service Worker + offline receptek | Feature | **P2** | M | 1/#33 |
| 37 | Umami self-host analytics | Tech | **P2** | M | N8 |
| 38 | Gamification badge-ek | Feature | **P2** | M | F4 |
| 39 | a11y audit (axe-core a Playwrightban) | Tech | **P2** | M | F8 |
| 40 | Print-friendly nézet (`@media print`) | Feature | **P2** | S | 1/#39 |
| 41 | RSS feed + heti digest email | Feature | **P2** | M | N15, F5 |
| 42 | Turborepo monorepo + Multi-Zones admin (CSAK ha az admin kinövi a fő appot) | Arch | **P3** | XL | 10.4 — jelenleg nem indokolt |

### Javasolt sprint-sorrend

1. **Sprint 1 (quick wins + P0)**: #1–#5, #7, #17, #21 — csupa S/M, azonnali biztonsági+SEO hatás.
2. **Sprint 2–3**: #6, #9, #10, #11, #18, #19 — pagináció, rating, SEO-URL, recently viewed.
3. **Sprint 4–6**: #13–#16 (admin blokk), #12, #22, #23, #25, #26.
4. **Q4**: P2 tételek érték/erőfeszítés arány szerint (#31, #32, #33 olcsó és látványos).

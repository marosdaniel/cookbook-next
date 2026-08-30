# 🛠️ Cookbook-Next — Admin panel terv (felülvizsgált)

> **Dátum**: 2026-08-30
> **Előzmény-terv**: [cookbook_next_audit_2026-07-06.md](cookbook_next_audit_2026-07-06.md) 3. szekció („Admin felület terve”) — **létezik korábbi terv**, ez a dokumentum annak kritikai felülvizsgálata és kibővítése.

---

## 1. A korábbi terv felülvizsgálata — mi változott és miért

A 07-06-os terv négy pillére: (a) kétrétegű route-védelem, (b) `MetadataEntry` DB-modell + CRUD, (c) User/Recipe moderáció + `AuditLog`, (d) Mantine admin UI. Azóta a kódbázis jelentősen elmozdult, ezért a terv több pontja **elavult vagy már részben teljesült**:

| A 07-06 terv pontja | Állapot 2026-08-30 | Változtatás ebben a tervben |
|---|---|---|
| `proxy.ts` kiegészítése admin-ellenőrzéssel | **Részben kész**: a [routePolicies.ts](../src/lib/auth/routePolicies.ts) már ismeri az `admin` route family-t, a proxy centralizált policy-ből dolgozik | Nem kell új proxy-logika, csak az `/admin` family **aktiválása** + a layout guard megírása. A 07-06-os inline `pathname.startsWith('/admin')` kódrészlet **elavult** — a policy-modul a helyes hely |
| `MetadataEntry` modell + migráció + seed | **Kész, más néven**: `Metadata` modell (`MetadataType` enum, `isActive`, `sortOrder`), migráció `20260726000000_add_metadata_model`, seed a `METADATA_DEFINITIONS`-ból | A terv CRUD-része marad; **új elem**: a `METADATA_DEFINITIONS` fájl szerepének seed-only-ra szűkítése, hogy ne legyen két igazságforrás (lásd 5.2) |
| Admin GraphQL API nulláról | **Részben kész**: az operationsConfig-ban már 5 admin művelet él (`DELETE_ALL_USER`, `CLEAN_USER_RECIPES`, `DELETE_ALL_RECIPES`, `CREATE_METADATA`, `DELETE_METADATA`) | A destruktív „delete all” műveletek **kivezetendők vagy audit-log mögé zárandók** (lásd 7.3); a terv finomabb granularitású műveleteket ad helyettük |
| `AuditLog`, `UserStatus`, `RecipeStatus` modellek | Nem készültek el | Változatlanul szükségesek; a séma pontosítva (7.1) |
| UI: Mantine Table + szűrők | Nem készült el | Kibővítve: typedRoutes-konvenció, motion-integráció, cursor-pagináció (ami azóta bevezetett minta), persisted-query-registry regisztráció — ezek a 07-06 tervből **hiányoztak** |
| — (nem szerepelt) | — | **Új szempontok**: nonce-alapú CSP-kompatibilitás, strict rate limiting az admin mutációkra, e2e tesztek, GDPR (user-törlés kaszkádjai), fokozatos MVP-bevezetés |

## 2. Cél és scope

| Entitás | Admin képességek | Fázis |
|---|---|---|
| **Metadata (taxonómia)** | Listázás típusonként, létrehozás, szerkesztés (label/sortOrder), aktiválás/deaktiválás (soft delete), átrendezés | **MVP** |
| **Felhasználók** | Keresés/listázás, szerep-váltás (USER/BLOGGER/ADMIN), felfüggesztés (`SUSPENDED`), törlés (GDPR-kaszkáddal) | **MVP** (törlés: 2. fázis) |
| **Receptek** | Keresés/listázás, moderációs elrejtés (`HIDDEN`), megtekintés, végleges törlés | 2. fázis |
| **Dashboard** | Aggregált statisztikák (user/recept/rating számok, trendek) | 2. fázis |
| **Audit log** | Minden admin-akció megtekinthető naplója | **MVP** (írás) / 2. fázis (UI) |
| **Riportok/moderációs kérelmek** | Felhasználói bejelentések kezelése | 3. fázis (a komment-rendszerrel együtt) |

## 3. Jogosultsági modell — illeszkedés a meglévő rendszerhez

Háromrétegű defense-in-depth, **mindhárom réteg már létező mintára épül**:

1. **Proxy (korai elutasítás)** — a [routePolicies.ts](../src/lib/auth/routePolicies.ts) `admin` route family-je már definiált; a proxy `canAccessRouteFamily()` hívása lefedi. Teendő: e2e teszt, hogy nem-admin `/admin`-ra lépve redirectet kap.
2. **Server layout guard (autoritatív)** — új `src/app/admin/layout.tsx`:

```tsx
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth/auth';
import { PUBLIC_ROUTES } from '@/types/routes';
import { AdminShell } from './AdminShell';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') {
    // notFound() helyett redirect: a route family miatt a proxy úgyis elfedi
    redirect(PUBLIC_ROUTES.HOME);
  }
  return <AdminShell>{children}</AdminShell>;
}
```

3. **GraphQL operation-gating** — az új admin műveletek az `operationsConfig.adminOperations` listába kerülnek, és (mivel a kliens persisted-query allowlisttel dolgozik) a [persistedQueryRegistry.ts](../src/lib/graphql/persistedQueryRegistry.ts)-be is regisztrálandók. *Ez a lépés a 07-06 tervből hiányzott — nélküle az admin UI query-i 400-at kapnának.*

## 4. Route- és layout-struktúra (typedRoutes-konvenció szerint)

```
src/app/admin/
├── layout.tsx              ← RBAC guard + AdminShell (külön AppShell, 260px navbar)
├── page.tsx                ← Dashboard (2. fázis; MVP-ben redirect /admin/metadata-ra)
├── metadata/
│   └── page.tsx            ← Master data CRUD (Tabs típusonként)
├── users/
│   └── page.tsx            ← Felhasználó-kezelés
├── recipes/
│   └── page.tsx            ← Recept-moderáció (2. fázis)
└── audit-log/
    └── page.tsx            ← Audit napló (2. fázis)
```

A [routes.ts](../src/types/routes.ts) bővítése a meglévő minta szerint:

```ts
export const ADMIN_ROUTES = {
  DASHBOARD: '/admin',
  METADATA: '/admin/metadata',
  USERS: '/admin/users',
  RECIPES: '/admin/recipes',
  AUDIT_LOG: '/admin/audit-log',
} as const satisfies Record<string, Route>;

export const isAdminRoute = (path: string): boolean =>
  path === ADMIN_ROUTES.DASHBOARD || path.startsWith('/admin/');
```

## 5. Backend terv

### 5.1 Séma-bővítések (Prisma)

```prisma
enum UserStatus {
  ACTIVE
  SUSPENDED
}

enum RecipeStatus {
  DRAFT
  PUBLISHED
  HIDDEN // moderátor által levéve
}

model User {
  // ...meglévő mezők...
  status UserStatus @default(ACTIVE)
  @@index([status])
}

model Recipe {
  // ...meglévő mezők...
  status RecipeStatus @default(PUBLISHED)
  @@index([status, createdAt]) // publikus listák szűréséhez
}

model AuditLog {
  id         String   @id @default(cuid())
  actorId    String
  action     String   // "USER_ROLE_CHANGED" | "USER_SUSPENDED" | "RECIPE_HIDDEN" | "METADATA_UPDATED" | ...
  targetType String   // "User" | "Recipe" | "Metadata"
  targetId   String
  payload    Json?    // { before, after } diff — PII-mentesen
  createdAt  DateTime @default(now())

  @@index([actorId])
  @@index([targetType, targetId])
  @@index([createdAt])
  @@map("audit_logs")
}
```

Fontos következmény (a 07-06 terv nem tért ki rá): a `RecipeStatus` bevezetésekor **minden publikus read-path**-ot (`listRecipes`, `getRecipeBySlugOrId`, sitemap, keresés, user-recipes) `status: 'PUBLISHED'` szűrésre kell állítani, a tulajdonos és az admin kivételével. Ez érinti a Redis cache-kulcsokat is (`cacheKeys`-be be kell kerülnie a nézői szerepnek, vagy a cache csak publikus listákra szorítkozik).

### 5.2 Metadata: az igazságforrás rendezése

Jelenleg két forrás él: a `Metadata` tábla (seedelt) és a [METADATA_DEFINITIONS](../src/lib/metadata/definitions.ts) statikus fájl (a `mapMetadataToJson` a resolver-utilban még ebből olvas!). Admin CRUD bevezetésekor:

1. A `getAllMetadata`/`getMetadataByType` resolverek kizárólag DB-ből olvasnak (Redis cache, TTL 1 óra, admin-mutációnál invalidáció).
2. A `mapMetadataToJson` a DB-s Metadata-rekordból építi a recept JSON-snapshotját (a definitions-fallback átmenetileg maradhat).
3. A `METADATA_DEFINITIONS` fájl szerepe: **csak** a seed inputja. Komment jelzi, hogy futásidőben tilos importálni.
4. Deaktiválás = `isActive: false` (a meglévő receptek snapshotja érintetlen).

### 5.3 GraphQL API (MVP)

```graphql
type Query {
  adminUsers(search: String, role: UserRole, status: UserStatus, after: String, limit: Int): AdminUserPage!
  adminAuditLog(after: String, limit: Int): AuditLogPage!
  # a metadata read a meglévő GET_ALL_METADATA-t használja (admin nézetben isActive=false is)
}

type Mutation {
  adminSetUserRole(userId: ID!, role: UserRole!): User!
  adminSetUserStatus(userId: ID!, status: UserStatus!): User!
  updateMetadata(id: ID!, input: MetadataUpdateInput!): Metadata!
  setMetadataActive(id: ID!, isActive: Boolean!): Metadata!
  reorderMetadata(type: MetadataType!, orderedIds: [ID!]!): [Metadata!]!
  # CREATE_METADATA / DELETE_METADATA már létezik — a DELETE soft-delete-re cserélendő
}
```

- Pagináció: a meglévő **cursor-mintával** (opaque `(createdAt,id)` cursor + `pageInfo`) — a 07-06 terv `cursor: ID` javaslata elavult, azóta van kiforrott konvenció.
- A meglévő `DELETE_ALL_USER` / `DELETE_ALL_RECIPES` / `CLEAN_USER_RECIPES` műveletek maradhatnak, de **kizárólag audit-loggal és confirmation-tokennel** (a service már kér `DELETE_ALL` megerősítést — ez jó minta).

### 5.4 Service-réteg: `AdminService` + audit-wrapper

A meglévő `UserService`/`RecipeService` object-literal mintáját követve:

```ts
// src/lib/services/AdminService.ts
import { prisma } from '@/lib/prisma/prisma';

type AuditParams = {
  actorId: string;
  action: string;
  targetType: 'User' | 'Recipe' | 'Metadata';
  targetId: string;
  payload?: Record<string, unknown>;
};

const withAudit = async <T>(params: AuditParams, fn: () => Promise<T>): Promise<T> => {
  const result = await fn();
  // az akció UTÁN írjuk, tranzakción kívül — a napló-írás hibája ne buktassa az akciót,
  // de logolódjon a monitoringba
  await prisma.auditLog
    .create({ data: { ...params, payload: params.payload ?? undefined } })
    .catch((error) => console.error('Audit log write failed', error));
  return result;
};

export const AdminService = {
  async setUserRole(actorId: string, userId: string, role: UserRole) {
    const before = await prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: { role: true },
    });
    return withAudit(
      {
        actorId,
        action: 'USER_ROLE_CHANGED',
        targetType: 'User',
        targetId: userId,
        payload: { before: before.role, after: role },
      },
      () => prisma.user.update({ where: { id: userId }, data: { role } }),
    );
  },
  // ...setUserStatus, updateMetadata, setMetadataActive, reorderMetadata
};
```

Szabály: admin nem módosíthatja/fokozhatja le **saját magát** (`actorId === targetId` → FORBIDDEN), és az utolsó ADMIN nem fokozható le.

## 6. UI/UX (Mantine + motion)

- **AdminShell**: külön `AppShell` (navbar 260 px, `Breadcrumbs` a headerben) — a publikus Shell-től független, de ugyanaz a theme. Szekciók: Metadata, Users, (Recipes, Dashboard, Audit log — 2. fázis).
- **Listák**: `Table` + `ScrollArea` + debounced `TextInput` keresés + `Select` szűrők; sor-akciók `Menu`-ben; minden destruktív akció `modals.openConfirmModal`-lal (a `ModalsProvider` már bekötött).
- **Metadata CRUD**: `Tabs` típusonként; inline szerkesztés (`TextInput` label, `NumberInput` sortOrder, `Switch` isActive); új elem `Modal`-ban; átrendezés fel/le `ActionIcon` (drag-and-drop csak ha az `@dnd-kit` a create-flow miatt amúgy is bekerül).
- **Motion-integráció** (a 07-06 tervből hiányzott; a [ux-motion-upgrade-plan-2026-08-30.md](ux-motion-upgrade-plan-2026-08-30.md) konvencióit követi):
  - táblasorok belépése: `motion.tr` + kis stagger (max 0.03s/row, 15 sor felett kikapcsolva),
  - sor-törlés/deaktiválás: `AnimatePresence` exit (height/opacity collapse),
  - stat-kártyák: `useInView`-alapú reveal (StrictMode-safe minta),
  - minden a globális `MotionConfig reducedMotion="user"` alatt — `prefers-reduced-motion` esetén automatikusan kikapcsol.
- **Üres/hiba állapotok**: minden lista kap `EmptyState`-et (ikon + magyarázat + elsődleges akció) és skeleton-t.
- **i18n**: új `admin.*` namespace mindhárom locale-ban (en-gb, hu, de).

## 7. Biztonsági szempontok

### 7.1 Rate limiting
Minden admin-mutáció a **strict limiterbe** (5 req/10 min) kerül a meglévő `rateLimit.ts` listabővítéssel; a read query-k a globális limit alatt maradnak.

### 7.2 CSRF / CSP
- A GraphQL-en át futó admin-mutációk a meglévő same-origin + persisted-allowlist + operation-gating hármassal védettek; új felület nem vezet be új CSRF-felületet (nincs form-POST endpoint).
- A nonce-alapú CSP-vel az admin UI kompatibilis, amíg csak Mantine/motion inline style-okat használ (style-attribútum, nem `<style>` tag) és nem ágyaz be inline scriptet. Chart-librarynél (ha később kell) ellenőrizendő.

### 7.3 Action confirmation + audit trail
- Destruktív akció: dupla megerősítés (confirm modal + a meglévő `DELETE_ALL` confirmation-string minta a tömeges műveletekre).
- Minden admin-mutáció auditlogolt (5.4); a napló read-only, nem törölhető GraphQL-ből.
- GDPR: user-törléskor a kaszkádok (receptek? ratingek? follow-ok?) explicit döntést igényelnek — javaslat: receptek megtartása „deleted user” anonim szerzővel VAGY teljes kaszkád; ezt a törlés-implementáció előtt kell eldönteni.

### 7.4 Session
Szerep-váltás után a cél-user `sessionVersion`-jét inkrementálni kell → a régi JWT-je azonnal érvénytelen (a mechanizmus már létezik).

## 8. Fokozatos bevezetési terv

| Fázis | Tartalom | Becslés |
|---|---|---|
| **MVP (Sprint A)** | `/admin` layout guard + AdminShell + Metadata CRUD (a meglévő Metadata modellre) + AuditLog modell/írás + operationsConfig/persisted-registry bővítés + e2e guard-teszt | L |
| **Fázis 2 (Sprint B)** | Users lista + role/status műveletek + `UserStatus` migráció + Dashboard (`adminStats` aggregátumok) + Audit log UI | L |
| **Fázis 3 (Sprint C)** | `RecipeStatus` migráció + publikus read-path szűrés + recept-moderáció UI + server-side draft (a felhasználói draft-igénnyel közös munka) | L |
| **Fázis 4** | Riportok/bejelentések — csak a komment-rendszerrel együtt | — |

**MVP definíciója**: egy ADMIN szerepű felhasználó biztonságosan tud taxonómiát karbantartani DB-ben (a statikus fájl szerkesztése + deploy helyett), és minden akciója auditált. Ez a legkisebb valós érték, ami a meglévő infrastruktúrára ráfér.

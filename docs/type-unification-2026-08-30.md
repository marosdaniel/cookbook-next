# 🧩 Cookbook-Next — Típusegységesítési terv

> **Dátum**: 2026-08-30
> **Vizsgált rétegek**: Prisma-generált típusok · GraphQL SDL + codegen · kézzel írt `src/types/*` · kliens operation-interfészek ([queries.ts](../src/lib/graphql/queries.ts)) · resolver-típusok.

## Megvalósítási státusz — 2026-09-10

Az itt leírt type-unification refaktor fő részei elkészültek. A GraphQL wire-típusok és resolver-kontraktusok most codegenből származnak, a kliens operation dokumentumai generált Apollo-kompatibilis `DocumentNode` értékeket használnak, a kézi domain-réteg pedig a UI/session kivételekre szűkült.

| Terület | Státusz | Megjegyzés |
|---|---|---|
| Resolver codegen | ✅ Elkészült | `typescript-resolvers`, generált `Resolvers`, `GraphQLContext`, Prisma parent mapping |
| Kliens operationök | ✅ Elkészült | Forrás: `src/lib/graphql/operations.graphql`; `queries.ts` és `mutations.ts` stabil exportokat ad |
| Resolver/service inputok | ✅ Elkészült | Generated mutation/query argok; a recipe normalizálás külön `NormalizedRecipeInput` |
| User domain típusok | ✅ Elkészült | A fölösleges input/arg aliasok törölve; session-típusok megmaradtak |
| Recipe UI típusok | ✅ Elkészült | Generated query outputból levezetve; `localId` UI-only kivételként megmarad |
| Prisma-import őrszabály | ✅ Elkészült | Biome tiltja a Prisma importot app/component/provider alatt, API kivétellel |
| Fókusz-validáció | ✅ Elkészült | Codegen, typecheck és migrációs fókusztesztek zöldek |
| Teljes validáció | 🟡 Részben nyitott | A teljes suite-ben 3 korábbi szerződés-eltérés maradt; `codegen:check` regenerált output miatt dirty diffet jelez |

---

## 1. Jelenlegi állapot — a négy párhuzamos típusforrás

| Forrás | Hol él | Ki használja | Állapot |
|---|---|---|---|
| **Prisma client típusok** | `@prisma/client` (generált) | Services (`UserService`, `RecipeService`), `UserRole` re-export | ✅ Helyén van |
| **Kézzel írt domain-típusok** | [src/types/user.ts](../src/types/user.ts), [src/types/recipe.ts](../src/types/recipe.ts), common.ts | Kliens-komponensek, Redux, session és UI-only view-k | ✅ Karcsúsítva; generated típusokból levezetve |
| **Kézzel írt operation-interfészek** | [queries.ts](../src/lib/graphql/queries.ts), mutations.ts | Stabil Apollo exportok | ✅ A kézi interfészek és castok eltávolítva |
| **Codegen (client preset)** | [src/lib/graphql/generated/](../src/lib/graphql/generated/) | Apollo operation fogyasztók és resolverek | ✅ Használatban, resolver codegen kiegészítéssel |

### 1.1 A központi paradoxon

Korábban a codegen infrastruktúra teljes volt, de a kliens kézi interfészekkel dolgozott. Ez a drift-vektor megszűnt: az operation dokumentumok a [src/lib/graphql/operations.graphql](../src/lib/graphql/operations.graphql) forrásból generált típusos dokumentumokat használnak, a resolverek pedig a generált `Resolvers` kontraktusra vannak kötve.

### 1.2 Konkrét duplikációk/eltérések

| Entitás | Definíciók | Eltérés |
|---|---|---|
| **User** | ① Prisma `User` (password, sessionVersion, status-mezőkkel) ② [types/user.ts](../src/types/user.ts) `User`/`BaseUser`/`SessionUser` ③ GraphQL SDL `User` ④ next-auth.d.ts session-augmentáció | A ② kézzel tükrözi a ③-at; a `password`/`sessionVersion` helyesen hiányzik belőle — de ezt semmi nem garantálja, csak konvenció |
| **Recipe** | ① Prisma `Recipe` (`category: JsonValue`) ② [types/recipe.ts](../src/types/recipe.ts) `RecipeBase`/`RecipeDetail` (`category: RecipeTaxonomyItem`) ③ SDL `Recipe` ④ queries.ts inline shape-ek | A JSON-mezők típusa a ②-ben kézzel „erősített” — a Prisma `JsonValue` → `RecipeTaxonomyItem` konverziót futásidőben semmi nem validálja |
| **Resolver args** | Generált `Mutation*Args`/`Query*Args`, `Resolvers` | A SDL-lel való egyezést a `typescript-resolvers` plugin ellenőrzi; a recipe normalizálás külön belső típust használ |

### 1.3 Ami jól van, és maradjon

- A `UserRole` **egyetlen** forrásból (Prisma) van re-exportálva — jó minta.
- A `RecipeCardDataBase`/`RecipeFormSource` **Pick-alapú levezetett** típusok — pontosan a kívánt irány.
- A `SessionUser` (email optional) tudatos, dokumentált eltérés.

## 2. Céltípus-architektúra

```
        prisma/schema.prisma                    GraphQL SDL (.graphql)
                │                                      │
        @prisma/client  ◄── services CSAK ──►  codegen (client preset + typescript-resolvers)
                │                                      │
                │                          ┌───────────┴───────────┐
                │                   generated/ (kliens op-típusok)  generated/resolvers-types.ts
                │                          │                        │
                └──── src/types/* ─────────┘                        │
                      (kis, kézi „view” réteg: Pick/Omit +          │
                       UI-only típusok — pl. RecipeIngredient       │
                       localId-vel)                                 ▼
                                                            resolverek típusai
```

Elvek:
1. **Wire-típusok** (mit ad a GraphQL): kizárólag codegen-generált.
2. **Persistence-típusok**: kizárólag Prisma, és csak a service-rétegben. A `password`/`sessionVersion` így fizikailag nem tud kliens-kódba szivárogni (a kliens-oldali import Biome-szabállyal tiltható).
3. **View/UI-típusok**: `src/types/*`-ban maradnak, de generált típusból **levezetve** (Pick/Omit/intersection), nem kézzel újraírva.

## 3. Refaktor-lépések fájl szerint

### Lépés 1 — codegen bővítés szerver-oldali pluginokkal ✅

```ts
// codegen.ts
const config: CodegenConfig = {
  schema: 'src/lib/graphql/typeDefs/**/*.graphql',
  documents: ['src/lib/graphql/queries.ts', 'src/lib/graphql/mutations.ts'],
  generates: {
    'src/lib/graphql/generated/': {
      preset: 'client',
      config: { documentMode: 'string', scalars: { DateTime: 'string' } },
    },
    // ÚJ: resolver-típusok
    'src/lib/graphql/generated/resolvers-types.ts': {
      plugins: ['typescript', 'typescript-resolvers'],
      config: {
        contextType: '@/types/graphql/context#GraphQLContext',
        scalars: { DateTime: 'string' },
        useIndexSignature: true,
      },
    },
  },
  ignoreNoDocuments: false,
};
```

(`@graphql-codegen/typescript-resolvers` devDependency — ingyenes.) A `codegen:check` CI-gate automatikusan őrzi az új outputot is.

### Lépés 2 — queries.ts / mutations.ts: kézi interfészek → generált dokumentumok ✅

Inkrementálisan, query-nként (a client preset `graphql()` fv-e a meglévő string-dokumentumokból generál típusos `TypedDocumentNode`-ot):

```ts
// ELŐTTE (queries.ts):
interface GetRecipeByIdData { getRecipeById: RecipeDetail }
interface GetRecipeByIdVariables { id: string }
export const GET_RECIPE_BY_ID: TypedDocumentNode<GetRecipeByIdData, GetRecipeByIdVariables> = gql`…`;

// UTÁNA:
import { graphql } from '@/lib/graphql/generated';

export const GET_RECIPE_BY_ID = graphql(`
  query getRecipeById($id: ID!) {
    getRecipeById(id: $id) { id title … }
  }
`);
// A Data/Variables típus a dokumentumból inferált — drift lehetetlen.
```

Fogyasztó oldalon a `useQuery(GET_RECIPE_BY_ID)` visszatérési típusa automatikusan frissül; ahol a komponens ma `RecipeDetail`-t vár, ott átmenetileg egy levezetett aliast adunk:

```ts
// src/types/recipe.ts — átmeneti kompatibilitási alias
import type { ResultOf } from '@graphql-typed-document-node/core';
import type { GET_RECIPE_BY_ID } from '@/lib/graphql/queries';

export type RecipeDetailFromQuery = NonNullable<ResultOf<typeof GET_RECIPE_BY_ID>['getRecipeById']>;
```

Javasolt sorrend (kockázat szerint növekvő): `GET_METADATA` → user-query-k → recipe-listák → `GET_RECIPE_BY_ID` → mutation-ök. A persisted-query-registry hash-ei a dokumentum-stringből képződnek — a formázás megtartásával a hash nem változik; ha mégis, a registry újragenerálandó (ugyanabban a PR-ban).

Megjegyzés: a client preset **fragment masking**-je opcionálisan kikapcsolható (`fragmentMasking: false`), ha az inkrementális migrációt egyszerűsíti — első körben javasolt kikapcsolni.

### Lépés 3 — resolverek: kézi arg-típusok → generált `Resolvers` ✅

```ts
// src/lib/graphql/resolvers/index.ts
import type { Resolvers } from '@/lib/graphql/generated/resolvers-types';

export const resolvers: Resolvers = {
  Query: { /* a mezőnevek, argok, return-shape-ek fordító-ellenőrzöttek */ },
  Mutation: { /* ... */ },
};
```

Ez elkészült: a `CreateUserArgs` és társai törölve lettek a [types/user.ts](../src/types/user.ts)-ből, a user resolver-local input fájl megszűnt. A recipe oldalon a generated GraphQL inputot a `NormalizedRecipeInput` belső, nulloktól megtisztított és sanitizálható alak követi.

### Lépés 4 — src/types/* karcsúsítás ✅

| Fájl | Teendő |
|---|---|
| [types/user.ts](../src/types/user.ts) | Marad: `SessionUser` (next-auth-hoz), `UserRole` re-export. A `User`/`BaseUser` → generált `User` típusból levezetve (`Pick`), az input/args típusok törölve (generáltak). Dokumentált szabály: *„jelszó-mező típus szinten sem létezik kliens-oldalon — a GraphQL SDL nem exponálja, a generált típus így garantálja”* |
| [types/recipe.ts](../src/types/recipe.ts) | Marad: `RecipeIngredient` (a `localId` UI-only fogalom!), `RecipeFormSource`, `RecipeCardDataBase` — de generált alapból levezetve. A `RecipeBase`/`RecipeDetail` fokozatosan a query-inferált típusokra cserélendő |
| resolver `types.ts`-ek | A user mutation alias-fájl törölve; a recipe fájl csak a normalizált belső input-határt tartja |

### Lépés 5 — őrszabályok ✅

- Biome `noRestrictedImports`: `@prisma/client` import tiltása a `src/components/**`, `src/app/**` (kivéve api/), `src/providers/**` alatt.
- CI-ban a meglévő `codegen:check` továbbra is a generált fájlok driftjét ellenőrzi. A futtatásnak a generált outputot előbb determinisztikusan frissítenie kell; a jelenlegi munkafában ez diffet jelez, ezért ezt külön CI/working-tree ellenőrzésként kell rendezni.

## 4. Ahol az eltérés SZÜKSÉGSZERŰ (dokumentált kivételek)

| Eltérés | Ok | Kezelés |
|---|---|---|
| `SessionUser.email?` vs. `User.email` | A session-payload minimalizált | Kézi típus marad, kommenttel |
| `RecipeIngredient.localId` | Kliens-oldali list-key, nem megy a szerverre | UI-típusban marad; a szerver-séma `localId`-t optional-ként tűri (már így van) |
| Prisma `JsonValue` vs. `RecipeTaxonomyItem` | A taxonómia JSON-snapshot a DB-ben | A konverzió a GraphQL-határon történik; hosszú távon a [admin-panel-plan](admin-panel-plan-2026-08-30.md) 5.2 metadata-rendezése csökkenti a bizonytalanságot |
| `DateTime` scalar `string`-ként | A wire-formátum ISO-string | codegen scalar-config (már beállítva) |

## Validációs eredmények

- `pnpm typecheck`: ✅ sikeres.
- Fókusztesztek: ✅ 4 fájl, 20 teszt sikeres.
- `pnpm lint`: ✅ 0 hiba; 2 meglévő `noExplicitAny` warning reset-password tesztekben.
- Teljes unit suite: 🟡 169 fájlból 166 sikeres, 876 tesztből 873 sikeres. A három hiba a dataloader `select` elvárásához, a saját recept értékeléséhez és a user-recipe lista projekciójához kapcsolódik.
- `pnpm codegen:check`: 🟡 a codegen fut, de a generált output változást jelez; a generált operation dokumentumok és az aktuális GraphQL forrás szinkronját külön rendezni kell.

## 5. Ütemezés és méret

| Lépés | Méret | Megjegyzés |
|---|---|---|
| 1. codegen bővítés | S | 1 fájl + 1 devDependency |
| 2. queries/mutations migráció | M | ~10 dokumentum, inkrementálisan shippelhető |
| 3. resolver-típusok | M | A `Resolvers` típus felfedi a mai lazaságokat — várhatóan tucatnyi apró típushiba-javítás |
| 4. types/* karcsúsítás | S/M | A 2–3. után mechanikus |
| 5. őrszabályok | S | Biome-konfig |

Összefüggés: a `noImplicitAny` migrációt (backlog N-P1-3) érdemes a 3. lépés UTÁN futtatni — a generált resolver-típusok sok implicit any-t maguktól megszüntetnek.

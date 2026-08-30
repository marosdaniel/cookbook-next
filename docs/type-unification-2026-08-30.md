# 🧩 Cookbook-Next — Típusegységesítési terv

> **Dátum**: 2026-08-30
> **Vizsgált rétegek**: Prisma-generált típusok · GraphQL SDL + codegen · kézzel írt `src/types/*` · kliens operation-interfészek ([queries.ts](../src/lib/graphql/queries.ts)) · resolver-típusok.

---

## 1. Jelenlegi állapot — a négy párhuzamos típusforrás

| Forrás | Hol él | Ki használja | Állapot |
|---|---|---|---|
| **Prisma client típusok** | `@prisma/client` (generált) | Services (`UserService`, `RecipeService`), `UserRole` re-export | ✅ Helyén van |
| **Kézzel írt domain-típusok** | [src/types/user.ts](../src/types/user.ts), [src/types/recipe.ts](../src/types/recipe.ts), common.ts | Kliens-komponensek, Redux, ÉS részben resolverek (`CreateUserArgs`, resolver `types.ts`) | 🟡 A tényleges „shared” réteg, de kézi szinkron |
| **Kézzel írt operation-interfészek** | [queries.ts](../src/lib/graphql/queries.ts), mutations.ts (`GetRecipesData`, `GetUserByIdVariables`… `TypedDocumentNode` cast) | Apollo hookok | ❌ Duplikáció + drift-veszély |
| **Codegen (client preset)** | [src/lib/graphql/generated/](../src/lib/graphql/generated/) (`graphql.ts`, `gql.ts`, fragment-masking) | **SENKI** — egyetlen app-fájl sem importálja | ❌ Csak a CI `codegen:check` validál vele |

### 1.1 A központi paradoxon

A codegen infrastruktúra teljes (SDL → típusok, CI-drift-check), de a kliens **kézzel írt** interfészekkel dolgozik, amiket a `TypedDocumentNode` cast „hitelesít” — a cast miatt a fordító NEM ellenőrzi, hogy a kézi interfész egyezik-e a tényleges query-vel. Példa drift-vektor: ha a `GET_RECIPES` query-be bekerül egy mező, a `GetRecipesData` interfész frissítése kézi fegyelem kérdése.

### 1.2 Konkrét duplikációk/eltérések

| Entitás | Definíciók | Eltérés |
|---|---|---|
| **User** | ① Prisma `User` (password, sessionVersion, status-mezőkkel) ② [types/user.ts](../src/types/user.ts) `User`/`BaseUser`/`SessionUser` ③ GraphQL SDL `User` ④ next-auth.d.ts session-augmentáció | A ② kézzel tükrözi a ③-at; a `password`/`sessionVersion` helyesen hiányzik belőle — de ezt semmi nem garantálja, csak konvenció |
| **Recipe** | ① Prisma `Recipe` (`category: JsonValue`) ② [types/recipe.ts](../src/types/recipe.ts) `RecipeBase`/`RecipeDetail` (`category: RecipeTaxonomyItem`) ③ SDL `Recipe` ④ queries.ts inline shape-ek | A JSON-mezők típusa a ②-ben kézzel „erősített” — a Prisma `JsonValue` → `RecipeTaxonomyItem` konverziót futásidőben semmi nem validálja |
| **Resolver args** | Kézi típusok (`CreateUserArgs` a types/user.ts-ből, resolver-local `types.ts`-ek) | A SDL-lel való egyezés kézi; `typescript-resolvers` plugin nincs bekötve |

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

### Lépés 1 — codegen bővítés szerver-oldali pluginokkal

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

### Lépés 2 — queries.ts / mutations.ts: kézi interfészek → generált dokumentumok

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

### Lépés 3 — resolverek: kézi arg-típusok → generált `Resolvers`

```ts
// src/lib/graphql/resolvers/index.ts
import type { Resolvers } from '@/lib/graphql/generated/resolvers-types';

export const resolvers: Resolvers = {
  Query: { /* a mezőnevek, argok, return-shape-ek fordító-ellenőrzöttek */ },
  Mutation: { /* ... */ },
};
```

Ezután törölhető: `CreateUserArgs` és társai a [types/user.ts](../src/types/user.ts)-ből, a resolver-local `types.ts`-ek arg-típusai. A `RecipeInputBase` helyét a generált `RecipeInput` + a [validation-unification](validation-unification-2026-08-30.md) `RecipeInputParsed`-je veszi át (a kettő strukturális egyezését egy `satisfies`-assert őrizheti).

### Lépés 4 — src/types/* karcsúsítás

| Fájl | Teendő |
|---|---|
| [types/user.ts](../src/types/user.ts) | Marad: `SessionUser` (next-auth-hoz), `UserRole` re-export. A `User`/`BaseUser` → generált `User` típusból levezetve (`Pick`), az input/args típusok törölve (generáltak). Dokumentált szabály: *„jelszó-mező típus szinten sem létezik kliens-oldalon — a GraphQL SDL nem exponálja, a generált típus így garantálja”* |
| [types/recipe.ts](../src/types/recipe.ts) | Marad: `RecipeIngredient` (a `localId` UI-only fogalom!), `RecipeFormSource`, `RecipeCardDataBase` — de generált alapból levezetve. A `RecipeBase`/`RecipeDetail` fokozatosan a query-inferált típusokra cserélendő |
| resolver `types.ts`-ek | Törlés a Lépés 3 után |

### Lépés 5 — őrszabályok

- Biome `noRestrictedImports`: `@prisma/client` import tiltása a `src/components/**`, `src/app/**` (kivéve api/), `src/providers/**` alatt.
- CI-ban a meglévő `codegen:check` már fedi a generált fájlok driftjét — nincs új gate szükséges.

## 4. Ahol az eltérés SZÜKSÉGSZERŰ (dokumentált kivételek)

| Eltérés | Ok | Kezelés |
|---|---|---|
| `SessionUser.email?` vs. `User.email` | A session-payload minimalizált | Kézi típus marad, kommenttel |
| `RecipeIngredient.localId` | Kliens-oldali list-key, nem megy a szerverre | UI-típusban marad; a szerver-séma `localId`-t optional-ként tűri (már így van) |
| Prisma `JsonValue` vs. `RecipeTaxonomyItem` | A taxonómia JSON-snapshot a DB-ben | A konverzió a GraphQL-határon történik; hosszú távon a [admin-panel-plan](admin-panel-plan-2026-08-30.md) 5.2 metadata-rendezése csökkenti a bizonytalanságot |
| `DateTime` scalar `string`-ként | A wire-formátum ISO-string | codegen scalar-config (már beállítva) |

## 5. Ütemezés és méret

| Lépés | Méret | Megjegyzés |
|---|---|---|
| 1. codegen bővítés | S | 1 fájl + 1 devDependency |
| 2. queries/mutations migráció | M | ~10 dokumentum, inkrementálisan shippelhető |
| 3. resolver-típusok | M | A `Resolvers` típus felfedi a mai lazaságokat — várhatóan tucatnyi apró típushiba-javítás |
| 4. types/* karcsúsítás | S/M | A 2–3. után mechanikus |
| 5. őrszabályok | S | Biome-konfig |

Összefüggés: a `noImplicitAny` migrációt (backlog N-P1-3) érdemes a 3. lépés UTÁN futtatni — a generált resolver-típusok sok implicit any-t maguktól megszüntetnek.

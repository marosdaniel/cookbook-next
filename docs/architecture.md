# Backend architektúra és réteghatárok

Dátum: 2026-10-29

## 1. Mappaszerkezet (`src/server/`)

```text
src/server/
├─ platform/
│  ├─ cache.ts           // Egységes cached() segéd, single-flight védelem, dátum-rehidratálás, invalidateCacheScope()
│  ├─ errors.ts          // DomainError típusok és neverthrow Result segédek
│  ├─ logger.ts          // Strukturált Pino JSON logger PII redakcióval és automatikus requestId-val
│  ├─ pagination.ts      // DEFAULT_QUERY_MAX_LIMIT és resolveQueryLimit
│  └─ requestContext.ts  // AsyncLocalStorage a kérésszintű kontextushoz (requestId, session, clientKey)
├─ modules/
│  ├─ recipe/
│  │  ├─ types.ts        // Domain DTO-k és RECIPE_LIST_SELECT projekció
│  │  ├─ mapper.ts       // Input sanitizálás, validáció, metadata feloldás
│  │  ├─ search.ts       // Keyset-paginált trigram keresés SQL építő és kurzorkódolás
│  │  └─ repository.ts   // RecipeRepository (kizárólagos Prisma hozzáférés receptekhez)
│  ├─ user/
│  │  ├─ types.ts        // Felhasználói domain típusok és üzenetkulcs-konstansok
│  │  ├─ repository.ts   // UserRepository (Prisma hozzáférés és tranzakciós admin törlések)
│  │  ├─ accountService.ts
│  │  ├─ passwordService.ts
│  │  ├─ favoritesService.ts
│  │  ├─ followService.ts
│  │  └─ index.ts
│  └─ admin/
│     ├─ types.ts
│     └─ policy.ts       // Központi assertAdminRole és assertDestructiveConfirmation
└─ graphql/
   ├─ server.ts          // Apollo Server 5 példány, GraphQL Armor és formatError
   ├─ context.ts         // GraphQLContext előállítása és biztonságos session-feloldás
   ├─ errorMapper.ts     // Domain Result -> GraphQLError / OperationResponse fordítás
   └─ plugins/
      ├─ allowlist.ts    // Persisted-query SHA-256 allowlist ellenőrzés
      ├─ rootFieldAuth.ts// Gyökérmező-alapú (AST + fragment) jogosultság-ellenőrzés
      ├─ rateLimit.ts    // Csoportonkénti rate limit a feloldott gyökérmezők alapján
      ├─ fieldAuth.ts    // Mezőszintű jogosultság (User.email, User.favoriteRecipes)
      ├─ logging.ts      // Strukturált graphql.request naplózás
      └─ index.ts
```

---

## 2. Függőségi irány és réteghatárok

A függőségi irány szigorúan egyirányú:

```text
Next.js Route (src/app/api/graphql/route.ts)
  └─> GraphQL réteg (src/server/graphql/**, src/lib/graphql/**)
        └─> Domain / Service réteg (src/server/modules/**, src/lib/services/**)
              └─> Repository réteg (src/server/modules/*/repository.ts)
                    └─> Platform / Infrastruktúra (Prisma, Redis, Pino, Nodemailer)
```

### Kikényszerített szabályok (`biome.json`)

1. **Frontend / App komponensek** (`src/app/**` az API kivételével, `src/components/**`, `src/providers/**`) nem importálhatják a `@prisma/client` csomagot.
2. **Service és domain modulok** (`src/server/modules/**/*.ts`, `src/lib/services/**/*.ts`) **nem importálhatnak** a GraphQL rétegből (`@/lib/graphql/**`, `@/server/graphql/**`).
3. A régi `src/lib/...` útvonalak visszafelé kompatibilis homlokzatként (facade / re-export) működnek a fokozatos (strangler) átállás érdekében.

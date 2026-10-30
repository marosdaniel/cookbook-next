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
│  │  ├─ deletionRepository.ts // Törlés előtti azonosítógyűjtés a cache-érvénytelenítéshez, auditált admin fióktörlés
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
   ├─ context.ts         // GraphQLContext előállítása; a session-feloldás a getSessionSafely()-re delegál
   ├─ errorMapper.ts     // Domain Result -> GraphQLError / OperationResponse fordítás
   └─ plugins/
      ├─ allowlist.ts    // Persisted-query SHA-256 allowlist ellenőrzés
      ├─ rootFieldAuth.ts// Gyökérmező-alapú (AST + fragment) jogosultság-ellenőrzés
      ├─ rateLimit.ts    // Csoportonkénti rate limit a feloldott gyökérmezők alapján
      ├─ fieldAuth.ts    // Mezőszintű jogosultság (User.email, User.favoriteRecipes)
      ├─ logging.ts      // Strukturált graphql.request naplózás
      └─ index.ts
```

A session-segéd a `src/lib/auth/safeSession.ts` fájlban van (`getSessionSafely()`), nem a `src/server/` alatt, mert az Auth.js-hez tartozik.

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

Megjegyzés: a service-ek egy része még a GraphQL-os hibakezelést (`throwCustomError`, `ErrorTypes`) használja; csak a kedvencek és a követés műveletek adnak `Result` típust.

---

## 3. Session-kezelés

- A `jwt` callback (`src/lib/auth/auth.ts`) a felhasználó `sessionVersion` értékét Redisből olvassa (`session:v:{userId}`, 60 másodperc TTL), hiány esetén az adatbázisból. Jelszóváltáskor, jelszó-visszaállításkor és fióktörléskor a kulcs azonnal törlődik, így a régi tokenek érvénytelenné válnak (Redis-hiba esetén legfeljebb 60 másodperc késéssel).
- A `session` callback visszavont tokennél hibával (`Session has been revoked`) tér vissza. Ezért szerveroldalon **ne hívd közvetlenül az `auth()`-ot**: használd a `getSessionSafely()` segédet (`src/lib/auth/safeSession.ts`).
- A `getSessionSafely()` sosem dob kivételt: a visszavont session névtelen kérésként kezelődik (debug szintű napló), minden más hiba (például adatbázis-kiesés) `warn` szinten naplózódik, és szintén névtelen kérés lesz belőle.
- Használja: az `/admin` layout (visszavont session esetén belépésre irányít) és a GraphQL-kontextus (`resolveSessionSafely`).

---

## 4. Biztonsági modell röviden

| Réteg                | Megoldás                                     | Megjegyzés                                                                                                                                                                                                |
| -------------------- | -------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Dokumentum-allowlist | `allowlist.ts` + `persistedQueryRegistry.ts` | Alapból csak productionben kényszerít (`GRAPHQL_ALLOWLIST_ENFORCE`). A `persistedQueryRegistry.coverage.test.ts` teszt minden generált kliens-dokumentumot ellenőriz.                                     |
| Jogosultság          | `rootFieldAuth.ts`, `ROOT_FIELD_POLICY`      | A kért gyökérmezők alapján dönt (fragmenseket is feloldva), ismeretlen mező = `ADMIN` (fail-closed). Teszt ellenőrzi, hogy a séma minden Query/Mutation mezőjéhez van szabály.                            |
| Rate limit (HTTP)    | `route.ts`                                   | Parse előtti globális IP-limit: 100 kérés / 60 másodperc.                                                                                                                                                 |
| Rate limit (művelet) | `rateLimit.ts` plugin                        | `auth-sensitive` 5/10 perc IP-nként, `password-change` 5/10 perc, `content-write` 30/10 perc, `rating` 60/10 perc, `admin` 60/10 perc felhasználónként; `resetPassword` emailenként (SHA-256 hash) 3/óra. |
| Belépés              | `authorize` (`auth.ts`)                      | Email (hash) szerint 5 próba / 15 perc, IP szerint 20 próba / 15 perc; egységes hibaüzenet.                                                                                                               |
| Mezőszint            | `fieldAuth.ts`                               | `User.email`, `User.favoriteRecipes`: csak saját vagy admin.                                                                                                                                              |
| Audit                | `AuditLog`                                   | Admin műveletek, a tömeges és fióktörlések ugyanabban a tranzakcióban íródnak, mint a törlés.                                                                                                             |

### Ismert korlátok

- **Memóriabeli tartalék limiter**: ha a Redis nem érhető el vagy a `RATE_LIMIT_TIMEOUT_MS` (alapértelmezés 750 ms) lejár, példányonkénti csúszóablak lép életbe. Serverless környezetben minden példánynak saját számlálója van, ezért az effektív limit több példány esetén többszöröződik; ez gyengébb védelem, mint a Redis-alapú.
- **Belépési limit**: jelenleg minden próbálkozást számol, és email-alapú, ezért egy idegen kitalálható cím 15 percre kizárhatja a jogos felhasználót. Nyitott tétel: csak a sikertelen próbák számítsanak, és a kulcs email+IP legyen (lásd `docs/backend-review-followups-2026-10-29.md`).
- **Allowlist fejlesztésben**: fejlesztői módban alapból ki van kapcsolva, ezért productionhoz hasonló buildre is érdemes lefuttatni az E2E teszteket.

---

## 5. Törlés és cache-érvénytelenítés

- `deleteUser`: saját fiók törlésekor `UserRepository.deleteById`; ha admin más fiókját törli, `DeletionRepository.deleteByIdWithAudit` (törlés és `USER_DELETED` audit-bejegyzés egy tranzakcióban, a payload csak a törölt receptek számát tartalmazza).
- `deleteAllUser` és `deleteAllRecipes`: az érintett recept-, slug-, szerző- és felhasználó-azonosítókat a törlés **előtt** gyűjti be (legfeljebb `DELETION_INVALIDATION_LIMIT` = 5000), a törlés (`USERS_DELETED_ALL` / `RECIPES_DELETED_ALL` audit-bejegyzéssel, egy tranzakcióban) után pedig az `invalidateCacheScope` törli a recept-, felhasználói lista- és session-kulcsokat.
- A fióktörlés szabályzata (cascade, anonimizálás, soft delete) a `docs/user-deletion-policy.md` fájlban van; a döntés még nyitott.
- Részletek: `docs/cache-policy.md`.

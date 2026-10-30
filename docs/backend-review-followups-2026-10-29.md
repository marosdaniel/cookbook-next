# Backend utóellenőrzés: állapot és maradék teendők

Dátum: 2026-10-29. Az alapja a mai (2026-10-29) backend-commitok átnézése.

## 1. Elvégzett javítások

| Tétel                                                | Megoldás                                                                                                                                                                                                                           | Hol    |
| ---------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| Cache-kulcsok (kedvencek, követések, saját receptek) | Felhasználónként egyetlen kanonikus kulcs a maximális oldalmérettel, a `limit` olvasáskor szeletel; a korlátlan lista le van fedve a maximummal                                                                                    | PR #42 |
| Tömeges törlés audit                                 | A `deleteAll*` repository-metódusok kizárólag `$transaction`-ben futnak, a naplóírás kötelező, tranzakció nélküli visszaesés nincs                                                                                                 | PR #42 |
| Session-feloldás                                     | `getSessionSafely()` (`src/lib/auth/safeSession.ts`): sosem dob, a visszavont session névtelen, a váratlan hiba naplózódik; az admin layout és a GraphQL-kontextus használja                                                       | PR #43 |
| Törlések mellékhatásai                               | Az érintett azonosítók begyűjtése a törlés előtt, utána recept-, szerző-, felhasználói lista- és session-kulcsok érvénytelenítése; admin által más fiókjának törlése `USER_DELETED` audit-bejegyzést ír ugyanabban a tranzakcióban | PR #43 |
| Fióktörlési szabályzat                               | `docs/user-deletion-policy.md`: a jelenlegi Cascade viselkedés és a döntési lehetőségek (**a döntés nyitott**)                                                                                                                     | PR #43 |
| Allowlist-regiszter védőháló                         | `persistedQueryRegistry.coverage.test.ts`: minden generált kliens-dokumentum szerepel-e a regiszterben                                                                                                                             | PR #43 |

## 2. Nyitott tételek

### FX-3. Belépési limit: csak a sikertelen próbák számítanak

- **Probléma**: `checkLoginRateLimit` (`src/lib/rateLimit/rateLimit.ts`) minden próbálkozást számol, és email-alapú, ezért egy idegen cím 15 percre kizárhatja a jogos felhasználót.
- **Megoldás**: a fiókszintű kulcs email+IP; belépés előtt csak ellenőrizd a hátralévő keretet, sikertelen jelszónál fogyassz, sikeres belépésnél nullázd a számlálót; az IP-szintű limit (20 sikertelen / 15 perc) maradjon, plusz magas, védőháló jellegű email-korlát (pl. 30 sikertelen / óra).
- **ELLENŐRIZD ELŐSZÖR**: a telepített `@upstash/ratelimit` verzióban elérhető-e fogyasztás nélküli lekérdezés (`getRemaining`) és számláló-visszaállítás (`resetUsedTokens`); ha nem, saját számláló kell. A memóriabeli tartalék limiter ugyanezt a modellt kövesse.
- **Elfogadás**: teszt a 6. sikertelen próbára, a másik IP-ről érkező próba nem fogyasztja a fiókszintű limitet, sikeres belépés után a számláló nullázódik, az egységes hibaüzenet megmarad.

### FX-7. Lusta hozzávaló- és lépésbetöltés

- **Probléma**: a DataLoaderek (`userRecipes`, `userFavoriteRecipes`) és a kedvencek/követések `RECIPE_LIST_SELECT`-et használnak (hozzávalók és lépések nélkül), de `as RecipeResolverParent[]` kasztolással; egy jövőbeli, hozzávalót kérő lekérdezés hibát adna.
- **Megoldás**: két DataLoader (`recipeIngredients`, `recipePreparationSteps`, recept-azonosító szerint kötegelve); a `Recipe.ingredients` és `Recipe.preparationSteps` resolver a szülőből olvas, ha ott van, különben a loaderből; a kasztok helyett pontos típusok.
- **Elfogadás**: egy `getFavoriteRecipes` lekérdezés `ingredients` mezővel hibátlan; a `getRecipeById` nem tölt kétszer.

### FX-8. Kód-higiénia

- Tesztbarát hackek eltávolítása a `rateLimit.ts`-ből (`'rawRedisClient' in redisModule`, `'withTimeout' in redisModule`): közvetlen import, a tesztek `vi.mock`-kal adják meg mindkét exportot (a plugin- és route-tesztek mockjait is frissíteni kell).
- `LOG_LEVEL` az `src/env.ts`-be (opcionális enum), a logger onnan olvassa.
- A dátum-visszaállítás mezőnév-listája (`cache.ts`): ha a telepített Prisma-ban elérhető a modell-metaadat (pl. `Prisma.dmmf`), onnan származzon; különben teszt, amely a gyorsítótárazott típusok `Date` mezőit összeveti a listával.
- Az `src/lib/graphql/plugins/*` újraexportáló maradványok megszüntetése (az importok és a mellettük lévő tesztek áthelyezése `@/server/graphql/plugins/*`-ra), `pnpm knip` ellenőrzéssel.

### FX-9. A hibakezelés befejezése (opcionális, nagyobb munka)

- A `PasswordService`, `AccountService`, `RecipeService` térjen át `Result<T, DomainError>`-ra, a resolverek az `errorMapper.ts` `toGraphQLError`-ral fordítsanak; a kliens által látott kódok, üzenetkulcsok és állapotkódok változatlanok.
- A `createUser` ne GraphQL-formájú payloadot adjon; a Biome `noRestrictedImports` szabály tiltsa a `throwCustomError`/`errorCatalog` importját a service-ekben.

### FX-10 (maradék). Allowlist E2E

- Playwright E2E production buildre (`pnpm build && pnpm start`, `GRAPHQL_ALLOWLIST_ENFORCE=true`), az eredmény rögzítése; a `PERSISTED_QUERY_NOT_ALLOWED` kód barátságos kezelése a kliensen.

### FX-11. OpenTelemetry (JÓVÁHAGYÁS KELL)

- `@vercel/otel`, `src/instrumentation.ts` `registerOTel` hívással (ELLENŐRIZD a Next.js dokumentációban a fájl helyét `src` mappa esetén), saját span a GraphQL műveletekhez; a CSP nem gyengülhet.

### Döntés: fióktörlés szabályzata

- A `docs/user-deletion-policy.md` döntési lapja (Cascade megtartása, anonimizálás vagy soft delete). Cascade megtartása esetén: a fióktörlés megerősítő szövege és az adatvédelmi tájékoztató mondja ki, hogy a receptek is törlődnek.

## 3. Munkamenet

Minden tétel külön ágon és pull requesttel menjen, zöld CI mellett (`pnpm lint`, `typecheck`, `test:unit`, `codegen:check`, `build`, `knip`). Termelési kódot ne írj át a tesztelhetőség kedvéért; a tesztet igazítsd a kódhoz.

# Cookbook-Next: admin funkcionalitás bővítése és admin design-frissítés (LLM agentnek)

Dátum: 2026-10-29. Alapállapot: `package.json` 3.13.0, Next.js 16.4.x, React 19.3, Mantine 9.7.x, `motion` 14.x, `next-intl` (en-gb, hu, de), Apollo (kliens és szerver), Prisma 7 + Neon, Upstash Redis.

A dokumentum az admin felület jelenlegi állapotának átnézéséből, a `docs/admin-panel-plan-2026-08-30.md` tervből és a backend modernizálási tervből (`docs/cookbook-backend-modernization-agent-plan.md`) készült. Lépésenként kiadható feladatokat tartalmaz egy AI agentnek.

---

## 0. Hogyan használd

1. Add oda az agentnek az **1. szakasz (szabályok)** blokkját rendszerutasításként, majd egyetlen lépést egyszerre (5. szakasz).
2. **Sorrend**: a backend terv A1-A3 lépései (allowlist, gyökérmező-alapú jogosultság, rate limit csoportok) az admin műveletek előfeltételei. Az admin műveleteket a gyökérmező-alapú jogosultsági térképbe és a rate limit "admin" csoportba kell regisztrálni, ezért azokat érdemes előbb elkészíteni. Ha nem készülnek el, az AD-4 és az AD-7 lépések a jelenlegi `operationsConfig.ts` mintát követik, és egy későbbi lépés migrálja őket.
3. Ahol "ELLENŐRIZD ELŐSZÖR" szerepel, az állítás nincs teljesen bizonyítva. Ahol "EMBERI DÖNTÉS" szerepel, az agent álljon meg és kérdezzen. Ahol "JÓVÁHAGYÁS KELL" szerepel, új csomag bevezetéséhez kell engedély.

---

## 1. Szabályok az agentnek (minden lépésre érvényes)

```text
Projekt: cookbook-next (Next.js App Router, TypeScript, pnpm, Mantine 9, motion, next-intl, Apollo, Prisma 7 + Neon).

Általános szabályok:
- Csak pnpm-et használj. Új csomagot csak akkor telepíts, ha a lépés megnevezi és a tulajdonos jóváhagyta.
- Generált fájlokat (src/lib/graphql/generated/**, Prisma kliens) ne szerkessz kézzel. GraphQL séma vagy operáció módosítása után: pnpm codegen.
- Kód, kommentek, commit-üzenetek angolul; a dokumentáció (docs/) magyarul. Felhasználói szövegek kizárólag next-intl kulcsokon át, mindhárom locale-ban (en-gb, hu, de).
- Commit: Conventional Commits. A CHANGELOG.md-t ne szerkeszd kézzel.
- Egy lépés = egy PR-méretű commit (vagy kis commitsorozat).
- Admin UI konvenciók: Mantine komponensek, a téma színeit és a CSS-változókat használd (var(--mantine-color-*)); színt, árnyékot, háttért NE égess be hex értékkel és NE használj fix c="gray.8" / c="pink.7" jellegű, csak az egyik témában olvasható értéket. Minden új felület legyen olvasható világos ÉS sötét módban.
- Mozgás: a meglévő MOTION_TRANSITION konstansokat (src/lib/motion/transitions) és a motion csomagot használd; a prefers-reduced-motion beállítást tiszteld; táblasoroknál 15 sor felett nincs lépcsőzés.
- Route-ok: typed routes konvenció (src/types/routes.ts ADMIN_ROUTES), a jogosultság a layout guardban és a GraphQL rétegben is érvényesül.
- Minden új GraphQL műveletet vegyél fel: operationsConfig.ts (adminOperations), a gyökérmező-jogosultsági térképbe (ha a backend terv A2 lépése kész), a persisted query regiszterbe (persistedQueryRegistry.ts), és a rate limit "admin" csoportba.
- Minden admin mutáció auditált: AuditLog bejegyzés (actorId, action, targetType, targetId, PII-mentes before/after payload); destruktív műveleteknél a naplóírás ugyanabban a tranzakcióban történjen.
- Admin önvédelem: admin nem módosíthatja, nem fokozhatja le és nem törölheti saját magát; az utolsó ADMIN nem fokozható le és nem törölhető.
- data-testid: kövesd a meglévő mintát (pl. admin-metadata-row-<id>); minden új interaktív elem kapjon.
- Tesztek: minden új komponenshez és service-metódushoz Vitest teszt; a coverage küszöbök (lines 23, statements 23, functions 19, branches 17) nem csökkenhetnek.
- Minden lépés végén: pnpm lint, pnpm typecheck, pnpm test:unit, pnpm codegen:check, pnpm build mind hibamentes.
- Mielőtt Mantine, Next.js, Apollo vagy Prisma API-t használsz, ellenőrizd a telepített verzió dokumentációját; a terv kódrészletei vázlatok.
- Ha egy feltevés nem igaz a kódban, állj meg és írd le, mit találtál.
```

---

## 2. Az admin felület jelenlegi állapota

**Elkészült** (az átnézés alapján)
- `/admin` védett layout (`layout.tsx`): bejelentkezés és `ADMIN` szerep ellenőrzés, `robots: noindex`, E2E route-guard teszt.
- `AdminShell`: Mantine `AppShell`, 260 px navbar, fejléc breadcrumb-bal, `ThemeSwitcher` (világos/sötét) és `LanguageSelector`.
- Metadata-kezelő (`/admin/metadata`): típusonkénti `Tabs` darabszám-jelvénnyel, `Table` (sorrend, címke, fordítási kulcs, aktív kapcsoló, szerkesztés), létrehozó/szerkesztő `Modal`, betöltési skeleton, üres állapot (`EmptyState`), `motion` sor-belépés (lépcsőzés 15 sorig).
- Szerveroldal: `AdminService` (lista, létrehozás, szerkesztés, aktiválás/deaktiválás, átrendezés `$transaction`-nel), `AuditLog` írás, `P2002` kezelés.
- Téma: a világos és sötét Mantine-téma be van kötve (`mantine.tsx`), márka: pink (`primaryShade` világos: 7, sötét: 5), másodlagos violet, teal, meadow, orange, red, meleg szürke; a sötét téma kontraszt-szabályai dokumentáltak (`darkTheme.ts`).

**Megállapítások**

| ID   | Terület         | Megállapítás                                                                                                                                                                                                                        | Fájlok                                                                             |
| ---- | --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| AF1  | Navigáció       | Egyetlen szekció van; a navbar egy linket, a breadcrumb csak a metadata szekciót ismeri; az `/admin` átirányít (nincs áttekintő oldal)                                                                                              | `AdminShell.tsx`, `admin/page.tsx`                                                 |
| AF2  | Rate limit      | Az admin metadata mutációk a közös szigorú limiterben vannak (5 kérés / 10 perc, minden szigorú művelettel közös vödör). A sorrendezés nyílgombonként egy mutáció, így néhány kattintás után 429-et kapsz                           | `src/lib/rateLimit/rateLimit.ts` (`ADMIN_METADATA_MUTATIONS`), `MetadataTable.tsx` |
| AF3  | Hibakezelés     | A kapcsoló (`setMetadataActive`) és az átrendezés (`reorderMetadata`) hívásai nem kapnak `try/catch`-et és értesítést; a hiba (pl. 429) látszólag csendben elnyelődik (ELLENŐRIZD ELŐSZÖR az Apollo `errorPolicy` beállításával)    | `MetadataAdminClient.tsx`                                                          |
| AF4  | Használhatóság  | Sorrendezés csak fel/le nyilakkal, minden kattintás külön mutáció és újralekérés; az összes sor letiltódik mutáció közben                                                                                                           | `MetadataAdminClient.tsx`, `MetadataTable.tsx`                                     |
| AF5  | Hatásvizsgálat  | Deaktiváláskor nem látszik, hány recept használja az elemet                                                                                                                                                                         | —                                                                                  |
| AF6  | Fordítások      | A metadata csak már létező fordítási kulcsot kaphat (`assertKnownTranslationKey` a locale-fájlokból), így új kategória felvételéhez deploy kell a fordításhoz; ez részben kiüti az admin cél (deploy nélküli karbantartás) értelmét | `AdminService.ts`, `src/lib/metadata/translationKeys`                              |
| AF7  | Audit           | Az audit-írás megvan, de nincs megtekintő felület; a `deleteAllUser`/`deleteAllRecipes` műveletek nem írnak `AuditLog`-ot (csak `console.warn`)                                                                                     | `UserService.ts`, `AdminService.ts`                                                |
| AF8  | Funkció         | A terv 2. fázisa nincs kész: felhasználó-kezelés, recept-moderáció, dashboard, audit UI, `UserStatus`/`RecipeStatus`                                                                                                                | `docs/admin-panel-plan-2026-08-30.md`                                              |
| AF9  | Teljesítmény    | A `MetadataService.getTranslationKeyLookup()` minden recept-mentéskor lekérdezi az egész `metadata` táblát, gyorsítótár nélkül                                                                                                      | `MetadataService.ts`                                                               |
| AF10 | Design          | Az admin vizuálisan megegyezik a publikus oldallal (nincs "admin mód" jelzés), a szerkesztés ikon fixen `color="pink"`, nincs sűrűség-választó, kötegelt művelet, szűrősáv vagy gyorsparancs                                        | `MetadataTable.tsx`, `AdminShell.tsx`                                              |
| AF11 | Hozzáférhetőség | A táblázatbeli `Switch` csak `aria-label`-lel rendelkezik (a szöveg nem látható), a sorrendezés billentyűzettel csak nyilakkal lehetséges                                                                                           | `MetadataTable.tsx`                                                                |
| AF12 | Jogosultság     | Az admin GraphQL műveletek jogosultsága a művelet nevén alapul (lásd backend terv F1/A2), ezért a szerveroldali admin-védelem jelenleg nem mélységi                                                                                 | `operationsConfig.ts`, `route.ts`                                                  |

Hatókörön kívül: a komment- és bejelentés-rendszer (a terv 4. fázisa), a publikus oldal arculata, GraphQL szerver csere.

---

## 3. Design-koncepció: "Admin Console"

**Cél**: az admin legyen azonnal felismerhetően más környezet, mint a publikus oldal, de ugyanazt a márkát (pink + violet) használja. Átlátható, sűrű, de levegős; gyors, billentyűzettel is használható; látványos, de nem zavaró mozgással; világos és sötét módban egyformán jó.

### 3.1 Tervezési elvek

1. **Világos módtudat**: az admin módot állandó vizuális jelzés mutatja (3 px-es márkagradiens sáv a fejléc tetején és egy "ADMIN" jelvény), hogy a publikus oldallal ne lehessen összetéveszteni.
2. **Téma-biztos színek**: kizárólag Mantine CSS-változók és a téma tokenjei. A `Text` és `Title` alapértelmezett színe témánként más (világos: `gray.8`, sötét: `gray.2`), ezért ne adj meg fix `c` értéket, kivéve `dimmed`.
3. **Információsűrűség választható**: a táblákon kényelmes (comfortable) és kompakt (compact) nézet kapcsoló, a választás `localStorage`-ben marad.
4. **Visszavonható helyett visszavonás**: a visszafordítható műveleteknél (deaktiválás, elrejtés) nem kérdezünk meg, hanem 6 másodperces "Visszavonás" értesítést adunk. Visszafordíthatatlan műveletnél (törlés) begépelős megerősítés.
5. **Az állapot az URL-ben**: szűrők, keresés, rendezés és aktív fül a keresési paraméterekben (`?q=&role=&status=`), így megosztható és a böngésző vissza gombja működik.
6. **Kevesebb kattintás**: gyorsparancs-paletta (Ctrl + K), kötegelt műveletek, sorhoz kötött gyorsműveletek.

### 3.2 Elemek

| Elem                 | Megoldás                                                                                                                                                                                                                                                                                          |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Fejléc               | Admin-sáv (3 px, `defaultGradient` pink -> violet), "ADMIN" `Badge`, keresés/gyorsparancs gomb (Ctrl + K), `ThemeSwitcher`, `LanguageSelector`, vissza a webhelyre                                                                                                                                |
| Navbar               | Csoportosított szekciók: Áttekintés (Dashboard), Tartalom (Receptek, Metadata), Emberek (Felhasználók), Rendszer (Naplók, Eszközök). Az aktív elem mögött egy `motion` `layoutId` kapszula "csúszik". Asztali gépen ikon-sínre (72 px) összecsukható, a választás megmarad. Mobilon fiók (drawer) |
| Oldalfej             | Közös `AdminPageHeader`: cím, leírás, breadcrumb, elsődleges művelet, opcionális fülek                                                                                                                                                                                                            |
| Statisztika-kártya   | `StatCard`: érték (animált számfelfutás), trend-`Badge` (zöld/piros), `Sparkline` (Mantine Charts)                                                                                                                                                                                                |
| Táblák               | Ragadós fejléc, sűrűség-kapcsoló, sor-hover műveletek, jelölőnégyzetes kijelölés, kötegelt műveleti sáv alulról becsúszva (`AnimatePresence`), rendezhető oszlopok, szűrők `Pill` címkékként                                                                                                      |
| Állapotjelvények     | Szerep: ADMIN (márka-gradiens), BLOGGER (violet), USER (szürke). Állapot: ACTIVE (teal), SUSPENDED (orange), HIDDEN (red), DRAFT (szürke), PUBLISHED (teal)                                                                                                                                       |
| Üres/hiba/betöltés   | Minden listának illeszkedő skeleton, `EmptyState` (már létezik) és hibaállapot "Újrapróbálás" gombbal                                                                                                                                                                                             |
| Értesítés            | A meglévő `showSuccessNotification`/`showErrorNotification` segédek, plusz egy visszavonás-értesítő segéd                                                                                                                                                                                         |
| Gyorsparancs-paletta | `@mantine/spotlight` (már függőség): navigáció, gyors műveletek ("Új metadata", "Téma váltása"), felhasználók és receptek keresése                                                                                                                                                                |

### 3.3 Világos és sötét téma specifikáció

A témák palettája a `lightTheme.ts` és `darkTheme.ts` fájlokban van; ne hozz létre új palettát, használd a meglévőket.

| Token (szerep)    | Világos                 | Sötét                             | Megvalósítás                                                         |
| ----------------- | ----------------------- | --------------------------------- | -------------------------------------------------------------------- |
| Háttér            | Mantine body            | Mantine body (`dark.7`: #26262B)  | `var(--mantine-color-body)`                                          |
| Kártya/felület    | fehér                   | `dark.6` (#2E2E33)                | `var(--mantine-color-default)` vagy `Paper`/`Card` alapértelmezés    |
| Keret             | `gray.2`                | `dark.4` (#5F5F66)                | `var(--mantine-color-default-border)`                                |
| Elsődleges szöveg | `gray.8`                | `gray.2`                          | téma alapértelmezett `c` (ne írd felül)                              |
| Másodlagos szöveg | `dimmed`                | `dimmed` (≥ `gray.4`)             | `c="dimmed"`                                                         |
| Márka             | `pink.7`                | `pink.5`                          | `var(--mantine-primary-color-filled)`                                |
| Admin-sáv         | pink -> violet gradiens | ugyanaz                           | `var(--mantine-color-pink-filled)` -> violet; vagy `defaultGradient` |
| Diagramszínek     | pink, violet, teal      | ugyanaz (a `primaryShade` kezeli) | téma színnevek (`pink.6`), nem hex                                   |
| Árnyék            | `shadows.sm/md`         | sötét témában erősebb             | `shadow="sm"` prop, ne saját `box-shadow`                            |

Szabályok: a szöveg-háttér kontraszt legalább 4,5:1, a UI-elemek (keret, ikon, fókuszgyűrű) legalább 3:1 mindkét témában; semmi nem függhet kizárólag a színtől (állapotjelvény szöveggel is); a fókuszgyűrű látható; a sötét témában ne használj tiszta fehér (#fff) szöveget nagy felületen.

### 3.4 Mozgás-specifikáció

| Hol                   | Mi                                                                                          | Idő                      |
| --------------------- | ------------------------------------------------------------------------------------------- | ------------------------ |
| Navbar aktív elem     | `layoutId` kapszula csúszás                                                                 | `MOTION_TRANSITION.fast` |
| Oldalváltás           | Halvány belépés a meglévő `template.tsx` mintával                                           | `MOTION_TRANSITION.fast` |
| Statisztika-számok    | Számfelfutás belépéskor (`useInView`, egyszer)                                              | ~800 ms                  |
| Táblasorok            | Lépcsőzött belépés (max 15 sor), törlésnél `AnimatePresence` kilépés (magasság/átlátszóság) | meglévő                  |
| Átrendezés            | `layout` animáció a sorrendezett listán                                                     | rugós, rövid             |
| Kötegelt sáv          | Alulról becsúszás, kijelölés megszűnésekor kicsúszás                                        | `fast`                   |
| Visszavonás-értesítés | Mantine értesítés, 6 s időzítő                                                              | —                        |

Mindenhol a globális `MotionConfig reducedMotion="user"` érvényes; csökkentett mozgásnál a mozgás kikapcsol, az állapotváltozás azonnali.

---

## 4. Funkcionális bővítési ütemterv

| Fázis | Tartalom                                                                                                                     | Előfeltétel                               |
| ----- | ---------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------- |
| 1     | Metadata-admin csiszolás: rate limit csoport, hibakezelés, drag-and-drop sorrend, használati darabszám, hatás-figyelmeztetés | Backend terv A3 (vagy átmeneti)           |
| 2     | Felhasználók: lista, keresés, szűrők, részletező fiók, szerepváltás, felfüggesztés, kényszerített kijelentkeztetés, törlés   | `UserStatus` migráció, A8 döntés          |
| 3     | Recept-moderáció: lista, szűrők, elrejtés/megjelenítés, előnézet, kötegelt műveletek                                         | `RecipeStatus` migráció                   |
| 4     | Audit napló nézet: szűrők, különbség-megjelenítő, export                                                                     | AuditLog bővítés                          |
| 5     | Dashboard: statisztikák, trendek, aktivitás, rendszer-állapot                                                                | Aggregált lekérdezések, `@mantine/charts` |
| 6     | Rendszer-eszközök: cache-kezelés, karbantartási banner, metadata export/import                                               | —                                         |
| 7     | Biztonsági megerősítés: admin-munkamenet, újrahitelesítés, opcionális 2FA                                                    | —                                         |

---

## 5. Lépések

### AD-0. Felderítés és alapállapot

**Feladat**: olvasd el az `src/app/admin/**`, `src/components/ThemeSwitcher`, `src/components/EmptyState`, `src/lib/motion/transitions`, `src/app/template.tsx`, `src/providers/mantine/*`, `src/lib/auth/routePolicies.ts`, `src/types/routes.ts` fájlokat és a `docs/admin-panel-plan-2026-08-30.md` dokumentumot. Futtasd az alapellenőrzéseket (lint, typecheck, test:unit, codegen:check, build). Írj rövid jegyzetet (nem commitolandó): melyek a használt komponensek, tesztazonosítók, i18n névterek (`admin.*`), és hogyan néznek ki a CSS modulok (hogyan oldják meg a világos/sötét témát).

**Kész, ha**: az alapellenőrzések zöldek, és a jegyzet tartalmazza a meglévő konvenciókat. Commit nincs.

---

### AD-1. Admin design-primitívek

**Cél (AF10)**: közös, téma-biztos építőelemek.

**Feladat**
1. Hozz létre egy `src/components/admin/` mappát az alábbi komponensekkel (mind kliens vagy szerver, ahol értelmes, `data-testid`-del és Vitest teszttel):
   - `AdminPageHeader` (cím, leírás, elsődleges művelet, opcionális `Breadcrumbs` és fülek),
   - `AdminCard` (felület: Mantine `Paper` alapértelmezéssel, kerettel; ne égess be színt),
   - `StatCard` (érték, címke, trend, opcionális `Sparkline`; az érték animált számfelfutással `useInView`-val),
   - `StatusBadge` és `RoleBadge` (a 3.2 szerinti színek, mindig szöveggel),
   - `DataToolbar` (keresőmező debounce-szal, szűrők, aktív szűrők `Pill`-ként, "szűrők törlése"),
   - `BulkActionBar` (alulról becsúszó sáv `AnimatePresence`-szel, kijelölt darabszám, műveletek),
   - `ConfirmDialog` (begépelős megerősítés destruktív műveletekhez, a Mantine `modals` használatával),
   - `showUndoNotification` segéd (6 másodperces "Visszavonás" gombbal).
2. Hozz létre egy `admin.module.css` fájlt csak Mantine CSS-változókkal (`var(--mantine-color-*)`), világos/sötét hardcode nélkül. Kövesd a projekt meglévő CSS modul mintáját a témakezelésre.
3. A meglévő komponensekben cseréld a fix `color="pink"` ikonszínt a téma primary színére.

**Elfogadási feltételek**
- Minden komponens olvasható mindkét témában (kézi ellenőrzés, képernyőképekkel a PR leírásában).
- Nincs hex szín és nincs fix `c="gray.x"` az új fájlokban.
- A komponensekhez Vitest tesztek.

**Commit**: `feat(admin): add theme-safe admin design primitives`

---

### AD-2. AdminShell újratervezése

**Cél (AF1, AF10, AF11)**

**Feladat**
1. Az `ADMIN_ROUTES` és egy új `ADMIN_NAV` konfiguráció (csoportok, ikonok, útvonalak, i18n kulcsok) legyen az egyetlen forrás a navbarhoz és a breadcrumbhoz. A breadcrumb a konfigurációból épüljön fel, ne `startsWith` ellenőrzésekből.
2. Navbar: csoportosított szekciók (Áttekintés, Tartalom, Emberek, Rendszer), szekciófejlécek, aktív elem `layoutId` kapszulával (`motion`), ikonok (`@tabler/icons-react`).
3. Asztali gépen összecsukható ikon-sín (72 px) tooltip-pel; a választás `localStorage`-ben marad; mobilon fiók (a meglévő viselkedés).
4. Fejléc: admin-sáv (3 px-es gradiens a fejléc tetején), "ADMIN" `Badge`, a Ctrl + K gyorsparancs gomb helye (az AD-3 köti be), meglévő `ThemeSwitcher`, `LanguageSelector`, "Vissza a webhelyre".
5. Az `/admin` útvonal továbbra is a metadata oldalra irányít, amíg az AD-11 (dashboard) el nem készül.
6. Tartsd meg a meglévő `data-testid` azonosítókat, és frissítsd az `AdminShell.test.tsx` tesztet.

**Elfogadási feltételek**: a navbar és a breadcrumb egy konfigurációból épül; az összecsukás és mobil fiók működik; mindkét témában jól néz ki; csökkentett mozgásnál nincs csúszás; a meglévő E2E route-guard teszt zöld.

**Commit**: `feat(admin): redesign admin shell with grouped navigation`

---

### AD-3. Gyorsparancs-paletta

**Feladat**
1. Építs egy admin gyorsparancs-palettát a `@mantine/spotlight` csomaggal (már függőség; nézd meg, használja-e már a projekt máshol, és kövesd azt a mintát): navigációs parancsok (az `ADMIN_NAV`-ból), gyors műveletek ("Új metadata", "Téma váltása"), és a későbbi lépésekhez kapcsolódó kereső-bővítési pont (felhasználók, receptek).
2. Gyorsbillentyű: Ctrl + K (Mac: Cmd + K); a fejlécben látható gomb is megnyitja.
3. Minden felirat i18n kulcsból.

**Elfogadási feltételek**: a paletta billentyűzettel és egérrel is használható, mindkét témában olvasható, a fókusz visszakerül a megnyitás előtti elemre; Vitest teszt a parancslistára.

**Commit**: `feat(admin): add command palette`

---

### AD-4. Metadata-admin csiszolása

**Cél (AF2, AF3, AF4, AF5, AF9, AF11)**

**Feladat**
1. **Rate limit**: a backend terv A3 lépése szerinti "admin" csoportba tedd az admin metadata mutációkat (kiindulás: 60 kérés / 10 perc), ne a közös szigorú vödörbe. Ha az A3 még nem készült el, hozz létre egy külön, nagyobb limitű vödröt az admin metadata műveleteknek a jelenlegi `rateLimit.ts`-ben.
2. **Hibakezelés**: a `handleToggleActive` és `handleMove` hívásokat tedd `try/catch`-be; hibánál `showErrorNotification`, 429-nél barátságos üzenet ("Túl sok módosítás, próbáld később"); a sikeres visszafordítható műveletnél `showUndoNotification` (deaktiválás visszavonása).
3. **Átrendezés**: vezess be húzással történő sorrendezést a `motion` `Reorder` komponensével (nincs új csomag), kézfogantyúval (`IconGripVertical`). A fel/le nyilak maradjanak billentyűzet-hozzáférhető alternatívaként. A húzás közben csak a helyi állapot változik (optimista), a mentés a húzás végén **egyetlen** `reorderMetadata` mutációval történjen (rövid debounce-szal), hiba esetén visszagörgetés az előző sorrendre. ELLENŐRIZD ELŐSZÖR, hogy a `Reorder` jól működik-e `<table>` soron; ha nem, használj `Table` helyett div-alapú rácsot erre a nézetre, vagy fontold meg az `@hello-pangea/dnd` bevezetését (JÓVÁHAGYÁS KELL).
4. **Használati darabszám**: új, admin-jogosultságú lekérdezés (`adminMetadataUsage(type)`), amely metadata-elemenként megadja, hány recept használja. A receptek a metadata JSON-pillanatképét tárolják (`category`, `difficultyLevel`, `labels` stb. JSON mezők, `key` mezővel), ezért a számolás JSON-path lekérdezéssel történik (címkéknél tömb-tartalmazás). Az eredmény jelenjen meg egy `Badge`-ben a soron. A lekérdezés legyen paraméterezett, és az eredmény rövid ideig (pl. 5 perc) gyorsítótárazható.
5. **Hatás-figyelmeztetés**: deaktiváláskor, ha az elemet receptek használják, a visszavonás-értesítés mellett jelenjen meg egy figyelmeztetés a darabszámmal (a meglévő receptek pillanatképe nem változik).
6. **Gyorsítótár**: a `MetadataService.getTranslationKeyLookup()` eredményét tedd Redis gyorsítótárba (pl. 1 óra), és az admin metadata-mutációk (`invalidateActiveMetadataCache`) mellett azt is érvényteleníted.
7. **Hozzáférhetőség**: a táblázatbeli kapcsolók kapjanak látható vagy képernyőolvasó számára érthető, kontextusos nevet (pl. "<címke> aktív").
8. Frissítsd a meglévő teszteket, és írj újakat az átrendezés, a hibakezelés és a darabszám lekérdezés logikájára.

**Elfogadási feltételek**: húzással is sorba rendezhető egy mutációval; 5-nél több gyors módosítás nem ad 429-et az admin csoportban; hibánál látható értesítés; a darabszám helyes (kézi ellenőrzés); a meglévő metadata E2E és Vitest tesztek zöldek.

**Commit**: `feat(admin): polish metadata admin with drag reorder and usage counts`

---

### AD-5. Metadata fordítások az adatbázisban (EMBERI DÖNTÉS)

**Cél (AF6)**: az admin deploy nélkül tudjon új kategóriát vagy címkét felvenni, saját fordítással.

**Feladat**
1. **Előbb csak tervet írj** (`docs/admin-metadata-translations-plan.md`), és állj meg a tulajdonos jóváhagyásáig. Mutasd be a lehetőségeket:
   - (a) a jelenlegi megoldás megtartása (a fordítási kulcsot a locale-fájlokból választja az admin);
   - (b) `MetadataTranslation` tábla (`metadataId`, `locale`, `label`), amelyet az admin szerkeszt (en-gb, hu, de), a locale-fájl kulcs pedig tartalék (fallback);
   - (c) hibrid: a meglévő elemek maradnak fájl-alapúak, az újak DB-s fordítást kapnak.
2. A terv térjen ki arra, hogy a publikus UI jelenleg `translateMisc(item.translationKey)` hívással jeleníti meg a címkét, és ezt hogyan kell módosítani; a recept JSON-pillanatkép és az SEO/feed/sitemap érintettségére; a gyorsítótár-érvénytelenítésre; és a migrációra.
3. A jóváhagyott megoldást külön lépésként kell megvalósítani (nem része ennek a lépésnek).

**Commit**: `docs(admin): propose db-backed metadata translations`

---

### AD-6. Felhasználói és recept-állapotok (migráció)

**Cél (AF8)**: `UserStatus` és `RecipeStatus`.

**Feladat**
1. Add hozzá a Prisma sémához az `UserStatus` (`ACTIVE`, `SUSPENDED`) és `RecipeStatus` (`DRAFT`, `PUBLISHED`, `HIDDEN`) enumokat, a `User.status` és `Recipe.status` mezőket (alapértelmezés: `ACTIVE`, illetve `PUBLISHED`), az indexekkel (`@@index([status])`, `@@index([status, createdAt])`), és írj migrációt. A meglévő sorok kapjanak alapértelmezett értéket.
2. **Felfüggesztett felhasználó**: nem léphet be (az `authorize` és a `jwt` callback ellenőrizze az állapotot), és a felfüggesztéskor a `sessionVersion` nő, hogy a meglévő munkamenetei azonnal érvénytelenek legyenek.
3. **Recept-állapot a publikus olvasási utakon**: minden publikus útvonal csak `PUBLISHED` receptet adjon vissza, a tulajdonos és az admin kivételével: `getRecipes` (a keresési ággal együtt), `getRecipeById`, `getRecipeBySlugOrId`, `getRecipesByUserId`, kedvencek, követett felhasználók legutóbbi receptjei, `sitemap.ts`, `feed.xml`, a recept `opengraph-image`. Ellenőrizd az összes említést a kódkeresésben.
4. **Cache**: a recept-lista és a detail kulcsok a nézői szerepkörtől függnek, ezért vagy kerüljön a kulcsba a nézői hatókör (pl. `public` vs `owner/admin`), vagy a cache csak a publikus nézetre vonatkozzon. Dokumentáld a döntést a `docs/cache-policy.md`-ben.
5. A `UserStatus`/`RecipeStatus` értékeket vedd fel a GraphQL sémába, futtasd a `pnpm codegen`-t.

**Elfogadási feltételek**: elrejtett recept nem jelenik meg a listán, a keresésben, a feedben és a sitemapben, és a közvetlen link 404-et ad a nem tulajdonosnak; felfüggesztett felhasználó nem tud belépni; a meglévő tesztek zöldek, új tesztek a szűrésre.

**Commit**: `feat(prisma): add user and recipe moderation statuses`

---

### AD-7. Felhasználó-kezelés (backend)

**Feladat**
1. `AdminService` bővítése (a meglévő mintát követve, repository és domain-hibák használatával, ha a backend terv B2-B4 lépései elkészültek):
   - `listUsers({ search, role, status, after, limit })` cursor-paginációval (a meglévő `(createdAt, id)` minta), a kimenet PII-szűkített (email csak admin számára, ami itt természetes); `resolveQueryLimit` használata;
   - `setUserRole(actorId, userId, role)`: önvédelem és utolsó-admin szabály, `sessionVersion` növelés;
   - `setUserStatus(actorId, userId, status, reason?)`: önvédelem; felfüggesztésnél `sessionVersion` növelés;
   - `forceLogout(actorId, userId)`: `sessionVersion` növelés;
   - `sendPasswordReset(actorId, userId)`: a meglévő jelszó-visszaállító folyamat indítása a felhasználó nevében (az admin nem látja a tokent);
   - `deleteUser(actorId, userId)`: a backend terv A8 döntése szerint (kaszkád, anonimizálás vagy soft delete).
2. Minden művelet `AuditLog` bejegyzést ír ugyanabban a tranzakcióban (`USER_ROLE_CHANGED`, `USER_SUSPENDED`, `USER_UNSUSPENDED`, `USER_FORCE_LOGOUT`, `USER_PASSWORD_RESET_SENT`, `USER_DELETED`), a payload PII-mentes (szerepek, állapotok, nem email).
3. GraphQL: `adminUsers` lekérdezés és az `adminSetUserRole`, `adminSetUserStatus`, `adminForceLogout`, `adminSendPasswordReset`, `adminDeleteUser` mutációk; vedd fel őket a `operationsConfig.ts` `adminOperations`, a gyökérmező-jogosultsági térkép, a persisted query regiszter és a rate limit "admin" csoportja szerint.
4. Vitest tesztek: önvédelem, utolsó-admin szabály, audit-bejegyzés, szűrők, lapozás, felfüggesztés utáni munkamenet-érvénytelenítés.

**Elfogadási feltételek**: a szabályok tesztekkel védettek; nem-admin hívás elutasítva (a művelet nevétől függetlenül, ha az A2 kész); minden művelet auditált.

**Commit**: `feat(admin): add user management service and graphql api`

---

### AD-8. Felhasználó-kezelés (UI)

**Feladat**
1. Új `/admin/users` oldal (ADMIN_ROUTES, navbar, breadcrumb, i18n `admin.users.*` mindhárom locale-ban).
2. `AdminPageHeader`, `DataToolbar` (keresés: név, felhasználónév, email; szűrők: szerep, állapot; az állapot a keresési paraméterekben), tábla: avatar-monogram, név és felhasználónév, email, `RoleBadge`, `StatusBadge`, regisztráció ideje, receptek száma, sorműveletek (`Menu`).
3. Lapozás "Továbbiak betöltése" gombbal (a meglévő cursor-mintához illeszkedve), betöltési skeleton, üres és hibaállapot.
4. Részletező fiók (`Drawer`): profil, statisztika (receptek, értékelések, követők), legutóbbi admin műveletek az adott felhasználón (audit szűrt nézet, ha az AD-10 kész), gyors műveletek.
5. Műveletek: szerep módosítása (`Select` + `ConfirmDialog`), felfüggesztés/visszaállítás (indok megadásával, visszavonás-értesítéssel), kényszerített kijelentkeztetés, jelszó-visszaállító email küldése, törlés (begépelős megerősítés).
6. Kijelölés és `BulkActionBar`: kötegelt felfüggesztés és kényszerített kijelentkeztetés. Az önvédelmi szabályok a UI-ban is jelenjenek meg (letiltott műveletek magyarázattal).
7. Mozgás: sor-belépés a meglévő mintával, törlésnél `AnimatePresence` kilépés, `BulkActionBar` becsúszás.

**Elfogadási feltételek**: a teljes folyamat működik mindkét témában és mobilon; a letiltott önvédelmi műveletek magyarázatot mutatnak; Vitest komponens-tesztek; Playwright teszt (szerepváltás, felfüggesztés, utána a felhasználó nem tud belépni).

**Commit**: `feat(admin): add users page`

---

### AD-9. Recept-moderáció

**Feladat**
1. **Backend**: `AdminService` metódusok: `listRecipes({ search, status, authorId, categoryKey, after, limit })`, `setRecipeStatus(actorId, recipeId, status, reason?)` (elrejtés/megjelenítés), `deleteRecipe` (admin által, indokkal). Audit: `RECIPE_HIDDEN`, `RECIPE_UNHIDDEN`, `RECIPE_DELETED`. Státuszváltáskor a recept-lista verziója és a detail/slug kulcsok érvénytelenednek (cache-modul), a sitemap és a feed a következő kérésnél frissül.
2. **GraphQL**: `adminRecipes`, `adminSetRecipeStatus`, `adminDeleteRecipe`; regisztrálás az AD-7 3. pontja szerint.
3. **UI**: új `/admin/recipes` oldal: tábla (kép, cím, szerző, kategória, `StatusBadge`, értékelés, létrehozás ideje), szűrők, előnézeti `Drawer` (a recept olvasható nézete, alap adatok, szerző), sorműveletek (elrejtés/megjelenítés visszavonás-értesítéssel, törlés begépelős megerősítéssel), kötegelt elrejtés. A közvetlen megtekintés linkje új lapon nyílik.
4. i18n `admin.recipes.*` mindhárom locale-ban.

**Elfogadási feltételek**: elrejtett recept azonnal eltűnik a publikus oldalról (cache-érvénytelenítéssel együtt); minden művelet auditált; Playwright teszt: elrejtés után a publikus link 404.

**Commit**: `feat(admin): add recipe moderation`

---

### AD-10. Audit napló nézet

**Feladat**
1. **Backend**: `adminAuditLog({ actorId, action, targetType, targetId, from, to, after, limit })` lekérdezés cursor-paginációval; csak olvasható, nincs törlő mutáció. Az `actorId` mellé a megjelenítéshez a felhasználónév feloldása (DataLoader vagy batch lekérdezés, törölt felhasználónál "törölt felhasználó").
2. **UI**: `/admin/audit-log` oldal: szűrőcsíkok (művelet, célpont típusa, szerző), dátumtartomány (JÓVÁHAGYÁS KELL `@mantine/dates` csomaghoz; ennek hiányában két natív `date` mező), nézetváltó (tábla és Mantine `Timeline`), sorra kattintva különbség-megjelenítő (before/after JSON, a változott mezők kiemelve), a `target` linkje a megfelelő admin oldalra, "Továbbiak betöltése".
3. A megjelenítés ne mutasson PII-t; a payload-ban tárolt adatokat se jelenítsd meg szűretlenül.
4. **Megőrzés**: dokumentáld a megőrzési időt (javaslat: 12 hónap); a törlési folyamatot külön döntés (EMBERI DÖNTÉS), nem része ennek a lépésnek.
5. **Lefedettségi teszt**: egy teszt győződjön meg róla, hogy minden admin mutáció ír audit-bejegyzést (a mutációk listájából kiindulva).

**Elfogadási feltételek**: szűrők és lapozás működnek; a diff helyes; csak admin látja; a lefedettségi teszt zöld.

**Commit**: `feat(admin): add audit log page`

---

### AD-11. Dashboard

**Feladat**
1. **Backend**: `adminStats` lekérdezés aggregátumokkal: felhasználók és receptek száma, új regisztrációk és receptek az elmúlt 7/30 napban (napi bontás), értékelések száma és átlaga, legjobban értékelt receptek, receptek kategóriánként, legutóbbi 8 audit-bejegyzés. A lekérdezések legyenek hatékonyak (aggregátumok az adatbázisban, nem alkalmazásbeli számolás), az eredmény Redis gyorsítótárban 5 percig. A szerepkör-ellenőrzés és az AD-7 3. pontja szerinti regisztráció kötelező.
2. **Rendszerállapot kártya**: adatbázis-ping késleltetése, Redis elérhetőség (a meglévő megszakító állapota; ehhez exportálj egy olvasó függvényt a `redis.ts`-ből), verzió (`package.json`) és a commit azonosító (`VERCEL_GIT_COMMIT_SHA`, ha elérhető; az `src/env.ts`-ben vedd fel opcionális változóként).
3. **UI**: az `/admin` oldal a dashboard (az átirányítás megszűnik): `StatCard`-ok `Sparkline`-nal és trend-jelvénnyel, területdiagram (új felhasználók/receptek), fánkdiagram (receptek kategóriánként), legjobb receptek lista, aktivitás-folyam (audit), rendszerállapot. A diagramok `@mantine/charts` komponensek (JÓVÁHAGYÁS KELL: `@mantine/charts` és `recharts`; a Mantine Charts a Recharts-ra épül). A diagramszínek téma színnevek (nem hex), mindkét témában olvashatók; a diagramoknak szöveges összefoglalójuk van.
4. **CSP**: ellenőrizd, hogy a diagramok működnek a szigorú, nonce-alapú CSP alatt (SVG inline stílusok); ha nem, dokumentáld a szükséges direktívát, de ne lazítsd a CSP-t jóváhagyás nélkül.
5. Mozgás: számfelfutás és `useInView` alapú belépés (egyszer), csökkentett mozgásnál statikus.
6. i18n `admin.dashboard.*`.

**Elfogadási feltételek**: a dashboard 1 másodpercen belül betölt gyorsítótárból; mobilon egy oszlopra törik; mindkét témában jól olvasható; a diagramok CSP alatt is működnek.

**Commit**: `feat(admin): add dashboard with stats and charts`

---

### AD-12. Rendszer-eszközök

**Feladat**
1. `/admin/tools` oldal (Rendszer csoport):
   - **Cache-kezelés**: a metadata-gyorsítótár és a recept-lista verzió kézi érvénytelenítése (az érvénytelenítő függvényekre épít), megerősítéssel.
   - **Metadata export/import**: JSON letöltés az összes metadata-elemről; import szárazfutással (előnézet: mi jönne létre/változna), majd megerősített alkalmazás. Az import ugyanazokat az ellenőrzéseket futtatja, mint a létrehozás (kulcsminta, ismert fordítási kulcs).
   - **Karbantartási/értesítő banner**: egy bekapcsolható üzenet a publikus oldal tetején. EMBERI DÖNTÉS: hol tárolódjon (adatbázis `SiteSetting` tábla, vagy Vercel Edge Config); a döntésig csak a tervet írd meg.
2. Minden művelet auditált (`CACHE_INVALIDATED`, `METADATA_EXPORTED`, `METADATA_IMPORTED`, `MAINTENANCE_BANNER_CHANGED`), és az "admin" rate limit csoportban van.

**Elfogadási feltételek**: a szárazfutás nem módosít adatot; az import hiba esetén egészében visszagördül (tranzakció); minden művelet auditált.

**Commit**: `feat(admin): add system tools page`

---

### AD-13. Admin biztonsági megerősítés

**Feladat**
1. **Admin-munkamenet**: rövidebb élettartam adminoknak (pl. 8 óra a mostani 14 nap helyett, a szerepkör szerint); dokumentáld a hatását.
2. **Újrahitelesítés ("sudo mód")**: destruktív műveleteknél (felhasználótörlés, recept végleges törlés, import, tömeges műveletek) kérj jelszót újra; sikeres megadás után rövid (10 perces) emelt jogosultságú, HttpOnly süti, amelyet a szerveroldal ellenőriz. A kliens megerősítő modálja ne legyen az egyetlen védelem.
3. **Opcionális TOTP 2FA adminoknak** (JÓVÁHAGYÁS KELL: például `otplib`): beállítás QR-kóddal, helyreállító kódok, ellenőrzés belépéskor admin szerepnél. Külön tervdokumentum jóváhagyás után valósítható meg.
4. Nézd át a rate limit csoportokat az admin műveletekre, és ellenőrizd, hogy az önvédelmi szabályok szerverszinten tesztelve vannak.
5. Ellenőrizd, hogy az admin oldalak `noindex` jelzést kapnak, és a CSP nem gyengült.

**Elfogadási feltételek**: destruktív művelet újrahitelesítés nélkül elutasítva (szerveroldalon); a rövidebb munkamenet tesztelve.

**Commit**: `feat(admin): harden admin sessions and add re-authentication`

---

### AD-14. i18n, hozzáférhetőség, reszponzivitás

**Feladat**
1. Az összes `admin.*` kulcs teljes mindhárom locale-ban (en-gb, hu, de); ellenőrizd, hogy nincs hiányzó kulcs (írj egy tesztet, amely összeveti a locale-fájlok kulcskészletét).
2. Billentyűzet: minden művelet elérhető billentyűzettel; a `Drawer` és `Modal` fókuszt kezel; a gyorsparancs-paletta és a sorműveletek nyíl- és Enter-vezérelhetők; a húzás alternatívája a nyilak.
3. Képernyőolvasó: ikongombok `aria-label`-lel, táblázat-fejlécek, állapotváltozások `aria-live` régióban.
4. Reszponzivitás (360, 768, 1280 px): a táblák vízszintesen görgethetők (`Table.ScrollContainer`) vagy kártyanézetre váltanak mobilon; az érintési célpontok legalább 44 px-esek; a `BulkActionBar` nem takarja ki a tartalmat.
5. Kontraszt-ellenőrzés mindkét témában (szöveg ≥ 4,5:1, UI-elemek ≥ 3:1); a dokumentált szabályok (`darkTheme.ts`) betartása.
6. Csökkentett mozgás kézi ellenőrzése.

**Elfogadási feltételek**: a kulcs-egyezési teszt zöld; a fenti ellenőrzések dokumentálva a PR-ban.

**Commit**: `feat(admin): complete i18n, accessibility and responsive pass`

---

### AD-15. Tesztek és dokumentáció

**Feladat**
1. Playwright E2E: admin route-guard (meglévő), metadata átrendezés, szerepváltás, felfüggesztés (utána a felhasználó nem lép be), recept elrejtése (utána a publikus link 404), audit-bejegyzés megjelenése, sötét/világos téma váltás az admin oldalon (a téma megmarad).
2. Frissítsd: `docs/admin-panel-plan-2026-08-30.md` státusz-szakaszát vagy írj új, dátumozott státuszdokumentumot; `docs/GRAPHQL.md` (új admin műveletek, jogosultság, rate limit csoport); `docs/cache-policy.md`; hozz létre `docs/admin-design-system.md` fájlt a 3. szakasz tartalmával (tokenek, komponensek, mozgás, hozzáférhetőségi szabályok).

**Commit**: `docs(admin): document admin design system and update status`

---

## 6. Állapotkövető

| Lépés | Téma                                | Fázis  | Állapot |
| ----- | ----------------------------------- | ------ | ------- |
| AD-0  | Felderítés                          | -      | []      |
| AD-1  | Design-primitívek                   | Design | []      |
| AD-2  | AdminShell újratervezés             | Design | []      |
| AD-3  | Gyorsparancs-paletta                | Design | []      |
| AD-4  | Metadata-admin csiszolás            | 1      | []      |
| AD-5  | Metadata fordítások DB-ben (döntés) | 1      | []      |
| AD-6  | Státusz-migrációk                   | 2-3    | []      |
| AD-7  | Felhasználók (backend)              | 2      | []      |
| AD-8  | Felhasználók (UI)                   | 2      | []      |
| AD-9  | Recept-moderáció                    | 3      | []      |
| AD-10 | Audit napló                         | 4      | []      |
| AD-11 | Dashboard                           | 5      | []      |
| AD-12 | Rendszer-eszközök                   | 6      | []      |
| AD-13 | Admin biztonság                     | 7      | []      |
| AD-14 | i18n, a11y, reszponzivitás          | -      | []      |
| AD-15 | Tesztek és dokumentáció             | -      | []      |

---

## 7. Döntések és jóváhagyások listája

| Lépés | Kell                | Mi                                                                              |
| ----- | ------------------- | ------------------------------------------------------------------------------- |
| AD-4  | JÓVÁHAGYÁS          | `@hello-pangea/dnd`, csak ha a `motion` `Reorder` táblasoron nem használható    |
| AD-5  | EMBERI DÖNTÉS       | Metadata fordítások tárolása (fájl, adatbázis, hibrid)                          |
| AD-6  | EMBERI DÖNTÉS       | Nézői hatókör a recept cache-kulcsokban; a backend terv A8 (`onDelete`) döntése |
| AD-10 | JÓVÁHAGYÁS / DÖNTÉS | `@mantine/dates`; audit-megőrzési idő és törlési folyamat                       |
| AD-11 | JÓVÁHAGYÁS          | `@mantine/charts` és `recharts`                                                 |
| AD-12 | EMBERI DÖNTÉS       | Karbantartási banner tárolása (adatbázis vagy Edge Config)                      |
| AD-13 | JÓVÁHAGYÁS          | TOTP könyvtár (pl. `otplib`)                                                    |

---

## 8. Végső ellenőrzőlista (Definition of Done)

- [ ] `pnpm lint`, `pnpm typecheck`, `pnpm test:unit`, `pnpm codegen:check`, `pnpm build` zöld; a Playwright E2E zöld.
- [ ] Minden admin oldal és komponens olvasható világos és sötét módban (kontraszt ≥ 4,5:1 szöveg, ≥ 3:1 UI-elem).
- [ ] Nincs hex szín és nincs fix, egyik témában rossz `c` érték az új admin fájlokban.
- [ ] Csökkentett mozgásnál minden animáció kikapcsol.
- [ ] Minden admin mutáció auditált, és a lefedettségi teszt zöld.
- [ ] Az önvédelmi szabályok (saját fiók, utolsó admin) szerveroldalon is tesztelve.
- [ ] Minden új GraphQL művelet szerepel az `operationsConfig.ts`-ben, a persisted query regiszterben, a gyökérmező-térképben (ha kész) és a rate limit "admin" csoportban.
- [ ] Mindhárom locale teljes az `admin.*` kulcsokra.
- [ ] Az admin dokumentáció és a design-rendszer dokumentum naprakész.

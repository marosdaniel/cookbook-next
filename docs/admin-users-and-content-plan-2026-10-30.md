# Admin: felhasználói tartalmak és további admin-funkciók terve

Dátum: 2026-10-30. Ez a dokumentum a `feat/admin-user-insights-and-design` ág tartalmát és a további admin-fejlesztések tervét rögzíti.

## 1. Ebben a körben elkészült

| Terület | Tartalom |
|---|---|
| Design | Új `AdminShell`: márkagradiens sáv a fejlécen, gradiens pajzs-ikon és "Admin" jelvény, csoportosított oldalsáv (Áttekintés, Emberek, Tartalom), világos és sötét módban is olvasható felületek (csak Mantine-változók, hex szín nélkül) |
| Oldalsáv | A publikus oldalsáv legelső eleme az admin felületre vezet (csak `ADMIN` szerepnél), gradiens pajzs-ikonnal |
| Dashboard (`/admin`) | Statisztika-kártyák animált számokkal; Mantine Charts: regisztrációk (AreaChart), szerepek (DonutChart), legaktívabb szerzők (BarChart); legújabb tagok |
| Felhasználók (`/admin/users`) | Keresés (név, felhasználónév, email), szerepszűrő, lapozás, szerep-jelvények, receptszám, csatlakozás ideje (csak olvasható) |
| Adatréteg | `src/server/modules/admin/userInsights*`: repository és service, `assertAdminRole`; szerveroldali oldalbetöltés, **nem GraphQL** |

### Tervezői döntések

- **Nem GraphQL**: az oldalak szerverkomponensként közvetlenül a service-t hívják. Így nem kell új GraphQL-művelet, allowlist-bejegyzés, jogosultsági szabály és codegen. A védelem rétegei: a proxy (`/admin` route family), az admin layout guard és a service `assertAdminRole` ellenőrzése.
- **Csak olvasható**: a módosító műveletek (szerepváltás, felfüggesztés, törlés) auditálást és migrációt igényelnek, ezért külön fázisban készülnek (lásd 4. szakasz).
- **Fordítások**: az új feliratok az `adminConsole` névtérben vannak (`src/locales/admin-console/*.json`), amelyet a `getLocaleMessages` olvaszt az üzenetekhez. Később beolvaszthatók a fő locale-fájlokba.
- **Függőség**: a diagramokhoz `@mantine/charts` és `recharts` kell (`pnpm add @mantine/charts@9.7.4 recharts`).

## 2. További felhasználói tartalmak

| Tartalom | Leírás | Előfeltétel | Prioritás |
|---|---|---|---|
| Felhasználó-részletező (`/admin/users/[id]`) | Profil, receptek, értékelések, kedvencek, követők, az adott felhasználót érintő admin műveletek | Auditnapló-nézet | P1 |
| Szerepkezelés | USER, BLOGGER, ADMIN váltás; saját szerep és az utolsó admin védelme; `sessionVersion` növelése; audit | Server Action vagy GraphQL mutáció | P1 |
| Felfüggesztés és visszaállítás | `UserStatus` mező, belépés tiltása, indok, audit | Prisma-migráció, `authorize` módosítás | P1 |
| Kényszerített kijelentkeztetés | `sessionVersion` növelése, cache-kulcs törlése | — | P1 |
| Jelszó-visszaállítás indítása | A meglévő folyamat indítása a felhasználó nevében; az admin nem látja a tokent | Rate limit az emailre | P2 |
| Fiók törlése | Megerősítés begépeléssel, audit | `docs/user-deletion-policy.md` döntés | P2 |
| Kötegelt műveletek | Kijelölés és tömeges felfüggesztés vagy kijelentkeztetés | Sorszintű műveletek | P2 |
| Aktivitás-idővonal | Egy felhasználó eseményei időrendben | AuditLog bővítése | P3 |
| Kohorsz-diagram | Regisztráció és megtartás hónapok szerint | Aggregált lekérdezés | P3 |
| CSV export | A szűrt lista exportja | Adatvédelmi mérlegelés, audit | P3 |

## 3. Egyéb admin-tartalmak ötletei

| Ötlet | Miért hasznos | Ingyenes megoldás | Munka |
|---|---|---|---|
| Recept-moderáció | Elrejtés vagy törlés szabálysértő receptnél | `RecipeStatus` mező, Mantine tábla | L |
| Audit napló nézet | Ki mit módosított; a napló már íródik | Meglévő `AuditLog` tábla | M |
| Értékelések moderálása | Visszaélések kezelése | Táblázat és törlés auditálva | M |
| Rendszerállapot | Adatbázis- és Redis-elérhetőség, verzió, build azonosító | Meglévő megszakító állapota | S |
| Kvóta-figyelő | Upstash (500 ezer parancs/hó), Neon és Vercel ingyenes keretek közelsége | Szolgáltatók API-ja vagy kézi összefoglaló | M |
| Karbantartási üzenet | Bannert lehet mutatni a publikus oldalon | `SiteSetting` tábla vagy Edge Config | M |
| Cache-kezelés | A metadata- és listacache kézi ürítése | `invalidateCacheScope` | S |
| Biztonsági napló | Rate limit találatok, sikertelen belépések összesítve | Strukturált pino naplók | M |
| Email-sablonok és tesztküldés | A reset és welcome levelek előnézete | Nodemailer | M |
| Tartalom-statisztikák | Népszerű kategóriák, címkék, konyhák | Aggregált lekérdezések, Mantine Charts | M |
| Bejelentések kezelése | Felhasználói jelentések sorba állítása | Új modell, a komment-rendszerrel együtt | L |
| SEO-ellenőrzés | Sitemap, feed és JSON-LD gyors ellenőrzése | Meglévő végpontok | S |

## 4. Fejlesztési terv

### Fázis 1: olvasható admin (ez a PR)

Dashboard, felhasználólista, design-frissítés, oldalsáv-elem.

### Fázis 2: felhasználókezelés

1. `UserStatus` enum és migráció (`ACTIVE`, `SUSPENDED`); az `authorize` és a `jwt` callback tiltsa a felfüggesztettet.
2. Szerepváltás, felfüggesztés, kényszerített kijelentkeztetés: `AdminService` metódusok tranzakciós audittal; önvédelem (saját fiók, utolsó admin).
3. Felhasználó-részletező oldal és sorműveletek menüje (`Menu`, megerősítő modál, visszavonás-értesítés).
4. Jogosultság és rate limit: ha GraphQL-en át készül, a `ROOT_FIELD_POLICY`, a persisted query regiszter és az `admin` rate limit csoport bővítése; ha Server Action, akkor a művelet első lépése a szerepkör-ellenőrzés.
5. Tesztek: önvédelmi szabályok, audit-bejegyzés, felfüggesztés utáni belépés, E2E a szerepváltásra.

### Fázis 3: moderáció és napló

`RecipeStatus` migráció, a publikus olvasási utak szűrése, recept-moderációs lista, audit napló nézet (szűrők, különbség-megjelenítő).

### Fázis 4: üzemeltetés

Rendszerállapot, kvóta-figyelő, karbantartási üzenet, cache-kezelés.

## 5. Design-rendszer jegyzetek

- Kizárólag Mantine-témaváltozók és témanevek (`pink.6`, `var(--mantine-color-*)`), hex szín nélkül; a szöveg alapszínét (`Text`, `Title`) ne írd felül, csak `dimmed` használható.
- Világos és sötét módban is legalább 4,5:1 szöveg-kontraszt; az állapotot jelvény szövege is kifejezze, ne csak a szín.
- Mozgás: belépő animáció CSS-ben, számok felfutása `motion`-nel; `prefers-reduced-motion` esetén minden kikapcsol.
- A márka-sáv (pink -> violet gradiens) és az "Admin" jelvény jelzi, hogy az admin felületen vagy.

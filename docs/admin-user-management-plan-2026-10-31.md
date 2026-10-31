# Admin: felhasználókezelés (szerepváltás, törlés, részletező modál)

Dátum: 2026-10-31. Ez a dokumentum a `feat/admin-user-management` ág tervét és a megvalósított döntéseket rögzíti. A korábbi, 2026-10-30-i terv (`admin-users-and-content-plan-2026-10-30.md`) 2. fázisából az első lépés.

## 1. Cél

- Az admin a `/admin/users` táblázatból szerepkört válthat (előléptetés vagy visszaléptetés) és törölhet felhasználót.
- A táblázat új, jobb szélső **Műveletek** oszlopában egy `ActionIcon` (nem a primary pink, hanem `indigo`) menüt nyit: **Előléptetés** (almenüben az elérhető szerepkörök) és **Törlés**.
- A sorra kattintva modál nyílik az összes elérhető felhasználói adattal és ugyanazzal a műveleti menüvel.
- Az admin oldal sablonjai `data-testid` azonosítókat kapnak.

## 2. Tervezői döntések

| Téma         | Döntés                                                                                                                                             | Indok                                                                                                         |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| Írási út     | **Server Action** (`src/app/admin/users/actions.ts`), nem GraphQL                                                                                  | Nem kell új GraphQL-művelet, jogosultsági szabály, persisted query és codegen; a terv 2. fázisa is ezt engedi |
| Séma         | Nincs migráció                                                                                                                                     | Az `AuditLog` tábla és a `User.sessionVersion` már létezik                                                    |
| Szerepváltás | Tranzakció: `role` frissítés, `sessionVersion` növelés, `USER_ROLE_CHANGED` audit (`from`, `to`)                                                   | A régi JWT azonnal érvénytelen, így az érintett újra belépve kapja meg az új jogosultságot                    |
| Gyorsítótár  | `invalidateCacheScope({ sessionUserId })` a tranzakció után                                                                                        | A `jwt` callback a `sessionVersion`-t Redisből olvassa 60 másodperces TTL-lel                                 |
| Törlés       | A meglévő `AccountService.deleteUser`                                                                                                              | Már auditál (`USER_DELETED`) és törli a cache-t                                                               |
| Önvédelem    | Saját fiókon nem lehet szerepet váltani és törölni                                                                                                 | Az utolsó admin így nem tűnhet el: a művelet végzője mindig admin marad                                       |
| Jogosultság  | Három réteg: proxy és admin layout, az action első lépése (`ADMIN` szerep a munkamenetből), a service `assertAdminRole` ellenőrzése                | Védelem mélységben                                                                                            |
| Adatvédelem  | A lista csak megjelenítendő mezőket kér le; jelszó, reset token, `sessionVersion` soha nem kerül a kliensre                                        | Az admin modál sem kap érzékeny adatot                                                                        |
| Hibakezelés  | Az action `{ ok: true }` vagy `{ ok: false, error }` értéket ad (`FORBIDDEN`, `SELF_ACTION`, `NOT_FOUND`, `UNCHANGED`, `INVALID_INPUT`, `UNKNOWN`) | A kliens lokalizált értesítést mutat, nincs kivétel a kliens felé                                             |

## 3. Felület

- `UserActionsMenu`: `ActionIcon` (táblázat) vagy gomb (modál) → `Menu` → `Menu.Sub` az előléptetéshez. A jelenlegi szerepkör pipával jelölt és letiltott. Saját fióknál minden elem le van tiltva, magyarázó felirattal.
- `UserDetailsModal`: avatar, név, szerep-jelvény, minden mező (azonosító, keresztnév, vezetéknév, felhasználónév, email, szerepkör, nyelv, receptek, kedvencek, értékelések, követők, követettek, csatlakozás, utolsó módosítás) és a műveleti menü.
- `DeleteUserModal`: megerősítés a törlés előtt, a törlendő receptek számával.
- A műveleti cella kattintása nem nyitja meg a részletező modált. Billentyűzettel a felhasználó nevét tartalmazó gomb nyitja meg.

## 4. `data-testid` konvenció

`admin-<terület>-<elem>[-<azonosító>]`, kisbetűs, kötőjeles. Példák: `admin-users-table`, `admin-user-row-<id>`, `admin-user-actions-<id>`, `admin-user-role-option-<szerep>-<id>`, `admin-user-details-modal`, `admin-delete-user-confirm`. A meglévő azonosítók változatlanok.

## 5. Ismert korlátok és következő lépések

- A szerepváltás kijelentkezteti az érintett felhasználót (a `sessionVersion` miatt); ez szándékos, de az üzenet erről tájékoztat.
- Nincs rate limit az action-ökön; az admin szerepkör és a proxy védi őket. Ha szükséges, az `admin` rate limit csoport bővíthető.
- Felfüggesztés, kényszerített kijelentkeztetés, kötegelt műveletek és a felhasználó-részletező oldal (`/admin/users/[id]`) a következő lépések (lásd a 2026-10-30-i terv 4. szakaszát).
- E2E: a szerepváltás és a törlés Playwright-forgatókönyve még nincs meg.

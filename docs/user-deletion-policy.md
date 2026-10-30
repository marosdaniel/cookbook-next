# Felhasználói fiók törlésének szabályzata

Dátum: 2026-10-29. Állapot: **döntésre vár** (a kód a jelenlegi, Cascade viselkedést valósítja meg).

## 1. Jelenlegi viselkedés

A `20261029000000_recipe_author_on_delete_cascade` migráció óta a `Recipe.author` reláció `onDelete: Cascade`. Egy felhasználó törlésekor (saját fiók törlése vagy admin általi törlés):

- a felhasználó **összes receptje** véglegesen törlődik (a hozzávalókkal és lépésekkel együtt),
- a recepteken lévő **értékelések** is törlődnek (a többi felhasználó értékelései is), a kedvencek és követések kapcsolótáblái szintén,
- a törlés **nem visszafordítható**.

A kód a törlés után érvényteleníti a felhasználó cache-bejegyzéseit (saját receptek, kedvencek, követések, session-verzió) és a törölt receptek részlet- és slug-kulcsait, és növeli a recept-lista verzióját. Ha admin töröl más fiókot, `USER_DELETED` bejegyzés kerül az `AuditLog`-ba ugyanabban a tranzakcióban (payload: a törölt receptek száma, személyes adat nélkül).

## 2. Lehetőségek

| Lehetőség              | Leírás                                                                                      | Előny                                                                                | Hátrány                                                                                                                                  |
| ---------------------- | ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------- |
| A. Cascade (jelenlegi) | A fiókkal együtt a receptek is törlődnek                                                    | Egyszerű, adatvédelmi szempontból egyértelmű (nem marad személyhez köthető tartalom) | Más felhasználók által kedvencelt, értékelt receptek eltűnnek; nem visszafordítható                                                      |
| B. Anonimizálás        | `createdBy` nullable, `onDelete: SetNull`; a recept "törölt felhasználó" szerzővel megmarad | A közösségi tartalom megmarad                                                        | Több kód- és UI-munka (szerző nélküli receptek kezelése, jogosultságok, SEO); a recept szövege továbbra is személyes adatot tartalmazhat |
| C. Soft delete         | `deletedAt` a felhasználón, a fiók elérhetetlen, de az adat marad                           | Visszaállítható                                                                      | Személyes adat marad az adatbázisban; külön törlési folyamat kell a végleges eltávolításhoz                                              |

## 3. Javaslat

Egy hobbi recept-megosztónál az **A. Cascade** a legegyszerűbb és legkövetkezetesebb, **ha** a felhasználók a törlés előtt egyértelműen megkapják a figyelmeztetést. Ebben az esetben:

1. A felhasználótörlés megerősítő szövege mondja ki, hogy a fiókhoz tartozó receptek is véglegesen törlődnek.
2. Az adatvédelmi tájékoztató (`privacy-policy`) tartalmazza ezt a következményt.
3. Az admin általi törlés auditnaplózása (kész) megmarad.

Ha fontos, hogy a közösségi tartalom megmaradjon, a **B. Anonimizálás** a jobb választás, de külön tervet és migrációt igényel.

## 4. Döntés

- [ ] A. Cascade megtartása (a fenti 1-2. pont teendői)
- [ ] B. Anonimizálás (külön terv szükséges)
- [ ] C. Soft delete (külön terv szükséges)

A döntésig a kód nem változik.

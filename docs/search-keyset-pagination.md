# Trigram keresés és keyset lapozás terve (C1)

Dátum: 2026-10-29

## 1. A korábbi megvalósítás problémái (F11)

1. **Korlátlan SQL találati lista (`LIMIT` hiánya)**: a `RecipeService.getRecipes` a keresőkifejezésre az összes egyező recept azonosítóját beolvasta a memóriába, majd `where.id = { in: searchIds }` feltétellel kérdezte le a recepteket.
2. **Ellentmondó rendezés és kurzor**: a keresési SQL relevancia (`similarity`) szerint rendezett, a `prisma.recipe.findMany` viszont `createdAt DESC, id DESC` szerint, majd JS-ben `searchIds.indexOf(...)` rendezte vissza. Eközben az `endCursor` továbbra is `{ createdAt, id }` maradt, így a második oldal lekérésekor a relevancia-sorrend és az időbélyeg-alapú kurzor egymásnak ellentmondott (eltűnő vagy duplikált találatok).
3. **`LEFT JOIN ingredients` + `GROUP BY r.id`**: sok hozzávaló esetén felesleges sorrobbanást okozott a csoportosítás előtt.

---

## 2. Új architektúra és SQL lekérdezés

### 2.1. Kurzorformátumok

- **Alapértelmezett (nem kereső) lista**:
  - Rendezés: `createdAt DESC, id DESC`
  - Kurzor payload (base64url JSON): `{ "createdAt": "2026-10-29T12:00:00.000Z", "id": "cuid..." }`
- **Trigram keresés (`search` vagy `title` szűrő aktív)**:
  - Rendezés: `score DESC, id DESC` (determinisztikus másodlagos kulcs az `id`)
  - Kurzor payload (base64url JSON): `{ "score": 0.625, "id": "cuid..." }`

### 2.2. Keresési SQL (CTE + `EXISTS` + skalár részlekérdezés + szűrők)

A `LEFT JOIN ingredients` + `GROUP BY` helyett a hozzávalók hasonlóságát skalár alkérdéssel és `EXISTS` feltétellel számítjuk ki (a `ingredients_name_trgm_idx` és `ingredients_recipeId_idx` indexekre támaszkodva), a JSONB és skalár szűrőket pedig közvetlenül a `filtered` CTE-ben érvényesítjük:

```sql
WITH scored AS (
  SELECT
    r.id,
    ROUND(
      GREATEST(
        similarity(r.title, $1),
        similarity(COALESCE(r.description, ''), $1),
        similarity(COALESCE(r.tips, ''), $1),
        similarity(COALESCE(r.substitutions, ''), $1),
        COALESCE((
          SELECT MAX(similarity(i.name, $1))
          FROM ingredients i
          WHERE i."recipeId" = r.id AND i.name % $1
        ), 0)
      )::numeric,
      6
    )::float8 AS score,
    COUNT(*) OVER()::int AS "totalCount"
  FROM recipes r
  WHERE (
    r.title % $1
    OR COALESCE(r.description, '') % $1
    OR COALESCE(r.tips, '') % $1
    OR COALESCE(r.substitutions, '') % $1
    OR EXISTS (
      SELECT 1 FROM ingredients i
      WHERE i."recipeId" = r.id AND i.name % $1
    )
  )
  -- + opcionális kategória, nehézség, konyha, költségszint, címkék, étrend, allergének, eszközök, maxCookingTime szűrők
)
SELECT id, score, "totalCount"
FROM scored
WHERE (
  $cursorScore::numeric IS NULL
  OR score < $cursorScore::float8
  OR (score = $cursorScore::float8 AND id < $cursorId)
)
ORDER BY score DESC, id DESC
LIMIT $take;
```

A lekért `take = limit + 1` darab `(id, score)` sor alapján:
1. Meghatározzuk a `hasNextPage` értéket (`rows.length > limit`).
2. A megjelenítendő oldal `id` listájához egyetlen `prisma.recipe.findMany({ where: { id: { in: pageIds } }, select: RECIPE_LIST_SELECT })` hívással betöltjük a kártyaprojekciót, majd egy `Map` segítségével visszaállítjuk a pontos `(score DESC, id DESC)` sorrendet.
3. Az `endCursor` az utolsó elem `{ score, id }` párjából képződik.

---

## 3. Kézi ellenőrzési lépések Neon fejlesztői branchen

1. Indítsd el a fejlesztői szervert: `pnpm dev`.
2. Nyisd meg a `/recipes` oldalt, és írj be egy keresőkifejezést (pl. `"pasta"` vagy `"soup"`), kombinálva kategória- vagy nehézségi szűrővel.
3. Ellenőrizd a hálózati fülön a `getRecipes` GraphQL választ:
   - Az első oldal `pageInfo.endCursor` értéke base64url dekódolás után `{"score":...,"id":"..."}` alakú.
   - A „Továbbiak betöltése” (lapozás) gombra kattintva a következő oldal nem ismétli az első oldal elemeit, és a `totalRecipes` értéke mindkét oldalon megegyezik.

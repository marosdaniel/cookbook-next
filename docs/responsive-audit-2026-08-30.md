# 📱 Cookbook-Next — Responsive / mobil felülvizsgálat

> **Dátum**: 2026-08-30
> **Módszer**: komponensfa-átvizsgálás (Mantine responsive propok, fix méretek, touch targetek, overflow-veszélyek) + a motion-terv mobil-teljesítmény hatásvizsgálata.
> **Mantine töréspontok**: xs 36em · sm 48em · md 62em · lg 75em · xl 88em.

---

## 1. Összefoglaló táblázat

| # | Komponens/oldal | Probléma | Súlyosság | Prio |
|---|---|---|---|---|
| R1 | Recept-detail — sticky hozzávaló-kártya | `top: 80px` sticky + `md`-nél túl korán vált két hasábra → tablet sávban összenyomott tartalom | Közepes | P1 |
| R2 | Recept-detail — hero kép | Fix `420px` magasság minden viewporton → mobilon a fold nagy részét elviszi | Alacsony/közepes | P1 |
| R3 | Touch targetek | Több `ActionIcon`/ikongomb < 44×44px (favorite gomb kártyán, step fel/le nyilak, composer ikonok) | Közepes (a11y) | P1 |
| R4 | Footer (mobil) | `gap={4}` zsúfolt; linkek `size="xs"` → kis tap-felület | Alacsony | P1 (a footer-redesign része) |
| R5 | Header — nagyon keskeny viewport (<360px) | Logo + search + auth gomb + burger egy sorban törhet | Alacsony | P2 |
| R6 | RecipesPage szűrősáv | A szűrők mobilon egymás alá esnek, de a collapse abrupt; a szűrő-controlok nem `size="md"`-k mobilon | Alacsony | P2 |
| R7 | RecipeComposer mobilon | A szekcióváltó sidebar Draweren keresztül érhető el, a submit a tartalom alján — sok interakció (07-06 R9 óta nyitott) | Közepes | P1 |
| R8 | NavBar linkek | Hardcode-olt 16px margin; a nav-linkek magassága rendben, de az aktív állapot jelzése keskeny | Alacsony | P2 |
| R9 | Horizontális scroll-veszély | Hosszú, törésmentes stringek (recept-cím, URL-ek) `Text` truncation nélkül néhol (detail meta-sor, HeaderSearch találatok) | Alacsony | P2 |
| R10 | Motion mobilon | A tervezett `layout` grid-animáció 30+ kártyánál low-end eszközön jank-veszély | Közepes | P1 (megelőző szabály) |

---

## 2. Kódszintű javítások

### R1 — Recept-detail két hasáb: `md` → `lg` töréspont + sticky offset

```tsx
// RecipeDetailClient.tsx — Grid oszlopok
<Grid gutter="xl">
  {/* volt: span={{ base: 12, md: 7 }} */}
  <Grid.Col span={{ base: 12, lg: 7 }}>{/* leírás, lépések */}</Grid.Col>
  <Grid.Col span={{ base: 12, lg: 5 }}>
    {/* sticky csak lg-től — tablet/mobil: normál flow */}
    <Box style={{ position: 'sticky', top: 'calc(60px + var(--mantine-spacing-md))' }} visibleFrom="lg">
      <IngredientsCard /* ... */ />
    </Box>
    <Box hiddenFrom="lg">
      <IngredientsCard /* ... */ />
    </Box>
  </Grid.Col>
</Grid>
```

Indok: 62–75em között (kis laptop/tablet fekvő) a 7/5-ös osztás mindkét hasábot összenyomja; `lg`-ig az egyhasábos elrendezés olvashatóbb, és a sticky sem ütközik a headerrel.

### R2 — Hero kép responsive magasság

```tsx
// volt: h={420}
<Image
  src={imgSrc}
  alt={title}
  h={{ base: 220, sm: 300, lg: 420 }}
  fit="cover"
  radius="lg"
/>
```

### R3 — Touch targetek: minimum 44px mobilon

```tsx
// RecipeCard favorite gomb — volt: size="md" (28px)
<ActionIcon
  size={44}
  radius="xl"
  variant="light"
  aria-label={isFavorite ? translate('favorites.remove') : translate('favorites.add')}
>
  <IconHeart size={22} />
</ActionIcon>

// StepsSection fel/le nyilak — csoportosan:
<Group gap={4}>
  <ActionIcon size={{ base: 44, sm: 32 } as never /* Mantine size nem responsive → wrapper: */} />
</Group>
```

Mivel az `ActionIcon size` nem fogad responsive objektumot, a mintát CSS-szel érdemes megoldani — egy közös utility class:

```css
/* globals.css */
@media (max-width: 48em) {
  .touch-target {
    min-width: 44px;
    min-height: 44px;
  }
}
```

```tsx
<ActionIcon className="touch-target" size="md" /* ... */ />
```

Érintett helyek: RecipeCard `FavoriteButton`, Steps/Ingredients sor-akciók (fel/le/törlés), ThemeSwitcher, Burger (a Mantine Burger 34px — `size="lg"`-re állítandó mobilon), RecipeRating csillagai (a Mantine `Rating` `size="lg"` mobilon).

### R4 — Footer mobil spacing

A [footer-redesign-2026-08-30.md](footer-redesign-2026-08-30.md) mindhárom variánsa javítja (`gap` 4→6/xs, linkek `size="sm"`, `paddingBlock: 4`).

### R5 — Header keskeny viewporton

```tsx
// Header: a search mobilon ikonná csökken, spotlight-ot nyit (a @mantine/spotlight már dependency)
<Group h="100%" px="md" justify="space-between" wrap="nowrap">
  <Logo variant="icon" withText hideTextOnMobile href={PUBLIC_ROUTES.HOME} />
  <Group gap="xs" wrap="nowrap">
    <Box visibleFrom="sm" w={{ sm: 220, md: 280 }}>
      <HeaderSearch />
    </Box>
    <ActionIcon hiddenFrom="sm" className="touch-target" variant="subtle" aria-label={t('search.open')}>
      <IconSearch size={20} />
    </ActionIcon>
    {/* auth gomb, theme switcher, burger */}
  </Group>
</Group>
```

Indok: <360px-en a szabad szélesség nem elég a beágyazott search inputnak; az ikon→spotlight minta megszünteti a törést és nagyobb keresőfelületet is ad.

### R6 — Szűrősáv mobilon

- A szűrő-controlok mobilon `size="md"` (magasabb input = jobb tap):
  ```tsx
  const isMobile = useMediaQuery('(max-width: 48em)');
  <Select size={isMobile ? 'md' : 'sm'} /* ... */ />
  ```
- A collapse animáció: [ux-motion-upgrade-plan](ux-motion-upgrade-plan-2026-08-30.md) 3.2 (`AnimatePresence` height-collapse).
- A szűrő-összefoglaló (aktív szűrők száma) badge-ként a toggle gombon: `rightSection={<Badge size="xs">{activeCount}</Badge>}` — mobilon zárt állapotban is látszik, mi aktív.

### R7 — RecipeComposer: sticky mobil footer-nav

```tsx
// RecipeComposer.tsx — mobil sticky action bar (a 07-06 R9 javaslat konkretizálva)
<Box
  hiddenFrom="md"
  pos="sticky"
  bottom={0}
  p="sm"
  style={{
    zIndex: 50,
    background: 'var(--mantine-color-body)',
    borderTop: '1px solid var(--mantine-color-default-border)',
    paddingBottom: 'calc(var(--mantine-spacing-sm) + env(safe-area-inset-bottom))',
  }}
>
  <Group justify="space-between" wrap="nowrap">
    <Button variant="default" onClick={goToPrevSection} disabled={isFirstSection} className="touch-target">
      {t('composer.back')}
    </Button>
    {isLastSection ? (
      <Button onClick={handleSubmit} className="touch-target">
        {t('composer.submit')}
      </Button>
    ) : (
      <Button onClick={goToNextSection} className="touch-target">
        {t('composer.next')}
      </Button>
    )}
  </Group>
</Box>
```

Indok: ma a szekcióváltás Drawer-nyitást igényel; a sticky sáv 1 tapre csökkenti, és a `env(safe-area-inset-bottom)` az iOS home-indikátor alá csúszást kezeli.

### R8 — NavBar

```tsx
// hardcode-olt margin helyett:
<Stack gap={4} p="md">
  {links.map((link) => (
    <NavLink key={link.href} /* Mantine NavLink: teljes szélességű, 40px+ magas tap-felület */ />
  ))}
</Stack>
```

### R9 — Truncation védőháló

```tsx
// bárhol, ahol user-generált cím jelenik meg egy sorban:
<Text truncate="end" /* vagy lineClamp={2} kártya-kontextusban */>{title}</Text>
```

Érintett: detail meta-sor (kategória • idő • adag), HeaderSearch dropdown találat-címei.

---

## 3. Motion mobil-teljesítmény szabályok

A [ux-motion-upgrade-plan-2026-08-30.md](ux-motion-upgrade-plan-2026-08-30.md) animációira vonatkozó kötelező korlátok:

| Szabály | Indok |
|---|---|
| `layout` animáció (grid-átrendezés) csak `md+` viewporton; mobilon opacity-only belépés | A layout-animáció minden érintett elemre transform-mérést + animációt futtat — 20-30 kártyánál low-end Androidon jank |
| Stagger elemszám-korlát: max 12 elem kap delay-t, a többi delay nélkül | A késleltetett animációk hosszan „mozgó” képernyőt adnak mobilon, ami zavaró görgetés közben |
| Egyszerre max 1 scroll-kötött animáció fusson viewportonként (ReadingProgress VAGY parallax, nem mindkettő) | A scroll-driven update minden frame-ben fut — több példány mobilon main-thread terhelés |
| `whileHover` mobilon hatástalan (nincs hover) → minden hover-mikrointerakciónak legyen `whileTap` párja vagy legyen tisztán dekoratív | A csak-hover visszajelzés mobilon elveszik |
| Repeat/infinite animációk (EmptyState ikon) `useReducedMotion()` guarddal ÉS `viewport`-on kívül állítva (`useInView`-val pause) | Végtelen animáció akkumulátor-fogyasztó, ha képernyőn kívül is fut |
| Minden animáció transform/opacity — soha `width/height/top/left` (kivéve az egyszeri height-collapse-ot) | Compositor-only animáció = 60fps mobilon is |

Ellenőrzés: Chrome DevTools → Performance, 4× CPU throttling + „Lighthouse mobile” futtatás a listaoldalon az animációk bevezetése után (ingyenes, lásd backlog N-P2-8 LHCI).

## 4. Tesztelési javaslat

- Playwright-projekt bővítés mobil viewporttal (`devices['iPhone 12']`, `devices['Pixel 7']`) legalább a smoke + navigation suite-okra — a `playwright.config.ts`-ben új project-bejegyzés, ingyenes.
- Vizuális gyorsellenőrzési lista minden UI-PR-hoz: 320px, 375px, 768px, 1024px, 1440px szélességen nincs horizontális scroll (`document.documentElement.scrollWidth <= innerWidth` assert a smoke tesztben).

# ✨ Cookbook-Next — UX / Design / Motion upgrade terv

> **Dátum**: 2026-08-30
> **Stack-kontextus**: `motion@13` (`motion/react` import), globális `MotionConfig reducedMotion="user"`, közös [transitions.ts](../src/lib/motion/transitions.ts) (`MOTION_TRANSITION.fast/standard/slow/interactive`), [MotionContainer](../src/lib/motion/components.ts). Szigorú, **nonce-alapú CSP** (proxy generálja) — lásd 1.3.

---

## 1. Motion audit — jelenlegi állapot

### 1.1 Ahol már van motion (39 fájl)

| Terület | Mi van | Minőség |
|---|---|---|
| Auth formok (Login/SignUp/ResetPassword) | Container-fade + mezőnkénti stagger (0.07–0.08s), hiba-shake, success-pulse, `AnimatePresence mode="wait"` swap | ✅ Referencia-minőség — ez a stílus-etalon |
| Cookie/privacy policy | `ReadingProgress`: `useScroll` + `useSpring`, reduced-motion-nál rejtve | ✅ Jó |
| Recept-detail | `useInView` szekció-reveal, `LayoutGroup` lépés-kiemelés, hozzávaló-checklist layout animáció | ✅ Jó |
| Mikro-interakciók | Logo/AuthButton spring hover/tap, ThemeSwitcher ikon-swap, FavoriteButton burst | ✅ Jó |
| RecipeRating | scale/opacity visszajelzés értékelés után | 🟡 refetch-lag rontja (lásd backlog N-P1-10) |

### 1.2 Ahol hiányzik (ez a terv tárgya)

| # | Hely | Hiány | UX-indok (miért nem dekoráció) |
|---|---|---|---|
| M1 | RecipeCard + listák | Nincs belépő/hover motion, nincs lista-átrendezési animáció | A szűrés/rendezés/Load More eredménye ma „ugrik” — az animáció **vizuális kontinuitást** ad: a user látja, mi került be/ki, nem veszti el a kontextust |
| M2 | RecipesPage szűrősáv | Mantine `Transition` (abrupt) | Az `AnimatePresence` height-collapse jelzi, hogy a tartalom *ugyanaz maradt*, csak a szűrő nyílt/záródott |
| M3 | Skeleton → tartalom | Hard swap | Crossfade csökkenti az észlelt betöltési időt (perceived performance) |
| M4 | HomePage carousel + szekciók | Statikus | Scroll-reveal irányítja a figyelmet a fold alatti tartalomra |
| M5 | Footer | Statikus | Lásd [footer-redesign-2026-08-30.md](footer-redesign-2026-08-30.md) |
| M6 | Back-to-top gomb | Nincs | Hosszú listáknál (RecipesPage) navigációs alapfunkció |
| M7 | Üres állapotok | Nincs egységes EmptyState | Az üres lista ma „hibának” tűnhet; animált empty state megnyugtat + akciót ajánl |
| M8 | Modal/Drawer | Mantine beépített transition | **Nem bántjuk** — a Mantine transitionök konzisztensek és CSP-safe-ek; motionre cserélni öncélú lenne |
| M9 | Page transition | Nincs | Csak minimál fade-et javaslunk (1.4) — az agresszív route-transition App Routerben törékeny |

### 1.3 Keretfeltételek (minden javaslatra érvényes)

- **prefers-reduced-motion**: a globális `MotionConfig reducedMotion="user"` a transform/opacity animációkat automatikusan kikapcsolja. Minden itt javasolt animáció transform/opacity-alapú, tehát **magától lekapcsol**. Ahol logika is függ tőle (pl. autoplay, scroll-driven progress), ott explicit `useReducedMotion()` guard kell — jelezve az adott pontnál.
- **CSP**: a motion **style attribútumot** ír, nem `<style>` taget injektál → a nonce-alapú `style-src`/`script-src` policyt nem sérti. Kerülendő: bármilyen lib, ami runtime `<style>`-t szúr be nonce nélkül.
- **StrictMode-kompatibilitás (kötelező minta!)**: a `whileInView` + `viewport={{ once: true }}` páros React 18/19 StrictMode-ban dupla effect-mount miatt vissza tud ugrani a `hidden` variánsba („felvillan, eltűnik, újra beúszik”). Helyette a **`useInView` hook + `animate` prop** mintát használjuk — a repo recept-detail kódja már ezt csinálja, az új komponensek is ezt kövessék (lásd 2.1 `Reveal`).
- **Server/Client határ**: az animált részek kis, célzott `'use client'` levelek maradnak; a SEO-releváns tartalom (recept-adat, legal szöveg) szerveroldali. Egyetlen oldal se váljon client component-té csak az animáció miatt.

---

## 2. Közös építőelemek (először ezeket)

### 2.1 `Reveal` — StrictMode-safe scroll-reveal wrapper

```tsx
// src/lib/motion/Reveal.tsx
'use client';

import { motion, useInView } from 'motion/react';
import { type PropsWithChildren, useRef } from 'react';
import { MOTION_TRANSITION } from './transitions';

type RevealProps = PropsWithChildren<{
  /** Késleltetés másodpercben — stagger-hatáshoz szekvenciális elemeknél */
  delay?: number;
  /** Az elem mekkora részének kell látszania a triggerhez */
  amount?: number;
  y?: number;
}>;

export const Reveal = ({ children, delay = 0, amount = 0.25, y = 16 }: RevealProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y }}
      animate={isInView ? { opacity: 1, y: 0 } : undefined}
      transition={{ ...MOTION_TRANSITION.slow, delay }}
    >
      {children}
    </motion.div>
  );
};
```

*Reduced motion*: a `MotionConfig` miatt transform/opacity nem animál → az elem azonnal látható. Nincs extra teendő.

### 2.2 Lista-animációs variánsok (stagger)

```ts
// src/lib/motion/variants.ts
import type { Variants } from 'motion/react';
import { MOTION_TRANSITION } from './transitions';

export const listVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05, delayChildren: 0.05 } },
};

export const listItemVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: MOTION_TRANSITION.standard },
};
```

---

## 3. Oldal/komponens szerinti terv

### 3.1 RecipeCard — belépés, hover, átrendezés (M1) — P1

**Miért**: a szűrés/rendezés ma teljes „content swap”; a `layout` animáció megtartja a térbeli kontinuitást, a hover-lift pedig az interaktivitást jelzi (a mostani CSS-hover marad az alap, a motion a tap-visszajelzést adja hozzá).

```tsx
// RecipesPage / listák: a grid-et motion-szülővé tesszük
import { AnimatePresence, motion } from 'motion/react';
import { listItemVariants, listVariants } from '@/lib/motion/variants';

<SimpleGrid
  component={motion.div}
  variants={listVariants}
  initial="hidden"
  animate="visible"
  cols={{ base: 1, sm: 2, lg: 3 }}
>
  <AnimatePresence mode="popLayout">
    {recipes.map((recipe) => (
      <motion.div
        key={recipe.id}
        layout // szűrés/rendezés: az elemek CSINÁLJÁK végig az utat az új helyükre
        variants={listItemVariants}
        exit={{ opacity: 0, scale: 0.96, transition: MOTION_TRANSITION.fast }}
        whileTap={{ scale: 0.98 }}
      >
        <RecipeCard {...recipe} />
      </motion.div>
    ))}
  </AnimatePresence>
</SimpleGrid>
```

Megjegyzések:
- `mode="popLayout"`: kilépő kártya nem tolja szét a gridet.
- A stagger csak az **első** renderre fut (variants a szülőn `initial`-lel); Load More-nál az új elemek `listItemVariants`-szal lépnek be, a régiek nem animálnak újra.
- Teljesítmény: `layout` animáció 30+ kártyánál mobilon drága lehet → `layout` csak `md+` viewporton (`useMediaQuery`), mobilon csak opacity-belépés. (Részletek: [responsive-audit-2026-08-30.md](responsive-audit-2026-08-30.md) 5. szekció.)

### 3.2 RecipesPage — szűrősáv nyitás/zárás (M2) — P1

```tsx
<AnimatePresence initial={false}>
  {filtersOpen && (
    <motion.div
      key="filters"
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={MOTION_TRANSITION.standard}
      style={{ overflow: 'hidden' }}
    >
      <RecipeFilters /* ... */ />
    </motion.div>
  )}
</AnimatePresence>
```

**Miért**: a height-animáció megtartja a lista pozícióját a user szeme előtt; az abrupt mount/unmount ma „ugráltatja” a tartalmat.

### 3.3 Skeleton → tartalom crossfade (M3) — P1

```tsx
// pl. RecipesPage listablokk
<AnimatePresence mode="wait" initial={false}>
  {loading ? (
    <motion.div key="skeleton" exit={{ opacity: 0 }} transition={MOTION_TRANSITION.fast}>
      <RecipeListSkeleton count={6} />
    </motion.div>
  ) : (
    <motion.div key="content" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      {/* 3.1 szerinti grid */}
    </motion.div>
  )}
</AnimatePresence>
```

**Miért**: a hard swap „villan”; a 150 ms-os crossfade folytonossá teszi a betöltést. A skeletonok mérete egyezzen a kártyákéval (layout shift = 0).

### 3.4 HomePage — hero + szekció-reveal + carousel (M4) — P1

- Hero cím/CTA: a meglévő auth-form stagger-mintával (container-fade + gyerekenként 0.07s) — egységes „brand-mozgás”.
- Szekciók (Latest recipes, Recently viewed): `<Reveal>` wrapper, szekciónként +0.05s delay.
- Carousel-slide-ok: **nem** kapnak egyenkénti whileInView-t (horizontális scrollnál zajos); ehelyett a carousel-konténer kap egy `Reveal`-t. A slide-váltás az Embla beépített animációja marad.

**Miért**: a fold alatti tartalom felfedezhetőségét növeli; a szekvenciális reveal olvasási sorrendet sugall.

### 3.5 Back-to-top gomb (M6) — P1

```tsx
// src/components/BackToTop/BackToTop.tsx
'use client';

import { ActionIcon } from '@mantine/core';
import { IconArrowUp } from '@tabler/icons-react';
import { AnimatePresence, motion, useReducedMotion, useScroll } from 'motion/react';
import { useEffect, useState } from 'react';
import { MOTION_TRANSITION } from '@/lib/motion/transitions';

export const BackToTop = () => {
  const { scrollY } = useScroll();
  const [visible, setVisible] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => scrollY.on('change', (y) => setVisible(y > 600)), [scrollY]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
          transition={MOTION_TRANSITION.standard}
          style={{ position: 'fixed', right: 20, bottom: 84, zIndex: 100 }}
        >
          <ActionIcon
            size={44} // ≥44px touch target
            radius="xl"
            variant="filled"
            aria-label="Back to top"
            onClick={() =>
              window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' })
            }
          >
            <IconArrowUp size={20} />
          </ActionIcon>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
```

*Reduced motion*: a gomb megjelenik (opacity-fallback), de a scroll `behavior: 'auto'` — explicit guard, mert a smooth scroll nem transform-animáció.

### 3.6 Üres állapotok (M7) — P1

Egységes `EmptyState` komponens (ikon + cím + leírás + opcionális CTA), enyhe „lélegző” ikonnal:

```tsx
'use client';

import { Button, Stack, Text, ThemeIcon, Title } from '@mantine/core';
import { motion } from 'motion/react';

export const EmptyState = ({ icon, title, description, action }: EmptyStateProps) => (
  <Stack align="center" gap="sm" py="xl">
    <motion.div
      animate={{ y: [0, -6, 0] }}
      transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' }}
    >
      <ThemeIcon size={64} radius="xl" variant="light">
        {icon}
      </ThemeIcon>
    </motion.div>
    <Title order={3}>{title}</Title>
    <Text c="dimmed" ta="center" maw={420}>
      {description}
    </Text>
    {action && <Button mt="sm">{action.label}</Button>}
  </Stack>
);
```

Használat: kedvencek/saját receptek/követések üres listái, keresés találat nélkül. **Miért**: az üres képernyő ma megkülönböztethetetlen a hibától; az empty state akciót ad (pl. „Browse recipes”). *A repeat-animáció `useReducedMotion()` guardot kap.*

### 3.7 Page transition (M9) — P2, minimál

Csak egy 150 ms-os fade a fő tartalomra, `template.tsx`-szel:

```tsx
// src/app/template.tsx
'use client';

import { motion } from 'motion/react';
import { MOTION_TRANSITION } from '@/lib/motion/transitions';

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={MOTION_TRANSITION.fast}>
      {children}
    </motion.div>
  );
}
```

**Miért csak ennyi**: exit-animáció App Router route-váltásnál megbízhatatlan (a kilépő fa azonnal unmountol); a belépő fade viszont olcsó, konzisztens, és a toploaderrel együtt teljes „navigációs nyelvet” ad. Ha zavarná a scroll-restorationt, elhagyható.

### 3.8 Admin felület

Az admin táblák/statkártyák motion-mintái az [admin-panel-plan-2026-08-30.md](admin-panel-plan-2026-08-30.md) 6. szekciójában — ugyanezekre az építőelemekre (Reveal, listVariants, AnimatePresence) épülnek.

---

## 4. Vizuális/design finomítások (motion nélkül)

| # | Terület | Probléma | Javaslat | Prio |
|---|---|---|---|---|
| V1 | Kártya-hierarchia | A RecipeCard CSS-hover (translateY −4px) és a motion-minták keverednek | Egy forrás: a hover-lift maradjon CSS-ben (olcsóbb), a motion csak belépés/exit/tap — dokumentálva a variants fájlban | P1 |
| V2 | Tipográfia | A section-címek (HomePage/RecipesPage) mérete/margója oldalanként eltér | Közös `SectionTitle` komponens (`Title order={2} size="h3" mb="md"`) | P2 |
| V3 | Spacing | Vegyes `mt/mb` értékek szekciók között | Szekció-spacing konvenció: oldalak `Stack gap="xl"`-lel tagolnak, ad-hoc margók helyett | P2 |
| V4 | darkTheme | A darkTheme overridejai dead code-ok (nincs bekötve) | `SchemeAwareTheme` bekötése — backlog N-P1-6, e terv előfeltétele a sötét módú kontraszt-finomításnak | P1 |
| V5 | Gomb-hierarchia | Több oldalon 2+ filled gomb versenyez | Oldalanként max 1 filled primary; másodlagos akciók `light`/`subtle` variánsok | P2 |
| V6 | Fókusz-állapotok | A motion-os elemeken (Logo, AuthButton) a fókuszgyűrű a transform alatt elmozdul | `focus-visible` ring a wrapperen, ne az animált gyereken | P2 |

## 5. Bevezetési sorrend

1. **Üteme 1 (alapok)**: `Reveal` + `variants.ts` + V4 (darkTheme bekötés) — minden más erre épül.
2. **Üteme 2 (listák)**: 3.1 kártya-grid + 3.3 skeleton crossfade + 3.2 szűrősáv.
3. **Üteme 3 (oldalak)**: 3.4 HomePage, 3.5 BackToTop, 3.6 EmptyState, footer (külön doksi).
4. **Üteme 4 (polish)**: 3.7 page fade, V2/V3/V5/V6.

Minden ütem után: `pnpm test:unit` + Playwright smoke + kézi ellenőrzés `prefers-reduced-motion: reduce` beállítással (macOS: Settings → Accessibility → Display → Reduce motion), és **production buildben is** (StrictMode dev-duplázás kizárására).

# 🎨 Cookbook — Logó-koncepciók

> **Dátum**: 2026-08-30
> **Brand-kontextus**: primary `#E00890` (pink.7), gradiens-pár `violet` (#6741D9 körny.), accent `teal` (#12B886 körny.), meleg szürkeskála. A jelenlegi logó PNG (light/dark variáns, [Logo.tsx](../src/components/Logo/Logo.tsx) `next/image`-dzsel tölti).
> **CSP-megjegyzés**: minden alábbi SVG **kizárólag prezentációs attribútumokat** használ (`fill`, `stroke`) — nincs `<script>`, nincs `style` attribútum/tag, így a szigorú nonce-alapú CSP-vel és SVG-favicon használattal is kompatibilis. A 8. koncepció animációját a `motion` végzi React-oldalon, nem az SVG-be ágyazott SMIL/CSS.

Minden variáns `viewBox="0 0 64 64"` (a wordmark kivételével), így favicon-mérettől hero-méretig skálázódik.

---

## 1. „C-kanál” — minimalista monogram

A C betű íve egy kanál sziluettjét formálja negatív térrel. Faviconként is olvasható.

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" role="img" aria-label="Cookbook">
  <path
    d="M32 6C17.6 6 6 17.6 6 32s11.6 26 26 26c7.9 0 15-3.5 19.8-9.1l-6.1-5.2C42.3 47.7 37.4 50 32 50c-9.9 0-18-8.1-18-18s8.1-18 18-18c5.4 0 10.3 2.3 13.7 6.3l6.1-5.2C47 9.5 39.9 6 32 6z"
    fill="#E00890"
  />
  <ellipse cx="44" cy="32" rx="7" ry="9" fill="#E00890" />
  <rect x="41.5" y="38" width="5" height="16" rx="2.5" fill="#E00890" transform="rotate(-18 44 46)" />
</svg>
```

- **Miért illik**: a monogram + eszköz-motívum egyszerre brand-betű és „konyha”; egyszínű → minden felületen működik.
- **Hol**: favicon (16–32px), header-ikon, app-ikon.

## 2. „Nyitott könyv-tányér” — ikonikus

Nyitott szakácskönyv, amelynek lapjai tányérrá záródnak; villa/kanál a két oldalon.

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" role="img" aria-label="Cookbook">
  <circle cx="32" cy="34" r="24" fill="#FFEBF5" />
  <path d="M32 16c-6-4-14-4-20-1v30c6-3 14-3 20 1 6-4 14-4 20-1V15c-6-3-14-3-20 1z" fill="#E00890" />
  <path d="M32 16v30" stroke="#FFEBF5" stroke-width="2.5" stroke-linecap="round" />
  <path d="M18 24c3-1 7-1 10 0M18 31c3-1 7-1 10 0M36 24c3-1 7-1 10 0M36 31c3-1 7-1 10 0"
    stroke="#FFEBF5" stroke-width="2.5" stroke-linecap="round" fill="none" />
</svg>
```

- **Miért illik**: szó szerinti „cookbook”; a halvány pink tányér-háló mélységet ad, mégis 2 szín.
- **Hol**: header (32–40px), social preview középelem, üres állapot illusztráció-alap.

## 3. „Hexa-fazék” — geometrikus/modern

Hatszögbe zárt, minimál fazék gőz-ívekkel; tech-esebb karakter.

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" role="img" aria-label="Cookbook">
  <path d="M32 4 56 18v28L32 60 8 46V18z" fill="none" stroke="#E00890" stroke-width="4" stroke-linejoin="round" />
  <path d="M20 34h24v6a8 8 0 0 1-8 8h-8a8 8 0 0 1-8-8z" fill="#E00890" />
  <path d="M17 34h30" stroke="#E00890" stroke-width="3" stroke-linecap="round" />
  <path d="M26 26c0-3 3-3 3-6M35 26c0-3 3-3 3-6" stroke="#6741D9" stroke-width="3" stroke-linecap="round" fill="none" />
</svg>
```

- **Miért illik**: a violet gőz behozza a meglévő pink→violet gradiens-párost; geometrikus, jól kicsinyíthető.
- **Hol**: app-ikon, PWA maskable icon (a hexagon jól tűri a maszkolást), dev-anyagok.

## 4. „Kézzel rajzolt habverő-szív” — organikus

Laza, kézi vonalvezetésű habverő, amelynek feje szívformát ír le — közösségi, hobbi jelleg.

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" role="img" aria-label="Cookbook">
  <path d="M32 14c-4-6-13-6-16 0-3 5 1 11 6 15l10 8 10-8c5-4 9-10 6-15-3-6-12-6-16 0z"
    fill="none" stroke="#E00890" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
  <path d="M26 34c1 5 3 9 6 12 3-3 5-7 6-12" fill="none" stroke="#E00890" stroke-width="3.5" stroke-linecap="round" />
  <rect x="29" y="44" width="6" height="14" rx="3" fill="#E00890" />
</svg>
```

- **Miért illik**: a szív + konyhaeszköz a „szeretettel főzés” üzenete; a vastag, kerek vonalvégek barátságosak — a Mantine `defaultRadius: md` lekerekítés-nyelvével rímel.
- **Hol**: empty state-ek, onboarding, 404 oldal; headerben kevésbé (részletgazdag).

## 5. „Recept-pecsét” — badge/embléma

Körpecsét felirattal és csillag-elválasztókkal; klasszikus, „minőségi jelvény” hangulat.

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" role="img" aria-label="Cookbook badge">
  <circle cx="32" cy="32" r="29" fill="none" stroke="#E00890" stroke-width="3" />
  <circle cx="32" cy="32" r="22" fill="none" stroke="#E00890" stroke-width="1.5" stroke-dasharray="2 3" />
  <path d="M32 22a6 6 0 0 1 6 6c0 4-6 10-6 10s-6-6-6-10a6 6 0 0 1 6-6z" fill="#E00890" />
  <path id="badge-arc" d="M32 9a23 23 0 0 1 0 46 23 23 0 0 1 0-46" fill="none" />
  <text font-family="Georgia, 'Times New Roman', serif" font-size="8.5" font-weight="700"
    fill="#E00890" letter-spacing="2.5">
    <textPath href="#badge-arc" startOffset="2%">COOKBOOK</textPath>
    <textPath href="#badge-arc" startOffset="56%">EST. 2026</textPath>
  </text>
</svg>
```

- **Miért illik**: „kurátori” érzet — jól használható „featured recipe” jelvényként is, nem csak logóként.
- **Hol**: social preview sarok-pecsét, print-nézet fejléce, marketing. Faviconnak túl részletes.

## 6. Wordmark — egyedi tipográfiával

A két `o` betű tányér/serpenyő formát kap; a második `o`-ból serpenyőnyél.

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 64" role="img" aria-label="Cookbook">
  <text x="0" y="44" font-family="'Avenir Next', 'Segoe UI', system-ui, sans-serif"
    font-size="40" font-weight="700" fill="#26262B" letter-spacing="-1">c</text>
  <circle cx="45" cy="31" r="14" fill="none" stroke="#E00890" stroke-width="7" />
  <circle cx="81" cy="31" r="14" fill="none" stroke="#E00890" stroke-width="7" />
  <rect x="93" y="27.5" width="16" height="7" rx="3.5" fill="#E00890" />
  <text x="112" y="44" font-family="'Avenir Next', 'Segoe UI', system-ui, sans-serif"
    font-size="40" font-weight="700" fill="#26262B" letter-spacing="-1">kbook</text>
</svg>
```

- **Miért illik**: a serpenyős `oo` egyedi, mégis olvasható; a szöveg system-font-stackkel a zero-font-loading elvet követi (theme-konvenció).
- **Hol**: header desktopon (ikon+szöveg helyett egyetlen elem), e-mail fejléc, README.

## 7. Sötét/világos téma-pár

Ugyanaz a geometria, előre elkészített színpárral — a `Logo` komponens `LOGO_SRC_LIGHT/DARK` mintájához igazodik. (Az 1. koncepció párosítva; bármelyik másikra átvihető.)

```svg
<!-- light háttérre: logo-light.svg -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" role="img" aria-label="Cookbook">
  <rect x="0" y="0" width="64" height="64" rx="14" fill="#FFEBF5" />
  <path d="M32 10C19.8 10 10 19.8 10 32s9.8 22 22 22c6.7 0 12.7-3 16.7-7.7l-5.1-4.4C40.7 45.1 36.6 47 32 47c-8.3 0-15-6.7-15-15s6.7-15 15-15c4.6 0 8.7 1.9 11.6 5.1l5.1-4.4C44.7 13 38.7 10 32 10z" fill="#E00890" />
  <ellipse cx="42" cy="32" rx="6" ry="7.5" fill="#AD1374" />
</svg>
```

```svg
<!-- dark háttérre: logo-dark.svg -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" role="img" aria-label="Cookbook">
  <rect x="0" y="0" width="64" height="64" rx="14" fill="#26262B" />
  <path d="M32 10C19.8 10 10 19.8 10 32s9.8 22 22 22c6.7 0 12.7-3 16.7-7.7l-5.1-4.4C40.7 45.1 36.6 47 32 47c-8.3 0-15-6.7-15-15s6.7-15 15-15c4.6 0 8.7 1.9 11.6 5.1l5.1-4.4C44.7 13 38.7 10 32 10z" fill="#EC3EA4" />
  <ellipse cx="42" cy="32" rx="6" ry="7.5" fill="#FFC9E5" />
</svg>
```

- **Miért illik**: a dark variáns a `primaryShade: { dark: 5 }` döntést követi (#EC3EA4 világosabb pink, kontraszt ≥ 4,5:1 sötét háttéren). SVG-re váltással a jelenlegi PNG-swap logika (`useComputedColorScheme`) változatlanul használható, de élesebb minden DPI-n.
- **Hol**: a teljes jelenlegi light/dark logó-infrastruktúra 1:1 cseréje.

## 8. Animált logó — motion-alapú path-rajzolás (betöltéskor)

Az SVG maga statikus (CSP-safe); az animációt a React-komponens adja `motion/react`-tel: a C-ív „megrajzolódik”, a kanálfej beúszik.

```tsx
// src/components/Logo/AnimatedLogo.tsx
'use client';

import { motion, useReducedMotion } from 'motion/react';

export const AnimatedLogo = ({ size = 64 }: { size?: number }) => {
  const prefersReducedMotion = useReducedMotion();

  return (
    <svg width={size} height={size} viewBox="0 0 64 64" role="img" aria-label="Cookbook">
      <motion.path
        d="M50 15A22 22 0 1 0 50 49"
        fill="none"
        stroke="#E00890"
        strokeWidth="7"
        strokeLinecap="round"
        initial={prefersReducedMotion ? false : { pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.7, ease: 'easeInOut' }}
      />
      <motion.ellipse
        cx="42" cy="32" rx="6" ry="7.5"
        fill="#E00890"
        initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.55, type: 'spring', stiffness: 380, damping: 30 }}
      />
    </svg>
  );
};
```

- **Miért illik**: a meglévő `MOTION_TRANSITION.interactive` spring-karakterét használja; `prefers-reduced-motion`-nél azonnal kész állapotban renderel (`initial={false}`).
- **Hol**: splash/első betöltés, login oldal, 404 — **nem** a headerben (ott zavaró lenne minden navigációnál).

---

## Összehasonlító táblázat

| # | Stílus | Favicon | Header | Social/OG | Skálázhatóság | Megvalósítási költség |
|---|---|---|---|---|---|---|
| 1 | Monogram | ✅✅ | ✅ | ✅ | Kiváló | S |
| 2 | Ikonikus könyv-tányér | ✅ | ✅✅ | ✅ | Jó | S |
| 3 | Geometrikus hexa | ✅✅ | ✅ | 🟡 | Kiváló | S |
| 4 | Organikus habverő-szív | 🟡 | 🟡 | ✅ | Közepes | S |
| 5 | Badge/embléma | ❌ | 🟡 | ✅✅ | Nagy méretben jó | S |
| 6 | Wordmark | ❌ | ✅✅ (desktop) | ✅ | Szélességfüggő | S |
| 7 | Light/dark pár | ✅✅ | ✅✅ | ✅ | Kiváló | S (drop-in csere) |
| 8 | Animált (motion) | — | ❌ | — | — | S/M |

**Ajánlott kombináció**: **#1 vagy #7** ikonként (favicon+header) + **#6 wordmark** desktopon + **#8** a login/404 oldalra. A #2 és #4 empty-state illusztrációként hasznosulhat akkor is, ha nem lesz fő logó.

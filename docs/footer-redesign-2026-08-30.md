# 🦶 Cookbook-Next — Footer redesign koncepciók

> **Dátum**: 2026-08-30
> **Megvalósítási státusz (2026-09-27)**: a **C — Showcase** variáns elkészült. A footer egyetlen responsive blokk: brand-sáv CTA-val, három oszlop és copyright sor; a dokumentumfolyam végén jelenik meg. Részletek a 7. szekcióban.
> **Kötöttségek**:
> - Az e2e tesztek ([footer.cases.ts](../../e2e/test-cases/footer.cases.ts)) a `footer-copyright`, `footer-privacy`, `footer-cookie` `data-testid`-kre támaszkodnak — **mindhárom variáns megőrzi őket**.
> - i18n: `footer.*` namespace (next-intl), route-ok a [routes.ts](../src/types/routes.ts) route-konstansaiból.
> - A shell testid-k (`shell-main`, `shell-footer`) és a footer e2e testid-k megmaradnak; a footer tesztcélpontok egyszer szerepelnek, nincs mobil/desktop duplikáció.

Minden variánshoz szükséges új fordítási kulcsok a 5. szekcióban.

---

## 1. Variáns A — „Refined minimal” (drop-in csere, azonos magasság)

**Struktúra**: változatlan tartalom, rendezettebb hierarchia + finom felső border + motion-réteg. A legkisebb kockázatú frissítés: az AppShell-magasság marad.

- Vizuális: `borderTop 1px` (`--mantine-color-default-border`), mobil `gap` 4px → `6/xs`, linkek `size="sm"` mobilon (nagyobb touch target).
- Motion: egyszeri fade-in-up a footer tartalmán (`useInView`, StrictMode-safe), link-hover underline a Mantine `underline="hover"`-rel (marad CSS).

```tsx
// src/components/Footer/Footer.tsx
'use client';

import { Anchor, Box, Group, Stack, Text } from '@mantine/core';
import Link from 'next/link';
import { motion, useInView } from 'motion/react';
import { useTranslations } from 'next-intl';
import { type FC, useRef } from 'react';
import { MOTION_TRANSITION } from '@/lib/motion/transitions';
import { PUBLIC_ROUTES } from '../../types/routes';
import { Logo } from '../Logo';

const FooterLinks: FC = () => {
  const translate = useTranslations('footer');
  return (
    <Group gap="md">
      <Anchor
        component={Link}
        href={PUBLIC_ROUTES.PRIVACY_POLICY}
        size="sm"
        c="dimmed"
        underline="hover"
        data-testid="footer-privacy"
      >
        {translate('privacy')}
      </Anchor>
      <Anchor
        component={Link}
        href={PUBLIC_ROUTES.COOKIE_POLICY}
        size="sm"
        c="dimmed"
        underline="hover"
        data-testid="footer-cookie"
      >
        {translate('cookies')}
      </Anchor>
    </Group>
  );
};

const Footer: FC = () => {
  const currentYear = new Date().getFullYear();
  const translate = useTranslations('footer');
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.4 });

  return (
    <Box
      component={motion.div}
      ref={ref}
      initial={{ opacity: 0, y: 8 }}
      animate={isInView ? { opacity: 1, y: 0 } : undefined}
      transition={MOTION_TRANSITION.slow}
      h="100%"
      style={{ borderTop: '1px solid var(--mantine-color-default-border)' }}
    >
      {/* Mobile */}
      <Stack h="100%" px="md" justify="center" align="center" gap={6} hiddenFrom="md">
        <Logo variant="icon" width={32} height={32} withText href={PUBLIC_ROUTES.HOME} />
        <Text size="xs" c="dimmed" data-testid="footer-copyright">
          {translate('copyright', { year: currentYear })}
        </Text>
        <FooterLinks />
      </Stack>
      {/* Desktop */}
      <Group h="100%" justify="space-between" align="center" px="md" visibleFrom="md">
        <Group gap="xs">
          <Logo variant="icon" width={32} height={32} withText href={PUBLIC_ROUTES.HOME} />
          <Text size="xs" c="dimmed" data-testid="footer-copyright">
            {translate('copyright', { year: currentYear })}
          </Text>
        </Group>
        <FooterLinks />
      </Group>
    </Box>
  );
};

export default Footer;
```

> Megjegyzés: a jelenlegi duplikált mobil/desktop link-blokk közös `FooterLinks`-be került — kevesebb duplikáció, az e2e testid-k egyszer definiáltak. (A `data-testid` így mindkét nézetben egyszer renderelődik egyszerre — a mobil/desktop blokk `hiddenFrom/visibleFrom` CSS-elrejtés, a Playwright `getByTestId` strict módban ütközhet: ha ez gond, a testid-t a látható variánsra kell szűrni a tesztben, vagy a variáns B-t választani, ami egyetlen responsive blokkot használ.)

**Mikor ezt válaszd**: ha gyors, biztonságos frissítés kell layout-átalakítás nélkül.

---

## 2. Variáns B — „Structured” (3 oszlopos, bővíthető)

**Struktúra**: brand-oszlop (logo + tagline) · navigáció (Explore: Recipes, Create) · jogi linkek; alul vékony copyright-sor. Egyetlen responsive `SimpleGrid` — nincs mobil/desktop duplikáció. Magasabb (~200px mobil / ~140px desktop) → az AppShell-ből kiköltöztetve (4. szekció).

- Vizuális: felső border + `Container size="lg"` igazítás a tartalommal; oszlopcímek `Text fw={600} size="sm"`; linkek `c="dimmed"` → hoverre téma-szín.
- Motion: oszloponkénti stagger-reveal (`listVariants` a közös [variants.ts](ux-motion-upgrade-plan-2026-08-30.md)-ből), link-hoverre 2px-es `x` eltolás (mikro-interakció, jelzi a kattinthatóságot).

```tsx
// src/components/Footer/Footer.tsx  (Variáns B)
'use client';

import { Anchor, Box, Container, Divider, Group, SimpleGrid, Stack, Text } from '@mantine/core';
import Link from 'next/link';
import { motion, useInView } from 'motion/react';
import { useTranslations } from 'next-intl';
import { type FC, useRef } from 'react';
import { MOTION_TRANSITION } from '@/lib/motion/transitions';
import { AUTH_ROUTES, PROTECTED_ROUTES, PUBLIC_ROUTES } from '../../types/routes';
import { Logo } from '../Logo';

const columnVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: MOTION_TRANSITION.slow },
};

type FooterLinkProps = { href: string; label: string; testId?: string };

const FooterLink: FC<FooterLinkProps> = ({ href, label, testId }) => (
  <motion.div whileHover={{ x: 2 }} transition={MOTION_TRANSITION.fast}>
    <Anchor
      component={Link}
      href={href}
      size="sm"
      c="dimmed"
      underline="hover"
      data-testid={testId}
      style={{ display: 'inline-block', paddingBlock: 4 }} // ≥28px touch target sorköz
    >
      {label}
    </Anchor>
  </motion.div>
);

const Footer: FC = () => {
  const currentYear = new Date().getFullYear();
  const translate = useTranslations('footer');
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <Box
      component="footer"
      ref={ref}
      py="xl"
      style={{ borderTop: '1px solid var(--mantine-color-default-border)' }}
    >
      <Container size="lg">
        <motion.div
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
        >
          <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="xl">
            <motion.div variants={columnVariants}>
              <Stack gap="xs">
                <Logo variant="icon" width={36} height={36} withText href={PUBLIC_ROUTES.HOME} />
                <Text size="sm" c="dimmed" maw={260}>
                  {translate('tagline')}
                </Text>
              </Stack>
            </motion.div>
            <motion.div variants={columnVariants}>
              <Stack gap={4}>
                <Text fw={600} size="sm">
                  {translate('explore')}
                </Text>
                <FooterLink href={PUBLIC_ROUTES.RECIPES} label={translate('links.recipes')} />
                <FooterLink
                  href={PROTECTED_ROUTES.RECIPES_CREATE}
                  label={translate('links.createRecipe')}
                />
                <FooterLink href={AUTH_ROUTES.SIGNUP} label={translate('links.signup')} />
              </Stack>
            </motion.div>
            <motion.div variants={columnVariants}>
              <Stack gap={4}>
                <Text fw={600} size="sm">
                  {translate('legal')}
                </Text>
                <FooterLink
                  href={PUBLIC_ROUTES.PRIVACY_POLICY}
                  label={translate('privacy')}
                  testId="footer-privacy"
                />
                <FooterLink
                  href={PUBLIC_ROUTES.COOKIE_POLICY}
                  label={translate('cookies')}
                  testId="footer-cookie"
                />
              </Stack>
            </motion.div>
          </SimpleGrid>
        </motion.div>
        <Divider my="md" />
        <Group justify="space-between" wrap="wrap" gap="xs">
          <Text size="xs" c="dimmed" data-testid="footer-copyright">
            {translate('copyright', { year: currentYear })}
          </Text>
          <Text size="xs" c="dimmed">
            {translate('madeWith')}
          </Text>
        </Group>
      </Container>
    </Box>
  );
};

export default Footer;
```

**Miért ez az ajánlott**: bővíthető (social/hírlevél oszlop később ide fér be), egyetlen responsive blokk (nincs testid-duplikáció), a link-lista SEO-barát belső linkeket ad a fő oldalakra.

---

## 3. Variáns C — „Showcase” (brand-sáv + back-to-top)

**Struktúra**: B-variáns + felső „brand-sáv”: halvány pink→violet gradiens háttércsík CTA-val („Share your first recipe”), és fix back-to-top gomb. A leglátványosabb, marketingesebb.

```tsx
// Kiegészítés a Variáns B tetejére (a <Container> elé):
<Box
  py="lg"
  style={{
    background:
      'linear-gradient(45deg, var(--mantine-color-pink-0), var(--mantine-color-violet-0))',
  }}
>
  <Container size="lg">
    <Group justify="space-between" wrap="wrap" gap="md">
      <Text fw={600}>{translate('cta.title')}</Text>
      <Button
        component={Link}
        href={PROTECTED_ROUTES.RECIPES_CREATE}
        variant="gradient"
        gradient={{ from: 'pink', to: 'violet', deg: 45 }}
        radius="xl"
      >
        {translate('cta.button')}
      </Button>
    </Group>
  </Container>
</Box>
```

- Motion: a CTA-gomb `whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}` (AuthButton-minta); a brand-sáv a `Reveal`-lel úszik be.
- **Back-to-top**: a meglévő [BackToTop](../src/components/BackToTop/BackToTop.tsx) komponens globálisan a shell része; a magasabb footerhez igazítva `bottom: 24px` pozíciót használ.
- Dark módban a CTA-sáv áttetsző pink/violet árnyalatokat kap. A címszínek explicit színséma-szelektorral váltanak, a linkek dimmed színűek és hover/fókusz állapotban téma-színt használnak.
- A „Join Cookbook” link csak kijelentkezett látogatóknak látható.

**Mikor ezt válaszd**: ha a footer aktivációs felület is legyen (signup/create funnel), nem csak jogi lábléc.

---

## 4. AppShell-integráció (B és C variánshoz)

A nagyobb footer nem fér el az `AppShell.Footer` fix magasságú, viewporthoz rögzített régiójában. A tényleges megoldás a `Shell.tsx`-ben az AppShell flex oszlopként kezelése, a Main növesztése és egy normál flow-ban következő footer-wrapper:

```tsx
// src/components/Shell/Shell.tsx
<AppShell style={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh' }}>
  <AppShell.Main style={{ flex: '1 0 auto', minHeight: 'auto' }}>
  {children}
  </AppShell.Main>
  <Box data-testid="shell-footer"><Footer /></Box>
</AppShell>
```

Rövid oldalakon a flex-grow a footert a viewport aljára tolja. Hosszú oldalakon a Main a tartalommal együtt nő, ezért a footer a tartalom után görgethető, nem rögzül a képernyő aljára. A wrapper a `--app-shell-navbar-offset` változóval veszi figyelembe a desktop navbart. Immersive create/edit útvonalakon továbbra sincs shell footer.

## 5. Új i18n kulcsok (mindhárom locale-ba)

```jsonc
// src/locales/en-gb.json — a meglévő "footer" namespace bővítése
"footer": {
  "copyright": "© {year} Cookbook. All rights reserved.",
  "privacy": "Privacy Policy",
  "cookies": "Cookie Policy",
  "tagline": "Discover, cook and share recipes you love.",      // B, C
  "explore": "Explore",                                          // B, C
  "legal": "Legal",                                              // B, C
  "links": {
    "recipes": "Browse recipes",
    "createRecipe": "Create a recipe",
    "signup": "Join Cookbook"
  },
  "madeWith": "Made with ❤ and Next.js",                        // B, C — opcionális
  "cta": {
    "title": "Ready to cook something new?",                     // C
    "button": "Share your first recipe"                          // C
  }
}
```

(`hu.json`, `de.json`: megfelelő fordításokkal — a kulcsstruktúra azonos.)

## 6. Összehasonlítás és döntés

| Szempont | A — Refined minimal | B — Structured | C — Showcase |
|---|---|---|---|
| Munkaigény | S | M | M/L |
| Layout-változás | Nincs | AppShell-átalakítás | AppShell-átalakítás |
| SEO belső linkek | — | ✅ | ✅ |
| Konverziós elem | — | — | ✅ CTA |
| E2E teszt-hatás | Minimális | Minimális (testid-k maradnak) | Testid-k megmaradnak, egyediségük ellenőrzött |
| Kockázat | Minimális | Alacsony | Közepes (gradiens dark módban tesztelendő) |

**Döntés**: a **C variáns** valósult meg. Az A és B változat a korábbi alternatív koncepciók dokumentációjaként marad itt; nem a jelenlegi komponens leírásai.

## 7. Megvalósított C variáns

- A [Footer.tsx](../src/components/Footer/Footer.tsx) egy szemantikus `footer` landmarkot renderel, benne CTA-sávval, `SimpleGrid`-del, Explore/Legal navigációval és copyright sorral.
- Az animáció a közös `Reveal`, `listVariants` / `listItemVariants` és `MOTION_TRANSITION` megoldásokat használja. A scroll-reveal `useInView` alapú, nem `whileInView`.
- A CTA a `/recipes/create` route-ra vezet; a signup link csak kijelentkezett session esetén jelenik meg.
- A footer útvonalak a `PUBLIC_ROUTES`, `PROTECTED_ROUTES` és `AUTH_ROUTES` konstansokból származnak. Az új fordítási kulcsok mindhárom locale-ban megvannak.
- Tesztek: Footer unit tesztek ellenőrzik a CTA/tartalmat, az egyedi e2e testid-kat, a session szerinti signup linket és a navigation landmarkokat. A Shell unit teszt ellenőrzi a flex-növesztést, a normál flow-t és az immersive kivételt.
- E2E: a footer tesztesetek közvetlenül a testid-kat használják, és ellenőrzik, hogy egyszer szerepelnek.
- Ellenőrzött viewportok: desktop, 390px mobil; hosszú oldal görgethető footerrel, rövid oldal aljára igazított footerrel; világos és sötét színséma.

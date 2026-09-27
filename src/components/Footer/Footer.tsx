'use client';

import {
  Anchor,
  Box,
  Button,
  Container,
  Divider,
  Group,
  SimpleGrid,
  Stack,
  Text,
} from '@mantine/core';
import { IconArrowRight } from '@tabler/icons-react';
import { motion, useInView } from 'motion/react';
import type { Route } from 'next';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { type FC, useRef } from 'react';
import { Reveal } from '@/lib/motion/Reveal';
import { MOTION_TRANSITION } from '@/lib/motion/transitions';
import { listItemVariants, listVariants } from '@/lib/motion/variants';
import { AUTH_ROUTES, PROTECTED_ROUTES, PUBLIC_ROUTES } from '@/types/routes';
import { Logo } from '../Logo';
import classes from './Footer.module.css';

type FooterLinkProps = {
  href: Route;
  label: string;
  testId?: string;
};

const FooterLink: FC<Readonly<FooterLinkProps>> = ({ href, label, testId }) => (
  <Anchor
    component={Link}
    href={href}
    size="sm"
    underline="hover"
    c="var(--footer-link-color)"
    className={classes.link}
    data-testid={testId}
  >
    {label}
  </Anchor>
);

const Footer: FC = () => {
  const currentYear = new Date().getFullYear();
  const translate = useTranslations('footer');
  const { status } = useSession();
  const columnsRef = useRef<HTMLDivElement>(null);
  const isColumnsInView = useInView(columnsRef, { once: true, amount: 0.2 });

  return (
    <Box component="footer" className={classes.footer} data-testid="footer">
      <Box py="lg" className={classes.ctaBand}>
        <Container size="lg">
          <Reveal y={12}>
            <Group justify="space-between" wrap="wrap" gap="md">
              <Text fw={600} size="lg" c="var(--footer-heading-color)">
                {translate('cta.title')}
              </Text>
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                transition={MOTION_TRANSITION.interactive}
                style={{ display: 'inline-block' }}
              >
                <Button
                  component={Link}
                  href={PROTECTED_ROUTES.RECIPES_CREATE}
                  variant="gradient"
                  gradient={{ from: 'pink', to: 'violet', deg: 45 }}
                  radius="xl"
                  fw={600}
                  rightSection={<IconArrowRight size={16} aria-hidden />}
                  data-testid="footer-cta"
                >
                  {translate('cta.button')}
                </Button>
              </motion.div>
            </Group>
          </Reveal>
        </Container>
      </Box>

      <Container size="lg" py="xl">
        <motion.div
          ref={columnsRef}
          variants={listVariants}
          initial="hidden"
          animate={isColumnsInView ? 'visible' : 'hidden'}
        >
          <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="xl">
            <motion.div variants={listItemVariants}>
              <Stack gap="xs" align="flex-start">
                <Logo
                  variant="icon"
                  width={36}
                  height={36}
                  withText
                  href={PUBLIC_ROUTES.HOME}
                />
                <Text size="sm" c="dimmed" maw={260}>
                  {translate('tagline')}
                </Text>
              </Stack>
            </motion.div>

            <motion.nav
              variants={listItemVariants}
              aria-label={translate('explore')}
            >
              <Stack gap={4} align="flex-start">
                <Text fw={600} size="sm" c="var(--footer-heading-color)">
                  {translate('explore')}
                </Text>
                <FooterLink
                  href={PUBLIC_ROUTES.RECIPES}
                  label={translate('links.recipes')}
                />
                <FooterLink
                  href={PROTECTED_ROUTES.RECIPES_CREATE}
                  label={translate('links.createRecipe')}
                />
                {status === 'unauthenticated' && (
                  <FooterLink
                    href={AUTH_ROUTES.SIGNUP}
                    label={translate('links.signup')}
                  />
                )}
              </Stack>
            </motion.nav>

            <motion.nav
              variants={listItemVariants}
              aria-label={translate('legal')}
            >
              <Stack gap={4} align="flex-start">
                <Text fw={600} size="sm" c="var(--footer-heading-color)">
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
            </motion.nav>
          </SimpleGrid>
        </motion.div>

        <Divider my="md" />

        {/* End padding keeps the text clear of the fixed BackToTop button */}
        <Group justify="space-between" wrap="wrap" gap="xs" pe={48}>
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

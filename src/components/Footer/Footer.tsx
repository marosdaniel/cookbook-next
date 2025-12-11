'use client';

import { Anchor, Group, Text } from '@mantine/core';
import Link from 'next/link';
import type { FC } from 'react';
import { Logo } from '../Logo';

const Footer: FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <Group h="100%" justify="space-between" align="center" px="md">
      <Group gap="xs">
        <Logo variant="icon" width={24} height={24} withText />
        <Text size="xs" c="dimmed">
          &copy; {currentYear} Cookbook. All rights reserved.
        </Text>
      </Group>

      <Group gap="md">
        <Anchor
          component={Link}
          // biome-ignore lint/suspicious/noExplicitAny: Placeholder route
          href={'/privacy-policy' as any}
          size="xs"
          c="dimmed"
          underline="hover"
        >
          Privacy Policy
        </Anchor>
        <Anchor
          component={Link}
          // biome-ignore lint/suspicious/noExplicitAny: Placeholder route
          href={'/cookie-policy' as any}
          size="xs"
          c="dimmed"
          underline="hover"
        >
          Cookie Policy
        </Anchor>
      </Group>
    </Group>
  );
};

export default Footer;

'use client';

import { Box, Collapse, Group, rem, Text, UnstyledButton } from '@mantine/core';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { FiChevronRight } from 'react-icons/fi';
import classes from './NavbarLinksGroup.module.css';
import type { NavbarLinksGroupProps } from './types';

const NavbarLinksGroup = ({
  icon: Icon,
  label,
  initiallyOpened,
  link,
  links,
}: NavbarLinksGroupProps) => {
  const pathname = usePathname();
  const hasLinks = Array.isArray(links);
  const isChildActive = hasLinks && links.some((l) => pathname === l.link);
  const [expanded, setExpanded] = useState(
    initiallyOpened || isChildActive || false,
  );
  const ChevronIcon = FiChevronRight;

  const items = (hasLinks ? links : []).map((link) => (
    <Text
      component={Link}
      className={classes.link}
      href={link.link}
      key={link.label}
      data-active={pathname === link.link || undefined}
    >
      {link.label}
    </Text>
  ));

  const content = (
    <Group justify="space-between" gap={0} wrap="nowrap">
      <Box style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
        {Icon && <Icon style={{ width: rem(20), height: rem(20) }} />}
        <Box ml={Icon ? 'md' : 0} style={{ flex: 1 }}>
          {label}
        </Box>
      </Box>
      {hasLinks && (
        <ChevronIcon
          className={classes.chevron}
          style={{
            width: rem(16),
            height: rem(16),
            transform: expanded ? 'rotate(90deg)' : 'none',
          }}
        />
      )}
    </Group>
  );

  if (!hasLinks && link) {
    return (
      <UnstyledButton
        component={Link}
        href={link}
        className={classes.control}
        data-active={pathname === link || undefined}
      >
        {content}
      </UnstyledButton>
    );
  }

  return (
    <>
      <UnstyledButton
        onClick={() => setExpanded((o) => !o)}
        className={classes.control}
        data-active-child={isChildActive || undefined}
      >
        {content}
      </UnstyledButton>
      {hasLinks ? <Collapse expanded={expanded}>{items}</Collapse> : null}
    </>
  );
};

export default NavbarLinksGroup;

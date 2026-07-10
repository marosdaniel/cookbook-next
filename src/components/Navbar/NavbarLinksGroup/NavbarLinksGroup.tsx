'use client';

import { Box, Collapse, Group, rem, Text, UnstyledButton } from '@mantine/core';
import { motion } from 'motion/react';
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
  const isChildActive =
    hasLinks && links.some((item) => pathname === item.link);

  const [expanded, setExpanded] = useState(
    initiallyOpened || isChildActive || false,
  );

  const normalizedLabel =
    typeof label === 'string' || typeof label === 'number'
      ? String(label)
      : 'group';

  const content = (
    <Group justify="space-between" gap={0} wrap="nowrap">
      <Box style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
        {Icon && <Icon style={{ width: rem(20), height: rem(20) }} />}

        <Box ml={Icon ? 'md' : 0} style={{ flex: 1 }}>
          {label}
        </Box>
      </Box>

      {hasLinks && (
        <motion.span
          className={classes.chevron}
          animate={{ rotate: expanded ? 90 : 0 }}
          transition={{ duration: 0.16, ease: 'easeOut' }}
          style={{
            display: 'inline-flex',
            width: rem(16),
            height: rem(16),
          }}
          aria-hidden="true"
        >
          <FiChevronRight style={{ width: rem(16), height: rem(16) }} />
        </motion.span>
      )}
    </Group>
  );

  if (!hasLinks && link) {
    const isActive = pathname === link;

    return (
      <UnstyledButton
        component={Link}
        href={link}
        className={classes.control}
        data-active={isActive || undefined}
        data-testid={`navbar-control-${link}`}
      >
        <span className={classes.controlContent}>
          {isActive && (
            <motion.span
              layoutId="navbar-active-indicator"
              className={classes.activeIndicator}
              aria-hidden="true"
            />
          )}
          <span className={classes.controlLabel}>{content}</span>
        </span>
      </UnstyledButton>
    );
  }

  return (
    <>
      <UnstyledButton
        onClick={() => setExpanded((open) => !open)}
        className={classes.control}
        data-active-child={isChildActive || undefined}
        data-testid={`navbar-group-${normalizedLabel}`}
        aria-expanded={hasLinks ? expanded : undefined}
      >
        {content}
      </UnstyledButton>

      {hasLinks ? (
        <Collapse expanded={expanded} transitionDuration={180}>
          {links.map((item) => {
            const isActive = pathname === item.link;

            return (
              <Text
                component={Link}
                className={classes.link}
                href={item.link}
                key={item.label}
                data-active={isActive || undefined}
                data-testid={`navbar-link-${item.label}`}
              >
                {isActive && (
                  <motion.span
                    layoutId="navbar-active-indicator"
                    className={classes.activeIndicator}
                    aria-hidden="true"
                  />
                )}

                <span className={classes.linkLabel}>{item.label}</span>
              </Text>
            );
          })}
        </Collapse>
      ) : null}
    </>
  );
};

export default NavbarLinksGroup;

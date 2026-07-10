import { Badge, Box, Group, Paper, Text, ThemeIcon } from '@mantine/core';
import { IconCheck } from '@tabler/icons-react';
import { motion } from 'motion/react';
import { memo } from 'react';
import { MOTION_TRANSITION } from '../../../../../lib/motion/transitions';
import { getStatusColor } from '../../utils';
import type { SectionNavItemProps } from './types';

const SectionNavItem = memo(
  ({
    label,
    hint,
    icon,
    active,
    completionDone,
    completionTotal,
    onClick,
  }: SectionNavItemProps) => {
    const isComplete =
      completionDone === completionTotal && completionTotal > 0;
    const statusColor = getStatusColor(isComplete, active);

    return (
      <Box pos="relative">
        {active && (
          <motion.div
            layoutId="composer-active-section"
            transition={MOTION_TRANSITION.interactive}
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: 'var(--mantine-radius-md)',
              backgroundColor: 'var(--mantine-color-blue-0)',
              border: '1px solid var(--mantine-color-blue-5)',
            }}
          />
        )}

        <Paper
          component="button"
          type="button"
          p="sm"
          radius="md"
          onClick={onClick}
          data-testid={`recipe-section-nav-item-${label.toLowerCase()}`}
          style={{
            position: 'relative',
            width: '100%',
            cursor: 'pointer',
            border: '1px solid transparent',
            background: 'transparent',
            textAlign: 'left',
          }}
        >
          <Group gap="sm" wrap="nowrap">
            <ThemeIcon
              size={36}
              radius="md"
              variant="light"
              color={statusColor}
            >
              {isComplete ? <IconCheck size={18} /> : icon}
            </ThemeIcon>

            <Box style={{ flex: 1, minWidth: 0 }}>
              <Text size="sm" fw={600} lineClamp={1}>
                {label}
              </Text>
              <Text size="xs" c="dimmed" lineClamp={1}>
                {hint}
              </Text>
            </Box>

            <Badge
              size="sm"
              variant="light"
              color={isComplete ? 'green' : 'gray'}
            >
              {completionDone}/{completionTotal}
            </Badge>
          </Group>
        </Paper>
      </Box>
    );
  },
);

export default SectionNavItem;

import { Badge, Box, Group, Paper, Text, ThemeIcon } from '@mantine/core';
import { IconCheck } from '@tabler/icons-react';
import { memo } from 'react';
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
      <Paper
        p="sm"
        radius="md"
        withBorder={active}
        onClick={onClick}
        style={{
          cursor: 'pointer',
          borderColor: active
            ? 'var(--mantine-color-blue-5)'
            : 'var(--mantine-color-gray-3)',
          backgroundColor: active
            ? 'var(--mantine-color-blue-0)'
            : 'transparent',
          transition: 'all 0.15s ease',
        }}
      >
        <Group gap="sm" wrap="nowrap">
          <ThemeIcon size={36} radius="md" variant="light" color={statusColor}>
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
    );
  },
);

export default SectionNavItem;

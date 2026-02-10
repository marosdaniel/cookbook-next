import { Badge, Box, Group, Paper, Text, ThemeIcon } from '@mantine/core';
import { IconCheck } from '@tabler/icons-react';

/* ─── Section Nav Item ────────────────────────── */
interface SectionNavItemProps {
  label: string;
  hint: string;
  icon: React.ReactNode;
  active: boolean;
  completionDone: number;
  completionTotal: number;
  onClick: () => void;
}

export function SectionNavItem({
  label,
  hint,
  icon,
  active,
  completionDone,
  completionTotal,
  onClick,
}: SectionNavItemProps) {
  const isComplete = completionDone === completionTotal && completionTotal > 0;

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
        backgroundColor: active ? 'var(--mantine-color-blue-0)' : 'transparent',
        transition: 'all 0.15s ease',
      }}
    >
      <Group gap="sm" wrap="nowrap">
        <ThemeIcon
          size={36}
          radius="md"
          variant="light"
          color={isComplete ? 'green' : active ? 'blue' : 'gray'}
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
        <Badge size="sm" variant="light" color={isComplete ? 'green' : 'gray'}>
          {completionDone}/{completionTotal}
        </Badge>
      </Group>
    </Paper>
  );
}

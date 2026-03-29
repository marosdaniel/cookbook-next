import { Group, Paper, Text, ThemeIcon } from '@mantine/core';
import type { StatCardProps } from '../types';
import classes from './StatCard.module.css';

const StatCard = ({ icon, label, value }: StatCardProps) => (
  <Paper withBorder radius="md" p="md" className={classes.statCard}>
    <Group gap="sm">
      <ThemeIcon
        size="lg"
        radius="md"
        variant="gradient"
        gradient={{ from: 'pink', to: 'violet', deg: 45 }}
      >
        {icon}
      </ThemeIcon>
      <div>
        <Text size="xl" fw={700} lh={1}>
          {value}
        </Text>
        <Text size="xs" c="dimmed" mt={2}>
          {label}
        </Text>
      </div>
    </Group>
  </Paper>
);

export default StatCard;

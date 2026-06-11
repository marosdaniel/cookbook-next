import { Skeleton, Stack, Text } from '@mantine/core';
import type { InfoFieldProps } from './types';

const InfoField = ({ label, value, isLoading }: InfoFieldProps) => (
  <Stack gap={2}>
    <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
      {label}
    </Text>
    {isLoading ? (
      <Skeleton h={20} w="70%" />
    ) : (
      <Text size="sm" fw={500}>
        {value}
      </Text>
    )}
  </Stack>
);

export default InfoField;

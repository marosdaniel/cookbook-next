import { ActionIcon, Group, Text } from '@mantine/core';
import { IconArrowLeft } from '@tabler/icons-react';
import Link from 'next/link';
import type { BackToProps } from './types';

const BackTo = ({ href, text }: Readonly<BackToProps>) => {
  return (
    <Group>
      <ActionIcon
        component={Link}
        href={href}
        variant="subtle"
        color="gray"
        size="lg"
        data-testid="back-to-link"
      >
        <IconArrowLeft size={20} />
      </ActionIcon>
      <Text
        component={Link}
        href={href}
        c="dimmed"
        size="sm"
        data-testid="back-to-text"
      >
        {text}
      </Text>
    </Group>
  );
};

export default BackTo;

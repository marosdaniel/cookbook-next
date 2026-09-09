import { Group, Title, type TitleProps } from '@mantine/core';
import type { PropsWithChildren, ReactNode } from 'react';

export type SectionTitleProps = PropsWithChildren<{
  order?: TitleProps['order'];
  size?: TitleProps['size'];
  icon?: ReactNode;
  rightSection?: ReactNode;
  mb?: TitleProps['mb'];
  className?: string;
  'data-testid'?: string;
}>;

export const SectionTitle = ({
  children,
  order = 2,
  size = 'h3',
  icon,
  rightSection,
  mb = 'md',
  className,
  'data-testid': testId,
}: SectionTitleProps) => {
  return (
    <Group
      justify={rightSection ? 'space-between' : 'flex-start'}
      align="center"
      mb={mb}
      className={className}
    >
      <Group gap="xs" align="center">
        {icon}
        <Title order={order} size={size} data-testid={testId}>
          {children}
        </Title>
      </Group>
      {rightSection}
    </Group>
  );
};

export default SectionTitle;

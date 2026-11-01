import { Badge, type BadgeProps } from '@mantine/core';
import type { RoleBadgeProps } from './types';

// Only theme colors are used, so the badge reads well in light and dark mode.
const ROLE_BADGE_STYLES: Record<
  'ADMIN' | 'BLOGGER' | 'USER',
  { testId: string; props: BadgeProps }
> = {
  ADMIN: {
    testId: 'role-badge-admin',
    props: {
      variant: 'gradient',
      gradient: { from: 'pink', to: 'violet', deg: 45 },
    },
  },
  BLOGGER: {
    testId: 'role-badge-blogger',
    props: { variant: 'light', color: 'violet' },
  },
  USER: {
    testId: 'role-badge-user',
    props: { variant: 'light', color: 'gray' },
  },
};

const RoleBadge = ({ role, label }: Readonly<RoleBadgeProps>) => {
  // Unknown roles fall back to the plain user style.
  const { testId, props } =
    role === 'ADMIN' || role === 'BLOGGER'
      ? ROLE_BADGE_STYLES[role]
      : ROLE_BADGE_STYLES.USER;

  return (
    <Badge {...props} data-testid={testId}>
      {label}
    </Badge>
  );
};
export default RoleBadge;

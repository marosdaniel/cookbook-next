import { Badge } from '@mantine/core';
import type { RoleBadgeProps } from './types';

// Only theme colors are used, so the badge reads well in light and dark mode.
const RoleBadge = ({ role, label }: Readonly<RoleBadgeProps>) => {
  if (role === 'ADMIN') {
    return (
      <Badge
        variant="gradient"
        gradient={{ from: 'pink', to: 'violet', deg: 45 }}
        data-testid="role-badge-admin"
      >
        {label}
      </Badge>
    );
  }

  if (role === 'BLOGGER') {
    return (
      <Badge variant="light" color="violet" data-testid="role-badge-blogger">
        {label}
      </Badge>
    );
  }

  return (
    <Badge variant="light" color="gray" data-testid="role-badge-user">
      {label}
    </Badge>
  );
};
export default RoleBadge;

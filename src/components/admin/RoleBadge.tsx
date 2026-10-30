import { Badge } from '@mantine/core';
import type { InsightUserRole } from '@/types/adminInsights';

type RoleBadgeProps = {
  role: InsightUserRole;
  label: string;
};

// Only theme colors are used, so the badge reads well in light and dark mode.
export const RoleBadge = ({ role, label }: Readonly<RoleBadgeProps>) => {
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

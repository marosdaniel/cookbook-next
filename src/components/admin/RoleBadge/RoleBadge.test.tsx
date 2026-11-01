import '@testing-library/jest-dom';
import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { render } from '@/utils/test-utils';
import RoleBadge from './RoleBadge';
import type { RoleBadgeProps } from './types';

const renderBadge = (role: RoleBadgeProps['role']) =>
  render(<RoleBadge role={role} label={`label-${role}`} />);

describe('RoleBadge', () => {
  it('renders the admin badge with the gradient testid', () => {
    renderBadge('ADMIN');

    const badge = screen.getByTestId('role-badge-admin');
    expect(badge).toHaveTextContent('label-ADMIN');
  });

  it('renders the blogger badge with the blogger testid', () => {
    renderBadge('BLOGGER');

    expect(screen.getByTestId('role-badge-blogger')).toHaveTextContent(
      'label-BLOGGER',
    );
  });

  it('renders the user badge for the USER role', () => {
    renderBadge('USER');

    expect(screen.getByTestId('role-badge-user')).toHaveTextContent(
      'label-USER',
    );
  });

  it('falls back to the user badge for an unknown role', () => {
    render(
      <RoleBadge
        role={'GUEST' as RoleBadgeProps['role']}
        label="label-GUEST"
      />,
    );

    expect(screen.getByTestId('role-badge-user')).toHaveTextContent(
      'label-GUEST',
    );
  });
});

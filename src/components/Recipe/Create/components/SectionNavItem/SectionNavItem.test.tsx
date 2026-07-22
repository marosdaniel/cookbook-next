import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import {
  Badge,
  Box,
  Group,
  Paper,
  Text,
  ThemeIcon,
} from '../../../../../../__mocks__/@mantine/core';
import SectionNavItem from './SectionNavItem';

vi.mock('@mantine/core', () => ({
  Badge: Badge,
  Box: Box,
  Group: Group,
  Paper: Paper,
  Text: Text,
  ThemeIcon: ThemeIcon,
}));

vi.mock('motion/react', () => ({
  motion: {
    div: ({ children, ...props }: React.ComponentPropsWithoutRef<'div'>) => (
      <div {...props}>{children}</div>
    ),
  },
}));

describe('SectionNavItem', () => {
  it('renders the section state, handles clicks and marks complete items', () => {
    const onClick = vi.fn();

    render(
      <SectionNavItem
        label="Basics"
        hint="Add your basics"
        icon={<span data-testid="section-icon">icon</span>}
        active={false}
        completionDone={2}
        completionTotal={3}
        onClick={onClick}
      />,
    );

    expect(
      screen.getByTestId('recipe-section-nav-item-basics'),
    ).toBeInTheDocument();
    expect(screen.getByText('Basics')).toBeInTheDocument();
    expect(screen.getByText('Add your basics')).toBeInTheDocument();
    expect(screen.getByText('2/3')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('recipe-section-nav-item-basics'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('renders the active and complete styling state', () => {
    render(
      <SectionNavItem
        label="Steps"
        hint="Finish your steps"
        icon={<span data-testid="section-icon">icon</span>}
        active
        completionDone={2}
        completionTotal={2}
        onClick={vi.fn()}
      />,
    );

    expect(screen.getByText('2/2')).toBeInTheDocument();
    expect(
      screen.getByTestId('recipe-section-nav-item-steps'),
    ).toBeInTheDocument();
  });
});

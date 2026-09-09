import '@testing-library/jest-dom';
import { IconMoodSad } from '@tabler/icons-react';
import { fireEvent, screen } from '@testing-library/react';
import type { ComponentProps } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render } from '@/utils/test-utils';
import EmptyState from './EmptyState';

const mockReducedMotion = false;
const mockInView = true;

vi.mock('motion/react', () => ({
  motion: {
    div: ({ children, ...props }: ComponentProps<'div'>) => (
      <div {...props}>{children}</div>
    ),
  },
  useInView: () => mockInView,
  useReducedMotion: () => mockReducedMotion,
}));

describe('EmptyState', () => {
  it('renders title, description and icon', () => {
    render(
      <EmptyState
        icon={<IconMoodSad data-testid="test-icon" />}
        title="No items found"
        description="Try adjusting your search criteria"
        data-testid="empty-state-root"
      />,
    );

    expect(screen.getByTestId('empty-state-root')).toBeInTheDocument();
    expect(screen.getByText('No items found')).toBeInTheDocument();
    expect(
      screen.getByText('Try adjusting your search criteria'),
    ).toBeInTheDocument();
    expect(screen.getByTestId('test-icon')).toBeInTheDocument();
  });

  it('renders action button and handles clicks', () => {
    const handleClick = vi.fn();
    render(
      <EmptyState
        icon={<IconMoodSad />}
        title="Empty"
        action={{
          label: 'Create item',
          onClick: handleClick,
          'data-testid': 'action-btn',
        }}
      />,
    );

    const button = screen.getByTestId('action-btn');
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('Create item');

    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('renders custom children when provided', () => {
    render(
      <EmptyState icon={<IconMoodSad />} title="Empty">
        <div data-testid="custom-child">Extra info</div>
      </EmptyState>,
    );

    expect(screen.getByTestId('custom-child')).toBeInTheDocument();
  });
});

import '@testing-library/jest-dom';
import { screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render } from '@/utils/test-utils';
import { StatCard } from './StatCard';

const motionMocks = vi.hoisted(() => ({
  animate: vi.fn(),
  useReducedMotion: vi.fn(),
}));

vi.mock('motion/react', () => ({
  animate: (...args: unknown[]) => motionMocks.animate(...args),
  useReducedMotion: () => motionMocks.useReducedMotion(),
}));

const renderCard = (overrides: Partial<Parameters<typeof StatCard>[0]> = {}) =>
  render(
    <StatCard
      label="Total users"
      value={1234}
      icon={<span data-testid="icon-content">i</span>}
      locale="en-US"
      {...overrides}
    />,
  );

describe('StatCard', () => {
  beforeEach(() => {
    motionMocks.animate.mockReset();
    motionMocks.useReducedMotion.mockReset();
  });

  it('renders the label, icon and formatted value when motion is reduced', () => {
    motionMocks.useReducedMotion.mockReturnValue(true);

    renderCard();

    expect(screen.getByTestId('admin-stat-label')).toHaveTextContent(
      'Total users',
    );
    expect(screen.getByTestId('admin-stat-value')).toHaveTextContent('1,234');
    expect(screen.getByTestId('icon-content')).toBeInTheDocument();
    expect(motionMocks.animate).not.toHaveBeenCalled();
  });

  it('counts up through animate and rounds each update', () => {
    motionMocks.useReducedMotion.mockReturnValue(false);
    const stop = vi.fn();
    motionMocks.animate.mockImplementation(
      (
        _from: number,
        _to: number,
        options: { onUpdate: (n: number) => void },
      ) => {
        options.onUpdate(12.4);
        return { stop };
      },
    );

    const { unmount } = renderCard({ value: 50 });

    expect(motionMocks.animate).toHaveBeenCalledWith(
      0,
      50,
      expect.objectContaining({ duration: 0.8, ease: 'easeOut' }),
    );
    expect(screen.getByTestId('admin-stat-value')).toHaveTextContent('12');

    unmount();
    expect(stop).toHaveBeenCalledTimes(1);
  });

  it('updates the displayed value when the value prop changes', () => {
    motionMocks.useReducedMotion.mockReturnValue(true);

    const { rerender } = renderCard({ value: 5 });
    expect(screen.getByTestId('admin-stat-value')).toHaveTextContent('5');

    rerender(
      <StatCard
        label="Total users"
        value={8000}
        icon={<span />}
        locale="en-US"
      />,
    );
    expect(screen.getByTestId('admin-stat-value')).toHaveTextContent('8,000');
  });

  it('shows the hint only when one is provided', () => {
    motionMocks.useReducedMotion.mockReturnValue(true);

    const { unmount } = renderCard({ hint: 'Last 7 days' });
    expect(screen.getByTestId('admin-stat-hint')).toHaveTextContent(
      'Last 7 days',
    );
    unmount();

    renderCard();
    expect(screen.queryByTestId('admin-stat-hint')).not.toBeInTheDocument();
  });

  it('sets the reveal delay from the card index', () => {
    motionMocks.useReducedMotion.mockReturnValue(true);

    renderCard({ index: 2 });

    const card = screen.getByTestId('admin-stat-card');
    expect(card.style.getPropertyValue('--reveal-delay')).toBe('140ms');
  });

  it('defaults the reveal delay to zero', () => {
    motionMocks.useReducedMotion.mockReturnValue(true);

    renderCard();

    const card = screen.getByTestId('admin-stat-card');
    expect(card.style.getPropertyValue('--reveal-delay')).toBe('0ms');
  });
});

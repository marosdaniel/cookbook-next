import '@testing-library/jest-dom';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render } from '@/utils/test-utils';
import ReadingProgress from './ReadingProgress';

const mockUseReducedMotion = vi.fn();
const mockUseScroll = vi.fn();
const mockUseSpring = vi.fn();

vi.mock('motion/react', () => ({
  MotionConfig: ({ children }: { children: ReactNode }) => <>{children}</>,
  motion: {
    div: ({
      children,
      ...props
    }: {
      children?: ReactNode;
      [key: string]: unknown;
    }) => <div {...props}>{children}</div>,
  },
  useReducedMotion: () => mockUseReducedMotion(),
  useScroll: () => mockUseScroll(),
  useSpring: () => mockUseSpring(),
}));

describe('ReadingProgress', () => {
  beforeEach(() => {
    mockUseReducedMotion.mockReset();
    mockUseScroll.mockReset();
    mockUseSpring.mockReset();

    mockUseReducedMotion.mockReturnValue(false);
    mockUseScroll.mockReturnValue({ scrollYProgress: 0 });
    mockUseSpring.mockReturnValue('scaleX');
  });

  it('uses the violet accent color for the progress bar', () => {
    const { container } = render(<ReadingProgress nonce="test-nonce" />);

    const bar = container.querySelector('div[aria-hidden="true"]');

    expect(bar).toHaveAttribute(
      'style',
      expect.stringContaining(
        'linear-gradient(45deg, var(--mantine-color-pink-6), var(--mantine-color-violet-6))',
      ),
    );
  });
});

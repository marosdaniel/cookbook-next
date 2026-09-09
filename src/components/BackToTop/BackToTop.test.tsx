import '@testing-library/jest-dom';
import { act, fireEvent, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render } from '@/utils/test-utils';
import BackToTop from './BackToTop';

const scrollYSubscribers: Array<(val: number) => void> = [];
let mockReducedMotion = false;

vi.mock('motion/react', () => ({
  AnimatePresence: ({ children }: { children?: ReactNode }) => <>{children}</>,
  motion: {
    div: ({ children, ...props }: React.ComponentProps<'div'>) => (
      <div {...props}>{children}</div>
    ),
  },
  useScroll: () => ({
    scrollY: {
      on: (_event: string, callback: (val: number) => void) => {
        scrollYSubscribers.push(callback);
        return () => {
          const index = scrollYSubscribers.indexOf(callback);
          if (index > -1) scrollYSubscribers.splice(index, 1);
        };
      },
    },
  }),
  useReducedMotion: () => mockReducedMotion,
}));

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

describe('BackToTop', () => {
  beforeEach(() => {
    scrollYSubscribers.length = 0;
    mockReducedMotion = false;
    vi.restoreAllMocks();
  });

  it('is initially hidden when scrollY <= 600', () => {
    render(<BackToTop />);
    expect(screen.queryByTestId('back-to-top')).not.toBeInTheDocument();
  });

  it('becomes visible when scrollY exceeds 600', () => {
    render(<BackToTop />);

    expect(scrollYSubscribers.length).toBeGreaterThan(0);

    act(() => {
      scrollYSubscribers[0](650);
    });

    expect(screen.getByTestId('back-to-top')).toBeInTheDocument();
    expect(screen.getByTestId('back-to-top-button')).toBeInTheDocument();
  });

  it('scrolls to top with smooth behavior when clicked', () => {
    const scrollToMock = vi.fn();
    window.scrollTo = scrollToMock;

    render(<BackToTop />);
    act(() => {
      scrollYSubscribers[0](700);
    });

    const button = screen.getByTestId('back-to-top-button');
    fireEvent.click(button);

    expect(scrollToMock).toHaveBeenCalledWith({
      top: 0,
      behavior: 'smooth',
    });
  });

  it('scrolls to top with auto behavior when reduced motion is requested', () => {
    mockReducedMotion = true;
    const scrollToMock = vi.fn();
    window.scrollTo = scrollToMock;

    render(<BackToTop />);
    act(() => {
      scrollYSubscribers[0](700);
    });

    const button = screen.getByTestId('back-to-top-button');
    fireEvent.click(button);

    expect(scrollToMock).toHaveBeenCalledWith({
      top: 0,
      behavior: 'auto',
    });
  });
});

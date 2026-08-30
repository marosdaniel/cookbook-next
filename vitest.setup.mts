import '@testing-library/jest-dom';
import {
  type ComponentProps,
  createElement,
  Fragment,
  type ReactNode,
} from 'react';
import { vi } from 'vitest';

class MockResizeObserver {
  observe() {
    return undefined;
  }

  unobserve() {
    return undefined;
  }

  disconnect() {
    return undefined;
  }
}

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => undefined, // deprecated
    removeListener: () => undefined, // deprecated
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
    dispatchEvent: () => false,
  }),
});

Object.defineProperty(window, 'ResizeObserver', {
  writable: true,
  configurable: true,
  value: MockResizeObserver,
});

Object.defineProperty(globalThis, 'ResizeObserver', {
  writable: true,
  configurable: true,
  value: MockResizeObserver,
});

Object.defineProperty(window.HTMLElement.prototype, 'scrollIntoView', {
  writable: true,
  configurable: true,
  value: () => undefined,
});

vi.mock('motion/react', () => ({
  AnimatePresence: ({ children }: { children?: ReactNode }) =>
    createElement(Fragment, null, children),
  LayoutGroup: ({ children }: { children?: ReactNode }) =>
    createElement(Fragment, null, children),
  MotionConfig: ({ children }: { children?: ReactNode }) =>
    createElement(Fragment, null, children),
  useReducedMotion: () => false,
  useScroll: () => ({
    scrollYProgress: {
      get: () => 0,
      onChange: () => undefined,
    },
  }),
  useInView: () => true,
  useAnimationControls: () => ({
    start: () => undefined,
    stop: () => undefined,
    set: () => undefined,
  }),
  motion: {
    create: (Component: unknown) => Component,
    div: ({ children, ...props }: ComponentProps<'div'>) =>
      createElement('div', props, children),
    span: ({ children, ...props }: ComponentProps<'span'>) =>
      createElement('span', props, children),
    button: ({ children, type, ...props }: ComponentProps<'button'>) =>
      createElement('button', { ...props, type: type ?? 'button' }, children),
    p: ({ children, ...props }: ComponentProps<'p'>) =>
      createElement('p', props, children),
    section: ({ children, ...props }: ComponentProps<'section'>) =>
      createElement('section', props, children),
    main: ({ children, ...props }: ComponentProps<'main'>) =>
      createElement('main', props, children),
    article: ({ children, ...props }: ComponentProps<'article'>) =>
      createElement('article', props, children),
    h1: ({ children, ...props }: ComponentProps<'h1'>) =>
      createElement('h1', props, children),
    iframe: ({ children, src, title, ...props }: ComponentProps<'iframe'>) =>
      createElement(
        'div',
        {
          ...props,
          'data-mock-iframe': 'true',
          'data-src': src,
          title,
        },
        children,
      ),
  },
}));

// Provide a lightweight mock for next-intl so tests can render components
// that use `useTranslations` without loading locale files.
vi.mock('next-intl', () => {
  return {
    useTranslations: (_ns?: string) => {
      return (key: string, opts?: Record<string, unknown>) => {
        if (opts && typeof opts === 'object') {
          return String(key).replace(/\{(\w+)\}/g, (_, k) =>
            String((opts as Record<string, unknown>)[k] ?? ''),
          );
        }
        const parts = String(key).split('.');
        return parts[parts.length - 1];
      };
    },
    NextIntlProvider: ({ children }: { children?: ReactNode }) => children,
    useLocale: () => 'en',
  };
});

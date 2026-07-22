import '@testing-library/jest-dom';

class MockResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {}, // deprecated
    removeListener: () => {}, // deprecated
    addEventListener: () => {},
    removeEventListener: () => {},
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
  value: () => {},
});

import type { ReactNode } from 'react';
import { vi } from 'vitest';

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

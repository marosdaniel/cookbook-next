import { MantineProvider } from '@mantine/core';
import { type RenderOptions, render } from '@testing-library/react';
import type { ReactElement, ReactNode } from 'react';

export function MockProviders({ children }: Readonly<{ children: ReactNode }>) {
  return <MantineProvider>{children}</MantineProvider>;
}

function customRender(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) {
  return render(ui, { wrapper: MockProviders, ...options });
}

export * from '@testing-library/react';
export { customRender as render };

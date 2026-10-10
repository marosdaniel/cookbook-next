import { describe, expect, it, vi } from 'vitest';

vi.mock('next/navigation', () => ({
  redirect: (url: string) => {
    throw new Error(`REDIRECT:${url}`);
  },
}));

import AdminIndexPage from './page';

describe('AdminIndexPage', () => {
  it('redirects to the metadata section', () => {
    expect(() => AdminIndexPage()).toThrow('REDIRECT:/admin/metadata');
  });
});

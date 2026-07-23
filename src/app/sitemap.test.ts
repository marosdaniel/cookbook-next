import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  findMany: vi.fn(),
}));

vi.mock('@/lib/prisma/prisma', () => ({
  prisma: {
    recipe: {
      findMany: mocks.findMany,
    },
  },
}));

import sitemap from './sitemap';

describe('sitemap', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://cookbook.example.com');
  });

  it('returns public routes and canonical recipe URLs', async () => {
    const updatedAt = new Date('2026-07-23T00:00:00.000Z');
    mocks.findMany.mockResolvedValue([
      { id: 'recipe-1', slug: 'pasta', updatedAt },
      { id: 'recipe-2', slug: null, updatedAt },
    ]);

    const entries = await sitemap();
    const urls = entries.map((entry) => entry.url);

    expect(entries).toHaveLength(6);
    expect(urls).toEqual([
      'https://cookbook.example.com',
      'https://cookbook.example.com/recipes',
      'https://cookbook.example.com/privacy-policy',
      'https://cookbook.example.com/cookie-policy',
      'https://cookbook.example.com/recipes/pasta',
      'https://cookbook.example.com/recipes/recipe-2',
    ]);
    expect(entries[4]?.lastModified).toEqual(updatedAt);
    expect(entries[5]?.lastModified).toEqual(updatedAt);

    expect(mocks.findMany).toHaveBeenCalledWith({
      where: {},
      select: { id: true, slug: true, updatedAt: true },
      orderBy: { updatedAt: 'desc' },
    });
  });
});

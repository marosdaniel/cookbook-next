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

import { GET } from './route';

describe('feed.xml route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://cookbook.example.com');
  });

  it('returns a valid RSS document with the latest recipes', async () => {
    const createdAt = new Date('2026-07-23T00:00:00.000Z');
    mocks.findMany.mockResolvedValue([
      {
        id: 'recipe-1',
        slug: 'pasta',
        title: 'Pasta',
        description: 'Tasty pasta',
        createdAt,
      },
      {
        id: 'recipe-2',
        slug: null,
        title: 'Salad',
        description: null,
        createdAt,
      },
    ]);

    const response = await GET();
    const xml = await response.text();

    expect(response.headers.get('Content-Type')).toBe(
      'application/rss+xml; charset=utf-8',
    );
    expect(xml).toContain('<rss version="2.0"');
    expect(xml).toContain(
      '<link>https://cookbook.example.com/recipes/pasta</link>',
    );
    expect(xml).toContain(
      '<link>https://cookbook.example.com/recipes/recipe-2</link>',
    );
    expect(xml).toContain('<title>Pasta</title>');
    expect(xml).toContain('<description>Tasty pasta</description>');
  });

  it('escapes XML-sensitive characters in title and description', async () => {
    mocks.findMany.mockResolvedValue([
      {
        id: 'recipe-1',
        slug: 'salt-pepper',
        title: 'Salt & Pepper <Special>',
        description: 'A "classic" recipe',
        createdAt: new Date('2026-07-23T00:00:00.000Z'),
      },
    ]);

    const response = await GET();
    const xml = await response.text();

    expect(xml).toContain('Salt &amp; Pepper &lt;Special&gt;');
    expect(xml).toContain('A &quot;classic&quot; recipe');
    expect(xml).not.toContain('<Special>');
  });

  it('limits the feed to the 20 most recent recipes', async () => {
    mocks.findMany.mockResolvedValue([]);

    await GET();

    expect(mocks.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ take: 20, orderBy: { createdAt: 'desc' } }),
    );
  });
});

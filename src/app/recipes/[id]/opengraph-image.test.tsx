import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  getRecipeBySlugOrId: vi.fn(),
  ImageResponse: vi.fn(function (
    this: { element: unknown; options: unknown },
    element: unknown,
    options: unknown,
  ) {
    this.element = element;
    this.options = options;
  }),
}));

vi.mock('@/lib/services/RecipeService', () => ({
  RecipeService: { getRecipeBySlugOrId: mocks.getRecipeBySlugOrId },
}));

vi.mock('next/og', () => ({
  ImageResponse: mocks.ImageResponse,
}));

import Image, { alt, contentType, size } from './opengraph-image';

// Renders the Satori element tree to a flat string so assertions don't need
// to know the exact JSX shape.
const flattenText = (node: unknown): string => {
  if (node == null || typeof node === 'boolean') return '';
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(flattenText).join('');
  if (
    typeof node === 'object' &&
    'props' in (node as Record<string, unknown>)
  ) {
    return flattenText(
      (node as { props: { children?: unknown } }).props.children,
    );
  }
  return '';
};

describe('recipe opengraph-image', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('exposes the expected static metadata', () => {
    expect(alt).toBe('Cookbook recipe');
    expect(size).toEqual({ width: 1200, height: 630 });
    expect(contentType).toBe('image/png');
  });

  it('renders the recipe title, category, difficulty and cooking time', async () => {
    mocks.getRecipeBySlugOrId.mockResolvedValue({
      title: 'Grandma’s Pasta',
      cookingTime: 45,
      category: { label: 'Dinner' },
      difficultyLevel: { label: 'Easy' },
    });

    const response = (await Image({
      params: Promise.resolve({ id: 'pasta' }),
    })) as unknown as { element: unknown; options: unknown };

    const text = flattenText(response.element);
    expect(text).toContain('Grandma’s Pasta');
    expect(text).toContain('Dinner');
    expect(text).toContain('Easy');
    expect(text).toContain('45 min');
    expect(response.options).toEqual(size);
  });

  it('truncates very long titles', async () => {
    const longTitle = 'A'.repeat(200);
    mocks.getRecipeBySlugOrId.mockResolvedValue({
      title: longTitle,
      cookingTime: 10,
    });

    const response = (await Image({
      params: Promise.resolve({ id: 'long' }),
    })) as unknown as { element: unknown };

    const text = flattenText(response.element);
    expect(text).toContain('A'.repeat(90));
    expect(text).not.toContain('A'.repeat(91));
  });

  it('falls back to a generic branded card when the recipe cannot be found', async () => {
    mocks.getRecipeBySlugOrId.mockRejectedValue(new Error('Recipe not found'));

    const response = (await Image({
      params: Promise.resolve({ id: 'missing' }),
    })) as unknown as { element: unknown };

    const text = flattenText(response.element);
    expect(text).toContain('Cookbook');
  });
});

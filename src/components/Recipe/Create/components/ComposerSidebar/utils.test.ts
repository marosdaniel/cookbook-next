import { describe, expect, it, vi } from 'vitest';
import { getSectionHint } from './utils';

describe('getSectionHint', () => {
  const translate = vi.fn((key: string, values?: Record<string, unknown>) => {
    switch (key) {
      case 'itemsCount':
        return `items:${values?.count}`;
      case 'stepsCount':
        return `steps:${values?.count}`;
      case 'mediaCoverSet':
        return 'media:set';
      case 'mediaOptional':
        return 'media:optional';
      case 'fieldsFilled':
        return `fields:${values?.completed}/${values?.total}`;
      default:
        return key;
    }
  });

  it('returns ingredient count hints', () => {
    const values = {
      ingredients: [
        {
          localId: '1',
          name: 'Salt',
          quantity: 1,
          unit: null,
          isOptional: false,
          note: '',
        },
      ],
    } as never;

    expect(
      getSectionHint(
        'ingredients',
        { done: 1, total: 2 },
        values,
        translate as never,
      ),
    ).toBe('items:1');
  });

  it('returns step count hints', () => {
    const values = {
      preparationSteps: [{ localId: '1', description: 'Mix', order: 1 }],
    } as never;

    expect(
      getSectionHint(
        'steps',
        { done: 1, total: 2 },
        values,
        translate as never,
      ),
    ).toBe('steps:1');
  });

  it('returns media cover hints', () => {
    expect(
      getSectionHint(
        'media',
        { done: 1, total: 1 },
        { imgSrc: 'cover.jpg' } as never,
        translate as never,
      ),
    ).toBe('media:set');
    expect(
      getSectionHint(
        'media',
        { done: 0, total: 1 },
        { imgSrc: '' } as never,
        translate as never,
      ),
    ).toBe('media:optional');
  });

  it('returns basics completion hints', () => {
    expect(
      getSectionHint(
        'basics',
        { done: 2, total: 4 },
        { ingredients: [], preparationSteps: [] } as never,
        translate as never,
      ),
    ).toBe('fields:2/4');
  });
});

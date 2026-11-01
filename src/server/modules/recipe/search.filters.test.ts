import { describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/prisma/prisma', () => ({ prisma: {} }));

import { encodeCursor } from '@/server/platform/pagination';
import {
  buildTrigramSearchFilterClauses,
  buildTrigramSearchQuery,
  decodeCreatedAtCursor,
  decodeSearchScoreCursor,
  encodeCreatedAtCursor,
  encodeSearchScoreCursor,
} from './search';

describe('buildTrigramSearchFilterClauses', () => {
  it('returns no clauses without a filter', () => {
    expect(buildTrigramSearchFilterClauses()).toEqual([]);
    expect(buildTrigramSearchFilterClauses({})).toEqual([]);
  });

  it('creates one clause per supported filter', () => {
    const clauses = buildTrigramSearchFilterClauses({
      categoryKey: 'soup',
      difficultyLevelKey: 'easy',
      cuisineKey: 'hu',
      costLevelKey: 'low',
      maxCookingTime: 30,
      labelKeys: ['quick'],
      dietaryFlagKeys: ['vegan'],
      allergenKeys: ['gluten'],
      equipmentKeys: ['oven'],
    });

    expect(clauses).toHaveLength(9);
    expect(clauses.map((clause) => clause.values[0])).toEqual([
      'soup',
      'easy',
      'hu',
      'low',
      30,
      '[{"key":"quick"}]',
      '[{"key":"vegan"}]',
      '[{"key":"gluten"}]',
      '[{"key":"oven"}]',
    ]);
  });

  it('skips array filters that are empty', () => {
    expect(
      buildTrigramSearchFilterClauses({ labelKeys: [], allergenKeys: [] }),
    ).toEqual([]);
  });
});

describe('buildTrigramSearchQuery', () => {
  it('binds the search term and omits cursor and LIMIT when not given', () => {
    const query = buildTrigramSearchQuery({ searchTerm: 'soup' });

    expect(query.values).toContain('soup');
    expect(query.sql).not.toContain('LIMIT');
    expect(query.sql).not.toContain('score < ');
  });

  it('adds the cursor predicate and LIMIT when provided', () => {
    const query = buildTrigramSearchQuery({
      searchTerm: 'soup',
      cursor: { score: 0.5, id: 'r1' },
      take: 20,
    });

    expect(query.sql).toContain('LIMIT');
    expect(query.values).toEqual(expect.arrayContaining([0.5, 'r1', 20]));
  });

  it('appends filter clauses to the scored subquery', () => {
    const query = buildTrigramSearchQuery({
      searchTerm: 'soup',
      filter: { cuisineKey: 'hu' },
    });

    expect(query.values).toContain('hu');
  });
});

describe('cursor helpers', () => {
  it('round-trips a createdAt cursor', () => {
    const encoded = encodeCreatedAtCursor({
      createdAt: new Date('2024-01-01T00:00:00Z'),
      id: 'r1',
    });

    expect(decodeCreatedAtCursor(encoded)).toEqual({
      createdAt: '2024-01-01T00:00:00.000Z',
      id: 'r1',
    });
  });

  it('rejects createdAt cursors with the wrong shape or missing value', () => {
    expect(decodeCreatedAtCursor(undefined)).toBeNull();
    expect(
      decodeCreatedAtCursor(encodeCursor({ score: 1, id: 'r1' })),
    ).toBeNull();
    expect(
      decodeCreatedAtCursor(
        encodeCursor({ createdAt: 'not-a-date', id: 'r1' }),
      ),
    ).toBeNull();
  });

  it('round-trips a search score cursor and rounds the score to 6 decimals', () => {
    const encoded = encodeSearchScoreCursor({ score: 0.1234567, id: 'r1' });

    expect(decodeSearchScoreCursor(encoded)).toEqual({
      score: 0.123457,
      id: 'r1',
    });
  });

  it('rejects score cursors with an empty id or a non-numeric score', () => {
    expect(decodeSearchScoreCursor(undefined)).toBeNull();
    expect(
      decodeSearchScoreCursor(encodeCursor({ score: 0.5, id: '' })),
    ).toBeNull();
    expect(
      decodeSearchScoreCursor(encodeCursor({ score: 'high', id: 'r1' })),
    ).toBeNull();
  });
});

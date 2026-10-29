import { describe, expect, it } from 'vitest';
import {
  buildTrigramSearchQuery,
  decodeCreatedAtCursor,
  decodeSearchScoreCursor,
  encodeCreatedAtCursor,
  encodeSearchScoreCursor,
} from './search';

describe('recipe search cursor and SQL builder', () => {
  it('encodes and decodes createdAt cursors and rejects invalid inputs', () => {
    const date = new Date('2026-10-29T10:00:00.000Z');
    const encoded = encodeCreatedAtCursor({ createdAt: date, id: 'recipe-1' });

    expect(decodeCreatedAtCursor(encoded)).toEqual({
      createdAt: '2026-10-29T10:00:00.000Z',
      id: 'recipe-1',
    });
    expect(decodeCreatedAtCursor(undefined)).toBeNull();
    expect(decodeCreatedAtCursor('not-valid-base64-json')).toBeNull();
  });

  it('encodes and decodes (score, id) search cursors and rejects invalid inputs', () => {
    const encoded = encodeSearchScoreCursor({
      score: 0.7512349,
      id: 'recipe-9',
    });

    expect(decodeSearchScoreCursor(encoded)).toEqual({
      score: 0.751235,
      id: 'recipe-9',
    });
    expect(decodeSearchScoreCursor(undefined)).toBeNull();
    expect(
      decodeSearchScoreCursor(
        Buffer.from(JSON.stringify({ score: 'bad', id: '1' })).toString(
          'base64url',
        ),
      ),
    ).toBeNull();
  });

  it('builds parameterized trigram search SQL with filters, keyset cursor, and LIMIT', () => {
    const sqlObj = buildTrigramSearchQuery({
      searchTerm: 'goulash',
      filter: {
        categoryKey: 'soup',
        difficultyLevelKey: 'medium',
        maxCookingTime: 90,
        labelKeys: ['traditional'],
      },
      cursor: { score: 0.65, id: 'recipe-10' },
      take: 13,
    });

    expect(sqlObj.sql).toContain('WITH scored AS');
    expect(sqlObj.sql).toContain('EXISTS');
    expect(sqlObj.sql).toContain('ORDER BY score DESC, id DESC');
    expect(sqlObj.sql).toContain('LIMIT');
    expect(sqlObj.values).toContain('goulash');
    expect(sqlObj.values).toContain('soup');
    expect(sqlObj.values).toContain('medium');
    expect(sqlObj.values).toContain(90);
    expect(sqlObj.values).toContain(0.65);
    expect(sqlObj.values).toContain('recipe-10');
    expect(sqlObj.values).toContain(13);
  });
});

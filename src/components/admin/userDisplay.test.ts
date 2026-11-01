import { describe, expect, it } from 'vitest';
import { formatDateTime, formatJoinedDate, getInitials } from './userDisplay';

describe('getInitials', () => {
  it('returns uppercase initials from both names', () => {
    expect(getInitials('ada', 'lovelace')).toBe('AL');
  });

  it('uses the available initial when one name is empty', () => {
    expect(getInitials('', 'lovelace')).toBe('L');
    expect(getInitials('ada', '')).toBe('A');
  });

  it('returns a question mark when both names are empty', () => {
    expect(getInitials('', '')).toBe('?');
  });
});

describe('formatJoinedDate', () => {
  it('formats the date in the Budapest time zone', () => {
    // 23:30 UTC on 4 March is already 5 March in Budapest.
    expect(formatJoinedDate('2024-03-04T23:30:00Z', 'en-US')).toBe(
      'Mar 5, 2024',
    );
  });
});

describe('formatDateTime', () => {
  it('formats the date and time in the Budapest time zone', () => {
    // 12:00 UTC is 13:00 in Budapest in early March (CET, UTC+1).
    expect(formatDateTime('2024-03-05T12:00:00Z', 'en-US')).toMatch(
      /Mar 5, 2024,? 1:00\s?PM/,
    );
  });
});

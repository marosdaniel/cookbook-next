import { describe, expect, it } from 'vitest';
import de from '../../locales/admin-console/de.json';
import enGb from '../../locales/admin-console/en-gb.json';
import hu from '../../locales/admin-console/hu.json';
import { getLocaleMessages } from './locale';

const leafEntries = (
  source: Record<string, unknown>,
  prefix = '',
): Array<[string, unknown]> =>
  Object.entries(source).flatMap(([key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key;

    if (value && typeof value === 'object') {
      return leafEntries(value as Record<string, unknown>, path);
    }

    return [[path, value] as [string, unknown]];
  });

describe('adminConsole messages', () => {
  const reference = leafEntries(enGb)
    .map(([key]) => key)
    .sort();

  it.each([
    ['hu', hu],
    ['de', de],
  ])('has the same keys in %s as in en-gb', (_locale, messages) => {
    expect(
      leafEntries(messages)
        .map(([key]) => key)
        .sort(),
    ).toEqual(reference);
  });

  it.each([
    ['en-gb', enGb],
    ['hu', hu],
    ['de', de],
  ])('has no empty strings in %s', (_locale, messages) => {
    const empty = leafEntries(messages)
      .filter(([, value]) => typeof value !== 'string' || value.trim() === '')
      .map(([key]) => key);

    expect(empty).toEqual([]);
  });

  it.each(['en-gb', 'hu', 'de'])(
    'merges the adminConsole namespace into the %s messages',
    async (locale) => {
      const messages = (await getLocaleMessages(locale)) as unknown as Record<
        string,
        unknown
      >;

      expect(messages.adminConsole).toBeDefined();
      expect(messages.admin).toBeDefined();
    },
  );
});

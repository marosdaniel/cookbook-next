import { getLocaleMessages } from '@/lib/locale/locale';
import {
  METADATA_TRANSLATION_PREFIXES,
  METADATA_TYPES,
  type MetadataTypeName,
} from './metadataTypes';

const SUPPORTED_LOCALES = ['en-gb', 'hu', 'de'] as const;

const loadMiscKeySets = async (): Promise<Set<string>[]> =>
  Promise.all(
    SUPPORTED_LOCALES.map(async (locale) => {
      const messages = await getLocaleMessages(locale);
      return new Set(Object.keys(messages.misc ?? {}));
    }),
  );

const filterKeysForType = (
  type: MetadataTypeName,
  keySets: Set<string>[],
): string[] => {
  const prefix = METADATA_TRANSLATION_PREFIXES[type];
  const [first = new Set<string>(), ...rest] = keySets;

  return [...first]
    .filter(
      (key) => key.startsWith(prefix) && rest.every((set) => set.has(key)),
    )
    .sort();
};

/**
 * Translation keys usable as a label for a metadata type.
 * Only keys present in every supported locale are returned, so no language shows a raw key.
 */
export const getAvailableTranslationKeys = async (
  type: MetadataTypeName,
): Promise<string[]> => filterKeysForType(type, await loadMiscKeySets());

export const getAvailableTranslationKeysByType = async (): Promise<
  Record<MetadataTypeName, string[]>
> => {
  const keySets = await loadMiscKeySets();

  return Object.fromEntries(
    METADATA_TYPES.map((type) => [type, filterKeysForType(type, keySets)]),
  ) as Record<MetadataTypeName, string[]>;
};

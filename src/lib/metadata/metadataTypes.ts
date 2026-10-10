/** Metadata types managed in the admin panel; mirrors the Prisma `MetadataType` enum. */
export const METADATA_TYPES = [
  'CATEGORY',
  'LABEL',
  'DIFFICULTY_LEVEL',
  'UNIT',
  'CUISINE',
  'SERVING_UNIT',
  'DIET',
  'ALLERGEN',
  'EQUIPMENT',
  'COST_LEVEL',
] as const;

export type MetadataTypeName = (typeof METADATA_TYPES)[number];

/** Prefix of the `misc` translation keys that can serve as a label for each type. */
export const METADATA_TRANSLATION_PREFIXES: Record<MetadataTypeName, string> = {
  CATEGORY: 'category-',
  LABEL: 'label-',
  DIFFICULTY_LEVEL: 'difficulty-',
  UNIT: 'unit-',
  CUISINE: 'cuisine-',
  SERVING_UNIT: 'serving-unit-',
  DIET: 'diet-',
  ALLERGEN: 'allergen-',
  EQUIPMENT: 'equipment-',
  COST_LEVEL: 'cost-level-',
};

export const METADATA_KEY_MAX_LENGTH = 64;

/** Lowercase words separated by single hyphens, e.g. `gluten-free`. */
export const METADATA_KEY_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

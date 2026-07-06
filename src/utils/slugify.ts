/**
 * Converts arbitrary text into a URL-friendly, SEO-safe slug: strips
 * diacritics, lowercases, collapses non-alphanumeric runs into a single
 * hyphen, and trims leading/trailing hyphens.
 *
 * Examples: "Túrós Csusza!" -> "turos-csusza", "Käsespätzle" -> "kasespatzle"
 */
export const slugify = (value: string): string => {
  return value
    .normalize('NFKD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
};

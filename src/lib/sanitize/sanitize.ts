import DOMPurify from 'isomorphic-dompurify';

/**
 * Strips all HTML tags and attributes from a string.
 * Use this for plain-text fields (names, titles, descriptions, etc.)
 * to prevent XSS attacks when the value is later rendered in the browser.
 */
export const sanitizeText = (input: string): string => {
  return DOMPurify.sanitize(input, { ALLOWED_TAGS: [] }).trim();
};

/**
 * Sanitizes an optional string field. Returns undefined if input is nullish.
 */
export const sanitizeOptional = (
  input: string | null | undefined,
): string | undefined => {
  if (input == null) return undefined;
  return sanitizeText(input);
};

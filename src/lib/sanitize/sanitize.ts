import sanitizeHtml from 'sanitize-html';

/**
 * Strips all HTML tags and attributes from a string.
 * Use this for plain-text fields (names, titles, descriptions, etc.)
 * to prevent XSS attacks when the value is later rendered in the browser.
 */
export const sanitizeText = (input: string): string => {
  return sanitizeHtml(input, {
    allowedTags: [],
    allowedAttributes: {},
    disallowedTagsMode: 'discard',
  }).trim();
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

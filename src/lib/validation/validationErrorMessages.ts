/**
 * Maps validation error messages to translation keys.
 * This allows Zod schemas to remain with English messages,
 * while the UI displays translated error messages based on the current language.
 */

type ErrorMessageMap = Record<string, string>;

export const errorMessageToKeyMap: ErrorMessageMap = {
  'Too Short!': 'validation.nameFieldTooShort',
  'should not contain numbers': 'validation.nameFieldCannotContainNumbers',
  'Invalid email address': 'validation.invalidEmail',
  'Password must be at least 8 characters': 'validation.passwordTooShort', // NOSONAR
  'Password must be at most 64 characters': 'validation.passwordTooLong', // NOSONAR
  'Password must contain at least 8 characters, including uppercase, lowercase, number, and special character':
    'validation.passwordInsufficientComplexity', // NOSONAR
  'Password must adhere to strong policy':
    'validation.passwordMustAdheresToStrongPolicy', // NOSONAR
  'Passwords must match': 'validation.passwordsMustMatch', // NOSONAR
  'Minumum 3 chars needed': 'validation.usernameTooShort',
  'Maximum 20 chars allowed': 'validation.usernameTooLong',
  'You must accept the privacy policy': 'validation.privacyPolicyNotAccepted',
  'Title is required': 'validation.titleRequired',
  'Description is required': 'validation.descriptionRequired',
  'Invalid URL': 'validation.invalidUrl',
  'Must be positive': 'validation.mustBePositive',
  'Difficulty is required': 'validation.difficultyRequired',
  'Category is required': 'validation.categoryRequired',
  'Name is required': 'validation.ingredientNameRequired',
  'Unit is required': 'validation.ingredientUnitRequired',
  'At least one ingredient is required':
    'validation.atLeastOneIngredientRequired',
  'At least one step is required': 'validation.atLeastOneStepRequired',
  'Invalid YouTube URL': 'validation.invalidYoutubeUrl',
  'Must be >= 0': 'validation.mustBeNonNegative',
  'Only lowercase letters, numbers and hyphens':
    'validation.slugInvalidCharacters',
  'Max 60 characters': 'validation.seoTitleTooLong',
  'Max 160 characters': 'validation.seoDescriptionTooLong',
};

/**
 * Translates an error message using the provided translation function.
 * If the message is found in the map, it translates the key.
 * Otherwise, it returns the original message.
 */
export function translateErrorMessage(
  message: string,
  translate: (key: string) => string,
): string {
  const key = errorMessageToKeyMap[message];
  if (key) {
    return translate(key);
  }
  return message;
}

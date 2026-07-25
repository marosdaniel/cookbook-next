/**
 * Quick validation test to verify that all error messages are properly translated.
 * This file checks that all the validation error messages defined in validation.ts
 * have corresponding translation keys in the locale files.
 */

import { describe, expect, it } from 'vitest';
import { errorMessageToKeyMap } from '@/lib/validation/validationErrorMessages';
import deLocale from '@/locales/de.json';
import enLocale from '@/locales/en-gb.json';
import huLocale from '@/locales/hu.json';

describe('Validation translation keys', () => {
  it('should have all error messages mapped to translation keys', () => {
    const mappedKeys = Object.values(errorMessageToKeyMap);
    expect(mappedKeys.length).toBeGreaterThan(0);
  });

  it('should have all translation keys available in Hungarian locale', () => {
    const huValidation = huLocale.validation as Record<string, string>;
    expect(huValidation).toBeDefined();

    Object.values(errorMessageToKeyMap).forEach((key) => {
      const keyParts = key.split('.');
      const actualKey = keyParts[keyParts.length - 1];
      expect(huValidation[actualKey]).toBeDefined();
    });
  });

  it('should have all translation keys available in English locale', () => {
    const enValidation = enLocale.validation as Record<string, string>;
    expect(enValidation).toBeDefined();

    Object.values(errorMessageToKeyMap).forEach((key) => {
      const keyParts = key.split('.');
      const actualKey = keyParts[keyParts.length - 1];
      expect(enValidation[actualKey]).toBeDefined();
    });
  });

  it('should have all translation keys available in German locale', () => {
    const deValidation = deLocale.validation as Record<string, string>;
    expect(deValidation).toBeDefined();

    Object.values(errorMessageToKeyMap).forEach((key) => {
      const keyParts = key.split('.');
      const actualKey = keyParts[keyParts.length - 1];
      expect(deValidation[actualKey]).toBeDefined();
    });
  });
});

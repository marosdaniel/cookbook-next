import { describe, expect, it } from 'vitest';
import {
  loginValidationSchema,
  nameValidationSchema,
  newPasswordValidationSchema,
  PASSWORD_VALIDATOR_REGEX_3_CHAR,
  recipeFormValidationSchema,
  WEAK_PASSWORD_REGEX,
} from './validation';

describe('validation', () => {
  describe('Regex Patterns', () => {
    it('PASSWORD_VALIDATOR_REGEX_3_CHAR should validate correctly', () => {
      expect(PASSWORD_VALIDATOR_REGEX_3_CHAR.test('Ab1')).toBe(true);
      expect(PASSWORD_VALIDATOR_REGEX_3_CHAR.test('ab1')).toBe(false); // No uppercase
      expect(PASSWORD_VALIDATOR_REGEX_3_CHAR.test('AB1')).toBe(false); // No lowercase
      expect(PASSWORD_VALIDATOR_REGEX_3_CHAR.test('Aa1')).toBe(true);
    });

    it('WEAK_PASSWORD_REGEX should validate correctly', () => {
      expect(WEAK_PASSWORD_REGEX.test('Abc12')).toBe(true);
      expect(WEAK_PASSWORD_REGEX.test('Ab1')).toBe(false); // Too short (min 5)
    });
  });

  describe('nameValidationSchema', () => {
    it('should accept valid names', () => {
      const result = nameValidationSchema.safeParse({
        firstName: 'Daniel',
        lastName: 'Maros',
      });
      expect(result.success).toBe(true);
    });

    it('should reject names with numbers', () => {
      const result = nameValidationSchema.safeParse({
        firstName: 'Daniel1',
        lastName: 'Maros',
      });
      expect(result.success).toBe(false);
    });

    it('should reject short names', () => {
      const result = nameValidationSchema.safeParse({
        firstName: 'D',
        lastName: 'M',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('loginValidationSchema', () => {
    it('should accept valid login info', () => {
      const result = loginValidationSchema.safeParse({
        email: 'test@example.com',
        password: 'Password1',
      });
      expect(result.success).toBe(true);
    });

    it('should reject invalid email', () => {
      const result = loginValidationSchema.safeParse({
        email: 'not-an-email',
        password: 'Password1',
      });
      expect(result.success).toBe(false);
    });

    it('should reject weak password', () => {
      const result = loginValidationSchema.safeParse({
        email: 'test@example.com',
        password: 'pass',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('newPasswordValidationSchema', () => {
    it('should accept matching passwords', () => {
      const result = newPasswordValidationSchema.safeParse({
        newPassword: 'Password1',
        confirmNewPassword: 'Password1',
      });
      expect(result.success).toBe(true);
    });

    it('should reject mismatched passwords', () => {
      const result = newPasswordValidationSchema.safeParse({
        newPassword: 'Password1',
        confirmNewPassword: 'Password2',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Passwords must match');
      }
    });
  });

  describe('recipeFormValidationSchema', () => {
    const validRecipe = {
      title: 'Pasta',
      description: 'Delicious pasta',
      cookingTime: 30,
      difficultyLevel: { key: 'easy', name: 'Easy', label: 'Easy' },
      category: { key: 'main', name: 'Main', label: 'Main' },
      ingredients: [{ name: 'Pasta', quantity: 200, unit: 'g' }],
      steps: ['Boil water', 'Cook pasta'],
      servings: 2,
    };

    it('should accept a valid recipe', () => {
      const result = recipeFormValidationSchema.safeParse(validRecipe);
      expect(result.success).toBe(true);
    });

    it('should reject negative cooking time', () => {
      const result = recipeFormValidationSchema.safeParse({
        ...validRecipe,
        cookingTime: -5,
      });
      expect(result.success).toBe(false);
    });

    it('should reject invalid youtube link', () => {
      const result = recipeFormValidationSchema.safeParse({
        ...validRecipe,
        youtubeLink: 'https://google.com',
      });
      expect(result.success).toBe(false);
    });

    it('should accept valid youtube link', () => {
      const result = recipeFormValidationSchema.safeParse({
        ...validRecipe,
        youtubeLink: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      });
      expect(result.success).toBe(true);
    });
  });
});

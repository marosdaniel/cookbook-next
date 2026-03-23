import { describe, expect, it } from 'vitest';
import {
  loginValidationSchema,
  nameValidationSchema,
  newPasswordValidationSchema,
  recipeFormValidationSchema,
  WEAK_PASSWORD_REGEX,
} from './validation';

describe('validation', () => {
  describe('Regex Patterns', () => {
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
        // Warning: Zod error structure might vary, relying on message check
        // refine issue usually puts error on the path
        expect(result.error.issues[0].message).toBe('Passwords must match');
      }
    });
  });

  describe('recipeFormValidationSchema', () => {
    const validRecipe = {
      title: 'Pasta',
      description: 'Delicious pasta',
      cookingTime: 30,
      servings: 2,
      difficultyLevel: { value: 'easy', label: 'Easy' },
      category: { value: 'main', label: 'Main' },
      labels: [],
      ingredients: [{ localId: '1', name: 'Pasta', quantity: 200, unit: 'g' }],
      preparationSteps: [
        { description: 'Boil water', order: 1 },
        { description: 'Cook pasta', order: 2 },
      ],
    };

    it('should accept a valid recipe', () => {
      const result = recipeFormValidationSchema.safeParse(validRecipe);
      if (!result.success) {
        console.error(result.error);
      }
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

    // ─── New time field tests ───
    it('should accept valid time breakdown fields', () => {
      const result = recipeFormValidationSchema.safeParse({
        ...validRecipe,
        prepTimeMinutes: 15,
        cookTimeMinutes: 30,
        restTimeMinutes: 10,
      });
      expect(result.success).toBe(true);
    });

    it('should reject negative prep time', () => {
      const result = recipeFormValidationSchema.safeParse({
        ...validRecipe,
        prepTimeMinutes: -5,
      });
      expect(result.success).toBe(false);
    });

    // ─── Ingredient optional/note tests ───
    it('should accept optional ingredient', () => {
      const result = recipeFormValidationSchema.safeParse({
        ...validRecipe,
        ingredients: [
          {
            localId: '1',
            name: 'Parsley',
            quantity: 10,
            unit: 'g',
            isOptional: true,
            note: 'for garnish',
          },
        ],
      });
      expect(result.success).toBe(true);
    });

    // ─── SEO field tests ───
    it('should reject invalid slug', () => {
      const result = recipeFormValidationSchema.safeParse({
        ...validRecipe,
        slug: 'Invalid Slug With Spaces',
      });
      expect(result.success).toBe(false);
    });

    it('should accept valid slug', () => {
      const result = recipeFormValidationSchema.safeParse({
        ...validRecipe,
        slug: 'delicious-pasta-recipe',
      });
      expect(result.success).toBe(true);
    });

    it('should reject seoTitle longer than 60 chars', () => {
      const result = recipeFormValidationSchema.safeParse({
        ...validRecipe,
        seoTitle: 'a'.repeat(61),
      });
      expect(result.success).toBe(false);
    });

    it('should reject seoDescription longer than 160 chars', () => {
      const result = recipeFormValidationSchema.safeParse({
        ...validRecipe,
        seoDescription: 'a'.repeat(161),
      });
      expect(result.success).toBe(false);
    });

    // ─── Metadata fields tests ───
    it('should accept metadata fields', () => {
      const result = recipeFormValidationSchema.safeParse({
        ...validRecipe,
        cuisine: { value: 'cuisine-italian', label: 'Italian' },
        costLevel: { value: 'cost-level-low', label: 'Low' },
        servingUnit: { value: 'serving-unit-person', label: 'person' },
        dietaryFlags: ['diet-vegan'],
        allergens: ['allergen-milk'],
        equipment: ['equipment-oven'],
        tips: 'Cook al dente',
        substitutions: 'Use penne instead of spaghetti',
      });
      expect(result.success).toBe(true);
    });
  });
});

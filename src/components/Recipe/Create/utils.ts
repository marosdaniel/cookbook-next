import { v4 as uuidv4 } from 'uuid';
import type { RecipeFormSource, RecipeTaxonomyItem } from '@/types/recipe';
import type {
  ComposerSection,
  MetadataOption,
  RecipeFormValues,
} from './types';

/* ─── Constants ───────────────────────────────── */
export const DRAFT_STORAGE_KEY = 'cookbook:create:draft:v2';
export const DESCRIPTION_MAX_LENGTH = 500;
export const SEO_TITLE_MAX_LENGTH = 60;
export const SEO_DESCRIPTION_MAX_LENGTH = 160;

/* ─── Helpers ─────────────────────────────────── */
export function computeCompletion(values: RecipeFormValues) {
  const checks = [
    Boolean(values.title?.trim()),
    Boolean(values.description?.trim()),
    Boolean(values.cookingTime),
    Boolean(values.servings),
    Boolean(values.category),
    Boolean(values.difficultyLevel),
    values.ingredients.length > 0,
    values.preparationSteps.length > 0,
  ];
  const done = checks.filter(Boolean).length;
  return {
    done,
    total: checks.length,
    percent: Math.round((done / checks.length) * 100),
  };
}

export function sectionCompletion(
  section: ComposerSection,
  values: RecipeFormValues,
): { done: number; total: number } {
  switch (section) {
    case 'basics': {
      const checks = [
        Boolean(values.title?.trim()),
        Boolean(values.description?.trim()),
        Boolean(values.cookingTime),
        Boolean(values.servings),
        Boolean(values.category),
        Boolean(values.difficultyLevel),
      ];
      return {
        done: checks.filter(Boolean).length,
        total: checks.length,
      };
    }
    case 'media':
      return { done: values.imgSrc ? 1 : 0, total: 1 };
    case 'ingredients':
      return {
        done: values.ingredients.filter((i) => i.name.trim()).length,
        total: Math.max(values.ingredients.length, 1),
      };
    case 'steps':
      return {
        done: values.preparationSteps.filter((s) => s.description.trim())
          .length,
        total: Math.max(values.preparationSteps.length, 1),
      };
  }
}

export function toCleanedOptions(
  items: RecipeTaxonomyItem[],
  t?: (key: string) => string,
): MetadataOption[] {
  return items.map((m) => {
    const translation = t ? t(m.key) : m.label;
    return {
      value: m.key,
      label: translation === m.key ? m.label : translation,
    };
  });
}

export function transformValuesToInput(
  values: RecipeFormValues,
  labels: MetadataOption[],
) {
  return {
    title: values.title,
    description: values.description,
    imgSrc: values.imgSrc,
    cookingTime: Number(values.cookingTime),
    servings: Number(values.servings),
    difficultyLevel: {
      value: values.difficultyLevel?.value ?? '',
      label: values.difficultyLevel?.label ?? '',
    },
    category: {
      value: values.category?.value ?? '',
      label: values.category?.label ?? '',
    },
    labels: values.labels.map((lKey) => {
      const found = labels.find((l) => l.value === lKey);
      return found
        ? { value: found.value, label: found.label }
        : { value: lKey, label: lKey };
    }),
    youtubeLink: values.youtubeLink,
    ingredients: values.ingredients.map((i) => ({
      localId: i.localId,
      name: i.name,
      quantity: Number(i.quantity),
      unit: i.unit,
      isOptional: i.isOptional ?? false,
      note: i.note || undefined,
    })),
    preparationSteps: values.preparationSteps.map((s, idx) => ({
      description: s.description,
      order: s.order || idx + 1,
    })),

    // Time fields
    prepTimeMinutes: values.prepTimeMinutes
      ? Number(values.prepTimeMinutes)
      : undefined,
    cookTimeMinutes: values.cookTimeMinutes
      ? Number(values.cookTimeMinutes)
      : undefined,
    restTimeMinutes: values.restTimeMinutes
      ? Number(values.restTimeMinutes)
      : undefined,

    // Metadata fields
    servingUnit: values.servingUnit
      ? {
          value: values.servingUnit.value,
          label: values.servingUnit.label,
        }
      : undefined,
    cuisine: values.cuisine
      ? { value: values.cuisine.value, label: values.cuisine.label }
      : undefined,
    dietaryFlags: values.dietaryFlags.map((key) => ({
      value: key,
      label: key,
    })),
    allergens: values.allergens.map((key) => ({ value: key, label: key })),
    equipment: values.equipment.map((key) => ({ value: key, label: key })),
    costLevel: values.costLevel
      ? { value: values.costLevel.value, label: values.costLevel.label }
      : undefined,

    // Text fields
    tips: values.tips || undefined,
    substitutions: values.substitutions || undefined,

    // SEO fields
    slug: values.slug || undefined,
    seoTitle: values.seoTitle || undefined,
    seoDescription: values.seoDescription || undefined,
    socialImage: values.socialImage || undefined,
  };
}

/* ─── UI Helpers ─────────────────────────────── */
export function getProgressColor(percent: number): string {
  if (percent === 100) return 'teal';
  if (percent > 50) return 'blue';
  return 'orange';
}

export function getStatusColor(isComplete: boolean, isActive: boolean): string {
  if (isComplete) return 'green';
  if (isActive) return 'blue';
  return 'gray';
}

/** Default empty form values for all fields */
export const EMPTY_FORM_VALUES: RecipeFormValues = {
  title: '',
  description: '',
  imgSrc: '',
  cookingTime: '',
  servings: '',
  difficultyLevel: null,
  category: null,
  labels: [],
  youtubeLink: '',
  ingredients: [],
  preparationSteps: [],
  prepTimeMinutes: '',
  cookTimeMinutes: '',
  restTimeMinutes: '',
  servingUnit: null,
  cuisine: null,
  dietaryFlags: [],
  allergens: [],
  equipment: [],
  costLevel: null,
  tips: '',
  substitutions: '',
  slug: '',
  seoTitle: '',
  seoDescription: '',
  socialImage: '',
};

/**
 * Transforms a recipe fetched from the server (GraphQL response)
 * into `RecipeFormValues` suitable for the form.
 */
export function recipeToFormValues(recipe: RecipeFormSource): RecipeFormValues {
  return {
    title: recipe.title,
    description: recipe.description ?? '',
    imgSrc: recipe.imgSrc ?? '',
    cookingTime: recipe.cookingTime,
    servings: recipe.servings,
    youtubeLink: recipe.youtubeLink ?? '',
    category: { value: recipe.category.key, label: recipe.category.label },
    difficultyLevel: {
      value: recipe.difficultyLevel.key,
      label: recipe.difficultyLevel.label,
    },
    labels: recipe.labels.map((l) => l.key),
    ingredients: recipe.ingredients.map((i) => ({
      localId: i.localId,
      name: i.name,
      quantity: i.quantity,
      unit: i.unit,
      isOptional: i.isOptional ?? false,
      note: i.note ?? '',
    })),
    preparationSteps: recipe.preparationSteps.map((s) => ({
      localId: uuidv4(),
      description: s.description,
      order: s.order,
    })),

    // New time fields
    prepTimeMinutes: recipe.prepTimeMinutes ?? '',
    cookTimeMinutes: recipe.cookTimeMinutes ?? '',
    restTimeMinutes: recipe.restTimeMinutes ?? '',

    // New metadata fields
    servingUnit: recipe.servingUnit
      ? { value: recipe.servingUnit.key, label: recipe.servingUnit.label }
      : null,
    cuisine: recipe.cuisine
      ? { value: recipe.cuisine.key, label: recipe.cuisine.label }
      : null,
    dietaryFlags: recipe.dietaryFlags?.map((d) => d.key) ?? [],
    allergens: recipe.allergens?.map((a) => a.key) ?? [],
    equipment: recipe.equipment?.map((e) => e.key) ?? [],
    costLevel: recipe.costLevel
      ? { value: recipe.costLevel.key, label: recipe.costLevel.label }
      : null,

    // Text fields
    tips: recipe.tips ?? '',
    substitutions: recipe.substitutions ?? '',

    // SEO fields
    slug: recipe.slug ?? '',
    seoTitle: recipe.seoTitle ?? '',
    seoDescription: recipe.seoDescription ?? '',
    socialImage: recipe.socialImage ?? '',
  };
}

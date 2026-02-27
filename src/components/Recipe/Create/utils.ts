import { v4 as uuidv4 } from 'uuid';
import type {
  ComposerSection,
  RecipeFormValues,
  TMetadataCleaned,
} from './types';

/* ─── Constants ───────────────────────────────── */
export const DRAFT_STORAGE_KEY = 'cookbook:create:draft:v2';
export const DESCRIPTION_MAX_LENGTH = 500;

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
  items: { key: string; label: string }[],
  t?: (key: string) => string,
): TMetadataCleaned[] {
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
  labels: TMetadataCleaned[],
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
    })),
    preparationSteps: values.preparationSteps.map((s, idx) => ({
      description: s.description,
      order: s.order || idx + 1,
    })),
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

/* ─── Server → Form Mapping ──────────────────── */

/**
 * Transforms a recipe fetched from the server (GraphQL response)
 * into `RecipeFormValues` suitable for Formik.
 */
export function recipeToFormValues(recipe: {
  title: string;
  description?: string | null;
  imgSrc?: string | null;
  cookingTime: number;
  servings: number;
  youtubeLink?: string | null;
  category: { key: string; label: string };
  difficultyLevel: { key: string; label: string };
  labels: { key: string; label: string }[];
  ingredients: {
    localId: string;
    name: string;
    quantity: number;
    unit: string;
  }[];
  preparationSteps: { description: string; order: number }[];
}): RecipeFormValues {
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
    })),
    preparationSteps: recipe.preparationSteps.map((s) => ({
      localId: uuidv4(),
      description: s.description,
      order: s.order,
    })),
  };
}

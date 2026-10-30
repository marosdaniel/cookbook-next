import type {
  Prisma,
  Ingredient as PrismaIngredient,
  PreparationStep as PrismaPreparationStep,
  Recipe as PrismaRecipe,
} from '@prisma/client';

export const RECIPE_LIST_SELECT = {
  id: true,
  title: true,
  description: true,
  category: true,
  labels: true,
  imgSrc: true,
  cookingTime: true,
  difficultyLevel: true,
  servings: true,
  youtubeLink: true,
  createdAt: true,
  updatedAt: true,
  prepTimeMinutes: true,
  cookTimeMinutes: true,
  restTimeMinutes: true,
  totalTimeMinutes: true,
  servingUnit: true,
  cuisine: true,
  dietaryFlags: true,
  allergens: true,
  equipment: true,
  costLevel: true,
  tips: true,
  substitutions: true,
  slug: true,
  seoTitle: true,
  seoDescription: true,
  socialImage: true,
  createdBy: true,
} satisfies Prisma.RecipeSelect;

export interface MetaDomainInputPartial {
  value: string;
  label: string;
}

export interface IngredientDomainInput {
  localId: string;
  name: string;
  quantity: number;
  unit: string;
  isOptional?: boolean | null;
  note?: string | null;
}

export interface PreparationStepDomainInput {
  description: string;
  order: number;
}

export type NormalizablePreparationStep = PreparationStepDomainInput & {
  localId?: string;
};

export interface RatingDomainInput {
  recipeId: string;
  ratingValue: number;
}

export interface NormalizedRecipeInput {
  title: string;
  description?: string;
  ingredients: IngredientDomainInput[];
  preparationSteps: NormalizablePreparationStep[];
  category: MetaDomainInputPartial;
  labels?: MetaDomainInputPartial[];
  imgSrc?: string;
  cookingTime: number;
  difficultyLevel: MetaDomainInputPartial;
  servings: number;
  youtubeLink?: string;

  // Time fields
  prepTimeMinutes?: number;
  cookTimeMinutes?: number;
  restTimeMinutes?: number;

  // Metadata fields
  servingUnit?: MetaDomainInputPartial;
  cuisine?: MetaDomainInputPartial;
  dietaryFlags?: MetaDomainInputPartial[];
  allergens?: MetaDomainInputPartial[];
  equipment?: MetaDomainInputPartial[];
  costLevel?: MetaDomainInputPartial;

  // Text fields
  tips?: string;
  substitutions?: string;

  // SEO fields
  slug?: string;
  seoTitle?: string;
  seoDescription?: string;
  socialImage?: string;
}

export type RecipeDomainItem = Pick<
  PrismaRecipe,
  | 'id'
  | 'title'
  | 'description'
  | 'imgSrc'
  | 'cookingTime'
  | 'servings'
  | 'youtubeLink'
  | 'createdBy'
  | 'createdAt'
  | 'updatedAt'
  | 'category'
  | 'difficultyLevel'
  | 'labels'
  | 'prepTimeMinutes'
  | 'cookTimeMinutes'
  | 'restTimeMinutes'
  | 'totalTimeMinutes'
  | 'servingUnit'
  | 'cuisine'
  | 'dietaryFlags'
  | 'allergens'
  | 'equipment'
  | 'costLevel'
  | 'tips'
  | 'substitutions'
  | 'slug'
  | 'seoTitle'
  | 'seoDescription'
  | 'socialImage'
> & {
  ingredients?: PrismaIngredient[];
  preparationSteps?: PrismaPreparationStep[];
};

import type {
  Ingredient as PrismaIngredient,
  PreparationStep as PrismaPreparationStep,
  Recipe as PrismaRecipe,
} from '@prisma/client';

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

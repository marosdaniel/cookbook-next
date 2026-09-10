import type {
  Ingredient as PrismaIngredient,
  PreparationStep as PrismaPreparationStep,
  Recipe as PrismaRecipe,
  User as PrismaUser,
} from '@prisma/client';

export type UserResolverParent = Pick<
  PrismaUser,
  | 'id'
  | 'firstName'
  | 'lastName'
  | 'userName'
  | 'email'
  | 'role'
  | 'locale'
  | 'createdAt'
  | 'updatedAt'
> & {
  recipes?: RecipeResolverParent[] | null;
  favoriteRecipes?: RecipeResolverParent[] | null;
};

export type RecipeResolverParent = Pick<
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

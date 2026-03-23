export interface RecipeTaxonomyItem {
  key: string;
  label: string;
}

export interface RecipeMetadataOption {
  value: string;
  label: string;
}

export interface RecipeIngredient {
  localId: string;
  name: string;
  quantity: number;
  unit: string;
  isOptional?: boolean;
  note?: string;
}

export type RecipeIngredientId = RecipeIngredient['localId'];

export interface RecipePreparationStep {
  description: string;
  order: number;
}

export interface RecipeBase {
  id: string;
  title: string;
  description?: string | null;
  imgSrc?: string | null;
  cookingTime: number;
  servings: number;
  youtubeLink?: string | null;
  createdBy: string;
  category: RecipeTaxonomyItem;
  difficultyLevel: RecipeTaxonomyItem;
  labels: RecipeTaxonomyItem[];
  ingredients: RecipeIngredient[];
  preparationSteps: RecipePreparationStep[];

  // New time fields
  prepTimeMinutes?: number | null;
  cookTimeMinutes?: number | null;
  restTimeMinutes?: number | null;
  totalTimeMinutes?: number | null;

  // New metadata fields
  servingUnit?: RecipeTaxonomyItem | null;
  cuisine?: RecipeTaxonomyItem | null;
  dietaryFlags?: RecipeTaxonomyItem[] | null;
  allergens?: RecipeTaxonomyItem[] | null;
  equipment?: RecipeTaxonomyItem[] | null;
  costLevel?: RecipeTaxonomyItem | null;

  // Text fields
  tips?: string | null;
  substitutions?: string | null;

  // SEO fields
  slug?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  socialImage?: string | null;
}

export interface RecipeDetail extends RecipeBase {
  averageRating: number;
  ratingsCount: number;
  userRating?: number | null;
  isFavorite?: boolean | null;
}

export type RecipeFormSource = Pick<
  RecipeBase,
  | 'title'
  | 'description'
  | 'imgSrc'
  | 'cookingTime'
  | 'servings'
  | 'youtubeLink'
  | 'category'
  | 'difficultyLevel'
  | 'labels'
  | 'ingredients'
  | 'preparationSteps'
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
>;

export type RecipeCardDataBase = Pick<
  RecipeBase,
  | 'id'
  | 'title'
  | 'description'
  | 'imgSrc'
  | 'cookingTime'
  | 'servings'
  | 'createdBy'
  | 'category'
  | 'difficultyLevel'
>;

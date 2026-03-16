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

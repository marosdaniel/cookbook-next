export interface RecipeRatingProps {
  recipeId: string;
  userRating?: number | null;
  averageRating: number;
  ratingsCount: number;
  readOnly?: boolean;
}

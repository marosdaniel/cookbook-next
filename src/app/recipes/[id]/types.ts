export interface RecipeDetailData {
  getRecipeById: {
    id: string;
    title: string;
    description?: string | null;
    imgSrc?: string | null;
    cookingTime: number;
    servings: number;
    youtubeLink?: string | null;
    createdBy: string;
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
    averageRating: number;
    ratingsCount: number;
    userRating?: number | null;
    isFavorite?: boolean | null;
  };
}

export interface RecipeDetailClientProps {
  recipeId: string;
}

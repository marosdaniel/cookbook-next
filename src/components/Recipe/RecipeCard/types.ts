export interface RecipeCardData {
  id: string;
  title: string;
  description?: string | null;
  imgSrc?: string | null;
  cookingTime: number;
  servings: number;
  createdBy: string;
  category: {
    key: string;
    label: string;
  };
  difficultyLevel: {
    key: string;
    label: string;
  };
  averageRating?: number;
  ratingsCount?: number;
  isFavorite?: boolean;
}

export interface RecipeCardProps {
  recipe: RecipeCardData;
  withFavorite?: boolean;
}

export interface RecipeGridProps {
  recipes: RecipeCardData[];
  loading?: boolean;
  withFavorite?: boolean;
  emptyMessage?: string;
  columns?: {
    base?: number;
    sm?: number;
    md?: number;
    lg?: number;
  };
}

import type { BaseMutationResponse } from '../../../types/common';

export interface FavoriteButtonProps {
  recipeId: string;
  isFavorite?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export interface FavoriteMutationData {
  removeFromFavoriteRecipes?: BaseMutationResponse;
  addToFavoriteRecipes?: BaseMutationResponse;
}

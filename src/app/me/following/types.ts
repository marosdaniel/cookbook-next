import type { RecipeCardData } from '../../../components/Recipe/RecipeCard';

export interface FollowedUser {
  id: string;
  firstName: string;
  lastName: string;
  userName: string;
  recipeCount: number;
  followedAt: string;
  latestRecipes: RecipeCardData[];
}

export interface FollowingData {
  getFollowing: {
    users: FollowedUser[];
    totalFollowing: number;
  };
}

export interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}

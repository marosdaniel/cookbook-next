import { gql, type TypedDocumentNode } from '@apollo/client';
import type { RecipeCardData } from '@/components/Recipe/RecipeCard';
import type { RecipeDetail } from '@/types/recipe';

interface GetUserByIdData {
  getUserById: {
    id: string;
    firstName: string;
    lastName: string;
    userName: string;
    email: string;
    role: string;
    locale: string;
    createdAt: string;
    updatedAt: string;
  };
}

interface GetUserByIdVariables {
  id: string;
}

interface GetRecipeByIdData {
  getRecipeById: RecipeDetail;
}

interface GetRecipeByIdVariables {
  id: string;
}

interface GetFavoriteRecipesData {
  getFavoriteRecipes: RecipeCardData[];
}

interface GetFavoriteRecipesVariables {
  userId?: string;
  limit?: number;
}

interface GetRecipesData {
  getRecipes: {
    recipes: RecipeCardData[];
    totalRecipes: number;
  };
}

interface GetRecipesVariables {
  limit?: number;
  filter?: Record<string, unknown>;
}

interface GetRecipesByUserIdData {
  getRecipesByUserId: {
    recipes: RecipeCardData[];
    totalRecipes: number;
  };
}

interface GetRecipesByUserIdVariables {
  userId?: string;
  limit?: number;
}

interface GetFollowingData {
  getFollowing: {
    users: Array<{
      id: string;
      firstName: string;
      lastName: string;
      userName: string;
      recipeCount: number;
      followedAt: string;
      latestRecipes: RecipeCardData[];
    }>;
    totalFollowing: number;
  };
}

interface GetFollowingVariables {
  userId?: string;
  limit?: number;
}

export const GET_USER_BY_ID: TypedDocumentNode<
  GetUserByIdData,
  GetUserByIdVariables
> = gql`
  query getUserById($id: ID!) {
    getUserById(id: $id) {
      id
      firstName
      lastName
      userName
      email
      role
      locale
      createdAt
      updatedAt
    }
  }
`;

export const GET_ALL_METADATA = gql`
  query getAllMetadata {
    getAllMetadata {
      key
      label
      type
      name
    }
  }
`;

export const GET_METADATA_BY_TYPE = gql`
  query getMetadataByType($type: String!) {
    getMetadataByType(type: $type) {
      key
      label
      type
      name
    }
  }
`;

export const GET_RECIPE_BY_ID: TypedDocumentNode<
  GetRecipeByIdData,
  GetRecipeByIdVariables
> = gql`
  query getRecipeById($id: ID!) {
    getRecipeById(id: $id) {
      id
      title
      description
      imgSrc
      cookingTime
      servings
      youtubeLink
      createdBy
      category {
        key
        label
      }
      difficultyLevel {
        key
        label
      }
      labels {
        key
        label
      }
      ingredients {
        localId
        name
        quantity
        unit
        isOptional
        note
      }
      preparationSteps {
        description
        order
      }
      averageRating
      ratingsCount
      userRating
      isFavorite
      prepTimeMinutes
      cookTimeMinutes
      restTimeMinutes
      totalTimeMinutes
      servingUnit {
        key
        label
      }
      cuisine {
        key
        label
      }
      dietaryFlags {
        key
        label
      }
      allergens {
        key
        label
      }
      equipment {
        key
        label
      }
      costLevel {
        key
        label
      }
      tips
      substitutions
      slug
      seoTitle
      seoDescription
      socialImage
    }
  }
`;

export const GET_FAVORITE_RECIPES: TypedDocumentNode<
  GetFavoriteRecipesData,
  GetFavoriteRecipesVariables
> = gql`
  query getFavoriteRecipes($userId: ID!, $limit: Int) {
    getFavoriteRecipes(userId: $userId, limit: $limit) {
      id
      title
      description
      imgSrc
      cookingTime
      servings
      createdBy
      category {
        key
        label
      }
      difficultyLevel {
        key
        label
      }
      averageRating
      ratingsCount
      isFavorite
    }
  }
`;

export const GET_LATEST_RECIPES: TypedDocumentNode<
  GetRecipesData,
  GetRecipesVariables
> = gql`
  query getRecipes($limit: Int, $filter: RecipeFilterInput) {
    getRecipes(limit: $limit, filter: $filter) {
      recipes {
        id
        title
        description
        imgSrc
        cookingTime
        servings
        createdBy
        category {
          key
          label
        }
        difficultyLevel {
          key
          label
        }
        averageRating
        ratingsCount
        isFavorite
      }
      totalRecipes
    }
  }
`;

export const GET_RECIPES_BY_USER_ID: TypedDocumentNode<
  GetRecipesByUserIdData,
  GetRecipesByUserIdVariables
> = gql`
  query getRecipesByUserId($userId: ID!, $limit: Int) {
    getRecipesByUserId(userId: $userId, limit: $limit) {
      recipes {
        id
        title
        description
        imgSrc
        cookingTime
        servings
        createdBy
        category {
          key
          label
        }
        difficultyLevel {
          key
          label
        }
        averageRating
        ratingsCount
        isFavorite
      }
      totalRecipes
    }
  }
`;

export const GET_FOLLOWING: TypedDocumentNode<
  GetFollowingData,
  GetFollowingVariables
> = gql`
  query getFollowing($userId: ID!, $limit: Int) {
    getFollowing(userId: $userId, limit: $limit) {
      users {
        id
        firstName
        lastName
        userName
        recipeCount
        followedAt
        latestRecipes {
          id
          title
          description
          imgSrc
          cookingTime
          servings
          createdBy
          category {
            key
            label
          }
          difficultyLevel {
            key
            label
          }
          averageRating
          ratingsCount
          isFavorite
        }
      }
      totalFollowing
    }
  }
`;

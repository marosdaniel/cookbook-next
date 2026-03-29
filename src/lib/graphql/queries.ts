import { gql } from '@apollo/client';

export const GET_USER_BY_ID = gql`
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

export const GET_RECIPE_BY_ID = gql`
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

export const GET_FAVORITE_RECIPES = gql`
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

export const GET_LATEST_RECIPES = gql`
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

export const GET_RECIPES_BY_USER_ID = gql`
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

export const GET_FOLLOWING = gql`
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

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
      }
      preparationSteps {
        description
        order
      }
    }
  }
`;

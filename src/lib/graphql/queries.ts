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

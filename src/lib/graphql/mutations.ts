import { gql } from '@apollo/client';

/**
 * Mutation to create a new user account
 */
export const CREATE_USER = gql`
  mutation CreateUser($userRegisterInput: UserRegisterInput!) {
    createUser(userRegisterInput: $userRegisterInput) {
      id
      firstName
      lastName
      userName
      email
      role
    }
  }
`;

export const RESET_PASSWORD = gql`
  mutation ResetPassword($email: String!) {
    resetPassword(email: $email) {
      success
      message
    }
  }
`;

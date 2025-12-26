import { gql } from '@apollo/client';

/**
 * Mutation to create a new user account
 */
export const CREATE_USER = gql`
  mutation createUser($userRegisterInput: UserRegisterInput!) {
    createUser(userRegisterInput: $userRegisterInput) {
      success
      message
      messageKey
      user {
        id
        email
        firstName
        lastName
        userName
      }
    }
  }
`;

export const RESET_PASSWORD = gql`
  mutation resetPassword($email: String!) {
    resetPassword(email: $email) {
      success
      message
    }
  }
`;

export const SET_NEW_PASSWORD = gql`
  mutation setNewPassword($token: String!, $newPassword: String!) {
    setNewPassword(token: $token, newPassword: $newPassword) {
      success
      message
    }
  }
`;

export const CHANGE_PASSWORD = gql`
  mutation changePassword($passwordEditInput: PasswordEditInput!) {
    changePassword(passwordEditInput: $passwordEditInput) {
      success
      message
    }
  }
`;

export const UPDATE_USER = gql`
  mutation updateUser($userUpdateInput: UserUpdateInput!) {
    updateUser(userUpdateInput: $userUpdateInput) {
      success
      message
      user {
        id
        firstName
        lastName
      }
    }
  }
`;

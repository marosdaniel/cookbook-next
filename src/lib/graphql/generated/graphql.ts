/* eslint-disable */
/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
import { DocumentTypeDecoration } from '@graphql-typed-document-node/core';
export type IngredientInput = {
  isOptional?: boolean | null | undefined;
  localId: string;
  name: string;
  note?: string | null | undefined;
  quantity: number;
  unit: string;
};

export type MetaInputPartial = {
  label: string;
  value: string;
};

export type PasswordEditInput = {
  confirmNewPassword: string;
  currentPassword: string;
  newPassword: string;
};

export type PreparationStepInput = {
  description: string;
  order: number;
};

export type RatingInput = {
  ratingValue: number;
  recipeId: string | number;
};

export type RecipeCreateInput = {
  allergens?: Array<MetaInputPartial | null | undefined> | null | undefined;
  category: MetaInputPartial;
  cookTimeMinutes?: number | null | undefined;
  cookingTime: number;
  costLevel?: MetaInputPartial | null | undefined;
  cuisine?: MetaInputPartial | null | undefined;
  description?: string | null | undefined;
  dietaryFlags?: Array<MetaInputPartial | null | undefined> | null | undefined;
  difficultyLevel: MetaInputPartial;
  equipment?: Array<MetaInputPartial | null | undefined> | null | undefined;
  imgSrc?: string | null | undefined;
  ingredients: Array<IngredientInput | null | undefined>;
  labels?: Array<MetaInputPartial | null | undefined> | null | undefined;
  prepTimeMinutes?: number | null | undefined;
  preparationSteps: Array<PreparationStepInput | null | undefined>;
  restTimeMinutes?: number | null | undefined;
  seoDescription?: string | null | undefined;
  seoTitle?: string | null | undefined;
  servingUnit?: MetaInputPartial | null | undefined;
  servings: number;
  slug?: string | null | undefined;
  socialImage?: string | null | undefined;
  substitutions?: string | null | undefined;
  tips?: string | null | undefined;
  title: string;
  youtubeLink?: string | null | undefined;
};

export type RecipeEditInput = {
  allergens?: Array<MetaInputPartial | null | undefined> | null | undefined;
  category: MetaInputPartial;
  cookTimeMinutes?: number | null | undefined;
  cookingTime: number;
  costLevel?: MetaInputPartial | null | undefined;
  cuisine?: MetaInputPartial | null | undefined;
  description?: string | null | undefined;
  dietaryFlags?: Array<MetaInputPartial | null | undefined> | null | undefined;
  difficultyLevel: MetaInputPartial;
  equipment?: Array<MetaInputPartial | null | undefined> | null | undefined;
  imgSrc?: string | null | undefined;
  ingredients: Array<IngredientInput | null | undefined>;
  labels?: Array<MetaInputPartial | null | undefined> | null | undefined;
  prepTimeMinutes?: number | null | undefined;
  preparationSteps: Array<PreparationStepInput | null | undefined>;
  restTimeMinutes?: number | null | undefined;
  seoDescription?: string | null | undefined;
  seoTitle?: string | null | undefined;
  servingUnit?: MetaInputPartial | null | undefined;
  servings: number;
  slug?: string | null | undefined;
  socialImage?: string | null | undefined;
  substitutions?: string | null | undefined;
  tips?: string | null | undefined;
  title: string;
  youtubeLink?: string | null | undefined;
};

export type RecipeFilterInput = {
  allergenKeys?: Array<string> | null | undefined;
  categoryKey?: string | null | undefined;
  costLevelKey?: string | null | undefined;
  cuisineKey?: string | null | undefined;
  dietaryFlagKeys?: Array<string> | null | undefined;
  difficultyLevelKey?: string | null | undefined;
  equipmentKeys?: Array<string> | null | undefined;
  labelKeys?: Array<string> | null | undefined;
  maxCookingTime?: number | null | undefined;
  title?: string | null | undefined;
};

export type UserRegisterInput = {
  confirmPassword: string;
  email: string;
  firstName: string;
  lastName: string;
  locale?: string | null | undefined;
  password: string;
  userName: string;
};

export type UserRole =
  | 'ADMIN'
  | 'BLOGGER'
  | 'USER';

export type UserUpdateInput = {
  firstName?: string | null | undefined;
  lastName?: string | null | undefined;
  locale?: string | null | undefined;
};

export type CreateUserMutationVariables = Exact<{
  userRegisterInput: UserRegisterInput;
}>;


export type CreateUserMutation = { createUser: { success: boolean, message: string, messageKey: string, user: { id: string, email: string, firstName: string, lastName: string, userName: string } | null } };

export type ResetPasswordMutationVariables = Exact<{
  email: string;
}>;


export type ResetPasswordMutation = { resetPassword: { success: boolean | null, message: string | null } };

export type SetNewPasswordMutationVariables = Exact<{
  token: string;
  newPassword: string;
}>;


export type SetNewPasswordMutation = { setNewPassword: { success: boolean | null, message: string | null } };

export type ChangePasswordMutationVariables = Exact<{
  passwordEditInput: PasswordEditInput;
}>;


export type ChangePasswordMutation = { changePassword: boolean };

export type UpdateUserMutationVariables = Exact<{
  userUpdateInput: UserUpdateInput;
}>;


export type UpdateUserMutation = { updateUser: { success: boolean, message: string, user: { id: string, firstName: string, lastName: string } | null } };

export type CreateRecipeMutationVariables = Exact<{
  recipeCreateInput: RecipeCreateInput;
}>;


export type CreateRecipeMutation = { createRecipe: { id: string, title: string } };

export type EditRecipeMutationVariables = Exact<{
  id: string | number;
  recipeEditInput: RecipeEditInput;
}>;


export type EditRecipeMutation = { editRecipe: { id: string, title: string } };

export type RateRecipeMutationVariables = Exact<{
  ratingInput: RatingInput;
}>;


export type RateRecipeMutation = { rateRecipe: { id: string, averageRating: number, ratingsCount: number, userRating: number | null } };

export type DeleteRatingMutationVariables = Exact<{
  recipeId: string | number;
}>;


export type DeleteRatingMutation = { deleteRating: boolean };

export type AddToFavoriteRecipesMutationVariables = Exact<{
  userId: string | number;
  recipeId: string | number;
}>;


export type AddToFavoriteRecipesMutation = { addToFavoriteRecipes: { success: boolean, message: string, messageKey: string, statusCode: number | null } };

export type RemoveFromFavoriteRecipesMutationVariables = Exact<{
  userId: string | number;
  recipeId: string | number;
}>;


export type RemoveFromFavoriteRecipesMutation = { removeFromFavoriteRecipes: { success: boolean, message: string, messageKey: string, statusCode: number | null } };

export type FollowUserMutationVariables = Exact<{
  targetUserId: string | number;
}>;


export type FollowUserMutation = { followUser: { success: boolean, message: string, messageKey: string, statusCode: number | null } };

export type UnfollowUserMutationVariables = Exact<{
  targetUserId: string | number;
}>;


export type UnfollowUserMutation = { unfollowUser: { success: boolean, message: string, messageKey: string, statusCode: number | null } };

export type GetUserByIdQueryVariables = Exact<{
  id: string | number;
}>;


export type GetUserByIdQuery = { getUserById: { id: string, firstName: string, lastName: string, userName: string, email: string, role: UserRole, locale: string, createdAt: string, updatedAt: string } };

export type GetAllMetadataQueryVariables = Exact<{ [key: string]: never; }>;


export type GetAllMetadataQuery = { getAllMetadata: Array<{ key: string, label: string, type: string, name: string } | null> };

export type GetMetadataByTypeQueryVariables = Exact<{
  type: string;
}>;


export type GetMetadataByTypeQuery = { getMetadataByType: Array<{ key: string, label: string, type: string, name: string } | null> };

export type GetRecipeByIdQueryVariables = Exact<{
  id: string | number;
}>;


export type GetRecipeByIdQuery = { getRecipeById: { id: string, title: string, description: string | null, imgSrc: string | null, cookingTime: number, servings: number, youtubeLink: string | null, createdBy: string, averageRating: number, ratingsCount: number, userRating: number | null, isFavorite: boolean | null, prepTimeMinutes: number | null, cookTimeMinutes: number | null, restTimeMinutes: number | null, totalTimeMinutes: number | null, tips: string | null, substitutions: string | null, slug: string | null, seoTitle: string | null, seoDescription: string | null, socialImage: string | null, category: { key: string, label: string }, difficultyLevel: { key: string, label: string }, labels: Array<{ key: string, label: string } | null>, ingredients: Array<{ localId: string, name: string, quantity: number, unit: string, isOptional: boolean, note: string | null } | null>, preparationSteps: Array<{ description: string, order: number } | null>, servingUnit: { key: string, label: string } | null, cuisine: { key: string, label: string } | null, dietaryFlags: Array<{ key: string, label: string } | null> | null, allergens: Array<{ key: string, label: string } | null> | null, equipment: Array<{ key: string, label: string } | null> | null, costLevel: { key: string, label: string } | null } };

export type GetFavoriteRecipesQueryVariables = Exact<{
  limit?: number | null | undefined;
}>;


export type GetFavoriteRecipesQuery = { getFavoriteRecipes: Array<{ id: string, title: string, description: string | null, imgSrc: string | null, cookingTime: number, servings: number, createdBy: string, averageRating: number, ratingsCount: number, isFavorite: boolean | null, slug: string | null, category: { key: string, label: string }, difficultyLevel: { key: string, label: string } }> };

export type GetRecipesQueryVariables = Exact<{
  limit?: number | null | undefined;
  filter?: RecipeFilterInput | null | undefined;
}>;


export type GetRecipesQuery = { getRecipes: { totalRecipes: number, recipes: Array<{ id: string, title: string, description: string | null, imgSrc: string | null, cookingTime: number, servings: number, createdBy: string, averageRating: number, ratingsCount: number, isFavorite: boolean | null, slug: string | null, category: { key: string, label: string }, difficultyLevel: { key: string, label: string } } | null> } };

export type GetRecipesByUserIdQueryVariables = Exact<{
  userId: string | number;
  limit?: number | null | undefined;
}>;


export type GetRecipesByUserIdQuery = { getRecipesByUserId: { totalRecipes: number, recipes: Array<{ id: string, title: string, description: string | null, imgSrc: string | null, cookingTime: number, servings: number, createdBy: string, averageRating: number, ratingsCount: number, isFavorite: boolean | null, slug: string | null, category: { key: string, label: string }, difficultyLevel: { key: string, label: string } } | null> } };

export type GetFollowingQueryVariables = Exact<{
  limit?: number | null | undefined;
}>;


export type GetFollowingQuery = { getFollowing: { totalFollowing: number, users: Array<{ id: string, firstName: string, lastName: string, userName: string, recipeCount: number, followedAt: string, latestRecipes: Array<{ id: string, title: string, description: string | null, imgSrc: string | null, cookingTime: number, servings: number, createdBy: string, averageRating: number, ratingsCount: number, isFavorite: boolean | null, category: { key: string, label: string }, difficultyLevel: { key: string, label: string } }> }> } };

export class TypedDocumentString<TResult, TVariables>
  extends String
  implements DocumentTypeDecoration<TResult, TVariables>
{
  __apiType?: NonNullable<DocumentTypeDecoration<TResult, TVariables>['__apiType']>;
  private value: string;
  public __meta__?: Record<string, any> | undefined;

  constructor(value: string, __meta__?: Record<string, any> | undefined) {
    super(value);
    this.value = value;
    this.__meta__ = __meta__;
  }

  override toString(): string & DocumentTypeDecoration<TResult, TVariables> {
    return this.value;
  }
}

export const CreateUserDocument = new TypedDocumentString(`
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
    `) as unknown as TypedDocumentString<CreateUserMutation, CreateUserMutationVariables>;
export const ResetPasswordDocument = new TypedDocumentString(`
    mutation resetPassword($email: String!) {
  resetPassword(email: $email) {
    success
    message
  }
}
    `) as unknown as TypedDocumentString<ResetPasswordMutation, ResetPasswordMutationVariables>;
export const SetNewPasswordDocument = new TypedDocumentString(`
    mutation setNewPassword($token: String!, $newPassword: String!) {
  setNewPassword(token: $token, newPassword: $newPassword) {
    success
    message
  }
}
    `) as unknown as TypedDocumentString<SetNewPasswordMutation, SetNewPasswordMutationVariables>;
export const ChangePasswordDocument = new TypedDocumentString(`
    mutation changePassword($passwordEditInput: PasswordEditInput!) {
  changePassword(passwordEditInput: $passwordEditInput)
}
    `) as unknown as TypedDocumentString<ChangePasswordMutation, ChangePasswordMutationVariables>;
export const UpdateUserDocument = new TypedDocumentString(`
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
    `) as unknown as TypedDocumentString<UpdateUserMutation, UpdateUserMutationVariables>;
export const CreateRecipeDocument = new TypedDocumentString(`
    mutation CreateRecipe($recipeCreateInput: RecipeCreateInput!) {
  createRecipe(recipeCreateInput: $recipeCreateInput) {
    id
    title
  }
}
    `) as unknown as TypedDocumentString<CreateRecipeMutation, CreateRecipeMutationVariables>;
export const EditRecipeDocument = new TypedDocumentString(`
    mutation EditRecipe($id: ID!, $recipeEditInput: RecipeEditInput!) {
  editRecipe(id: $id, recipeEditInput: $recipeEditInput) {
    id
    title
  }
}
    `) as unknown as TypedDocumentString<EditRecipeMutation, EditRecipeMutationVariables>;
export const RateRecipeDocument = new TypedDocumentString(`
    mutation RateRecipe($ratingInput: RatingInput!) {
  rateRecipe(ratingInput: $ratingInput) {
    id
    averageRating
    ratingsCount
    userRating
  }
}
    `) as unknown as TypedDocumentString<RateRecipeMutation, RateRecipeMutationVariables>;
export const DeleteRatingDocument = new TypedDocumentString(`
    mutation DeleteRating($recipeId: ID!) {
  deleteRating(recipeId: $recipeId)
}
    `) as unknown as TypedDocumentString<DeleteRatingMutation, DeleteRatingMutationVariables>;
export const AddToFavoriteRecipesDocument = new TypedDocumentString(`
    mutation AddToFavoriteRecipes($userId: ID!, $recipeId: ID!) {
  addToFavoriteRecipes(userId: $userId, recipeId: $recipeId) {
    success
    message
    messageKey
    statusCode
  }
}
    `) as unknown as TypedDocumentString<AddToFavoriteRecipesMutation, AddToFavoriteRecipesMutationVariables>;
export const RemoveFromFavoriteRecipesDocument = new TypedDocumentString(`
    mutation RemoveFromFavoriteRecipes($userId: ID!, $recipeId: ID!) {
  removeFromFavoriteRecipes(userId: $userId, recipeId: $recipeId) {
    success
    message
    messageKey
    statusCode
  }
}
    `) as unknown as TypedDocumentString<RemoveFromFavoriteRecipesMutation, RemoveFromFavoriteRecipesMutationVariables>;
export const FollowUserDocument = new TypedDocumentString(`
    mutation FollowUser($targetUserId: ID!) {
  followUser(targetUserId: $targetUserId) {
    success
    message
    messageKey
    statusCode
  }
}
    `) as unknown as TypedDocumentString<FollowUserMutation, FollowUserMutationVariables>;
export const UnfollowUserDocument = new TypedDocumentString(`
    mutation UnfollowUser($targetUserId: ID!) {
  unfollowUser(targetUserId: $targetUserId) {
    success
    message
    messageKey
    statusCode
  }
}
    `) as unknown as TypedDocumentString<UnfollowUserMutation, UnfollowUserMutationVariables>;
export const GetUserByIdDocument = new TypedDocumentString(`
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
    `) as unknown as TypedDocumentString<GetUserByIdQuery, GetUserByIdQueryVariables>;
export const GetAllMetadataDocument = new TypedDocumentString(`
    query getAllMetadata {
  getAllMetadata {
    key
    label
    type
    name
  }
}
    `) as unknown as TypedDocumentString<GetAllMetadataQuery, GetAllMetadataQueryVariables>;
export const GetMetadataByTypeDocument = new TypedDocumentString(`
    query getMetadataByType($type: String!) {
  getMetadataByType(type: $type) {
    key
    label
    type
    name
  }
}
    `) as unknown as TypedDocumentString<GetMetadataByTypeQuery, GetMetadataByTypeQueryVariables>;
export const GetRecipeByIdDocument = new TypedDocumentString(`
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
    `) as unknown as TypedDocumentString<GetRecipeByIdQuery, GetRecipeByIdQueryVariables>;
export const GetFavoriteRecipesDocument = new TypedDocumentString(`
    query getFavoriteRecipes($limit: Int) {
  getFavoriteRecipes(limit: $limit) {
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
    slug
  }
}
    `) as unknown as TypedDocumentString<GetFavoriteRecipesQuery, GetFavoriteRecipesQueryVariables>;
export const GetRecipesDocument = new TypedDocumentString(`
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
      slug
    }
    totalRecipes
  }
}
    `) as unknown as TypedDocumentString<GetRecipesQuery, GetRecipesQueryVariables>;
export const GetRecipesByUserIdDocument = new TypedDocumentString(`
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
      slug
    }
    totalRecipes
  }
}
    `) as unknown as TypedDocumentString<GetRecipesByUserIdQuery, GetRecipesByUserIdQueryVariables>;
export const GetFollowingDocument = new TypedDocumentString(`
    query getFollowing($limit: Int) {
  getFollowing(limit: $limit) {
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
    `) as unknown as TypedDocumentString<GetFollowingQuery, GetFollowingQueryVariables>;
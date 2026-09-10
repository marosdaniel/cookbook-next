import { UserRole } from '@prisma/client';
import { GraphQLResolveInfo, GraphQLScalarType, GraphQLScalarTypeConfig } from 'graphql';
import { RecipeResolverParent, UserResolverParent } from '@/lib/graphql/resolvers/types';
import { GraphQLContext } from '@/types/graphql/context';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
export type RequireFields<T, K extends keyof T> = Omit<T, K> & { [P in K]-?: NonNullable<T[P]> };
export type EnumResolverSignature<T, AllowedValues = any> = { [key in keyof T]?: AllowedValues };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  DateTime: { input: string; output: Date; }
};

export type BaseResponse = {
  __typename?: 'BaseResponse';
  message?: Maybe<Scalars['String']['output']>;
  success?: Maybe<Scalars['Boolean']['output']>;
};

export type Category = {
  __typename?: 'Category';
  id?: Maybe<Scalars['ID']['output']>;
  key: Scalars['String']['output'];
  label: Scalars['String']['output'];
  name: Scalars['String']['output'];
  type: Scalars['String']['output'];
};

export type DifficultyLevel = {
  __typename?: 'DifficultyLevel';
  id?: Maybe<Scalars['ID']['output']>;
  key: Scalars['String']['output'];
  label: Scalars['String']['output'];
  name: Scalars['String']['output'];
  type: Scalars['String']['output'];
};

export type FollowedUser = {
  __typename?: 'FollowedUser';
  firstName: Scalars['String']['output'];
  followedAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  lastName: Scalars['String']['output'];
  latestRecipes: Array<Recipe>;
  recipeCount: Scalars['Int']['output'];
  userName: Scalars['String']['output'];
};

export type FollowingData = {
  __typename?: 'FollowingData';
  totalFollowing: Scalars['Int']['output'];
  users: Array<FollowedUser>;
};

export type Ingredient = {
  __typename?: 'Ingredient';
  id?: Maybe<Scalars['ID']['output']>;
  isOptional: Scalars['Boolean']['output'];
  localId: Scalars['String']['output'];
  name: Scalars['String']['output'];
  note?: Maybe<Scalars['String']['output']>;
  quantity: Scalars['Float']['output'];
  unit: Scalars['String']['output'];
};

export type IngredientInput = {
  isOptional?: InputMaybe<Scalars['Boolean']['input']>;
  localId: Scalars['String']['input'];
  name: Scalars['String']['input'];
  note?: InputMaybe<Scalars['String']['input']>;
  quantity: Scalars['Float']['input'];
  unit: Scalars['String']['input'];
};

export type Label = {
  __typename?: 'Label';
  id?: Maybe<Scalars['ID']['output']>;
  key: Scalars['String']['output'];
  label: Scalars['String']['output'];
  name: Scalars['String']['output'];
  type: Scalars['String']['output'];
};

export type MetaInputPartial = {
  label: Scalars['String']['input'];
  value: Scalars['String']['input'];
};

export type MetadataItem = {
  __typename?: 'MetadataItem';
  id?: Maybe<Scalars['ID']['output']>;
  key: Scalars['String']['output'];
  label: Scalars['String']['output'];
  name: Scalars['String']['output'];
  type: Scalars['String']['output'];
};

export type Mutation = {
  __typename?: 'Mutation';
  addToFavoriteRecipes: OperationResponse;
  changePassword: BaseResponse;
  cleanUserRecipes: Scalars['Boolean']['output'];
  createRecipe: Recipe;
  createUser: UserOperationResponse;
  deleteAllRecipes: Scalars['Int']['output'];
  deleteAllUser: Scalars['Int']['output'];
  deleteRating: Scalars['Boolean']['output'];
  deleteRecipe: Scalars['Boolean']['output'];
  deleteUser: Scalars['Boolean']['output'];
  editRecipe: Recipe;
  followUser: OperationResponse;
  rateRecipe: Recipe;
  removeFromFavoriteRecipes: OperationResponse;
  resetPassword: BaseResponse;
  setNewPassword: BaseResponse;
  unfollowUser: OperationResponse;
  updateUser: UserUpdateResponse;
};


export type MutationAddToFavoriteRecipesArgs = {
  recipeId: Scalars['ID']['input'];
  userId: Scalars['ID']['input'];
};


export type MutationChangePasswordArgs = {
  passwordEditInput: PasswordEditInput;
};


export type MutationCleanUserRecipesArgs = {
  userId: Scalars['ID']['input'];
};


export type MutationCreateRecipeArgs = {
  recipeCreateInput?: InputMaybe<RecipeCreateInput>;
};


export type MutationCreateUserArgs = {
  userRegisterInput?: InputMaybe<UserRegisterInput>;
};


export type MutationDeleteAllRecipesArgs = {
  confirmation: Scalars['String']['input'];
};


export type MutationDeleteAllUserArgs = {
  confirmation: Scalars['String']['input'];
};


export type MutationDeleteRatingArgs = {
  recipeId: Scalars['ID']['input'];
};


export type MutationDeleteRecipeArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteUserArgs = {
  id: Scalars['ID']['input'];
};


export type MutationEditRecipeArgs = {
  id: Scalars['ID']['input'];
  recipeEditInput?: InputMaybe<RecipeEditInput>;
};


export type MutationFollowUserArgs = {
  targetUserId: Scalars['ID']['input'];
};


export type MutationRateRecipeArgs = {
  ratingInput: RatingInput;
};


export type MutationRemoveFromFavoriteRecipesArgs = {
  recipeId: Scalars['ID']['input'];
  userId: Scalars['ID']['input'];
};


export type MutationResetPasswordArgs = {
  email: Scalars['String']['input'];
};


export type MutationSetNewPasswordArgs = {
  newPassword: Scalars['String']['input'];
  token: Scalars['String']['input'];
};


export type MutationUnfollowUserArgs = {
  targetUserId: Scalars['ID']['input'];
};


export type MutationUpdateUserArgs = {
  userUpdateInput: UserUpdateInput;
};

export type OperationResponse = {
  __typename?: 'OperationResponse';
  message: Scalars['String']['output'];
  messageKey: Scalars['String']['output'];
  statusCode?: Maybe<Scalars['Int']['output']>;
  success: Scalars['Boolean']['output'];
};

export type PageInfo = {
  __typename?: 'PageInfo';
  endCursor?: Maybe<Scalars['String']['output']>;
  hasNextPage: Scalars['Boolean']['output'];
};

export type PasswordEditInput = {
  confirmNewPassword: Scalars['String']['input'];
  currentPassword: Scalars['String']['input'];
  newPassword: Scalars['String']['input'];
};

export type PreparationStep = {
  __typename?: 'PreparationStep';
  description: Scalars['String']['output'];
  id?: Maybe<Scalars['ID']['output']>;
  order: Scalars['Int']['output'];
};

export type PreparationStepInput = {
  description: Scalars['String']['input'];
  order: Scalars['Int']['input'];
};

export type Query = {
  __typename?: 'Query';
  getAllMetadata: Array<MetadataItem>;
  getAllUser: Array<User>;
  getFavoriteRecipes: Array<Recipe>;
  getFollowing: FollowingData;
  getMetadataByType: Array<MetadataItem>;
  getRatingsByRecipe: Array<Rating>;
  getRecipeById: Recipe;
  getRecipes: RecipeData;
  getRecipesByTitle: RecipeData;
  getRecipesByUserId: RecipeData;
  getRecipesByUserName: RecipeData;
  getUserById: User;
  getUserByUserName: User;
};


export type QueryGetFavoriteRecipesArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryGetFollowingArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryGetMetadataByTypeArgs = {
  type: Scalars['String']['input'];
};


export type QueryGetRatingsByRecipeArgs = {
  recipeId: Scalars['ID']['input'];
};


export type QueryGetRecipeByIdArgs = {
  id: Scalars['ID']['input'];
};


export type QueryGetRecipesArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<RecipeFilterInput>;
  limit?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryGetRecipesByTitleArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  title: Scalars['String']['input'];
};


export type QueryGetRecipesByUserIdArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  userId: Scalars['ID']['input'];
};


export type QueryGetRecipesByUserNameArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  userName: Scalars['String']['input'];
};


export type QueryGetUserByIdArgs = {
  id: Scalars['ID']['input'];
};


export type QueryGetUserByUserNameArgs = {
  userName: Scalars['String']['input'];
};

export type Rating = {
  __typename?: 'Rating';
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  id: Scalars['ID']['output'];
  ratingValue: Scalars['Float']['output'];
  recipeId: Scalars['ID']['output'];
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
  userId: Scalars['ID']['output'];
};

export type RatingInput = {
  ratingValue: Scalars['Float']['input'];
  recipeId: Scalars['ID']['input'];
};

export type Recipe = {
  __typename?: 'Recipe';
  allergens?: Maybe<Array<MetadataItem>>;
  author: User;
  averageRating: Scalars['Float']['output'];
  category: Category;
  cookTimeMinutes?: Maybe<Scalars['Int']['output']>;
  cookingTime: Scalars['Int']['output'];
  costLevel?: Maybe<MetadataItem>;
  createdAt: Scalars['DateTime']['output'];
  createdBy: Scalars['String']['output'];
  cuisine?: Maybe<MetadataItem>;
  description?: Maybe<Scalars['String']['output']>;
  dietaryFlags?: Maybe<Array<MetadataItem>>;
  difficultyLevel: DifficultyLevel;
  equipment?: Maybe<Array<MetadataItem>>;
  id: Scalars['ID']['output'];
  imgSrc?: Maybe<Scalars['String']['output']>;
  ingredients: Array<Ingredient>;
  isFavorite?: Maybe<Scalars['Boolean']['output']>;
  labels: Array<Label>;
  prepTimeMinutes?: Maybe<Scalars['Int']['output']>;
  preparationSteps: Array<PreparationStep>;
  ratingsCount: Scalars['Int']['output'];
  restTimeMinutes?: Maybe<Scalars['Int']['output']>;
  seoDescription?: Maybe<Scalars['String']['output']>;
  seoTitle?: Maybe<Scalars['String']['output']>;
  servingUnit?: Maybe<MetadataItem>;
  servings: Scalars['Int']['output'];
  slug?: Maybe<Scalars['String']['output']>;
  socialImage?: Maybe<Scalars['String']['output']>;
  substitutions?: Maybe<Scalars['String']['output']>;
  tips?: Maybe<Scalars['String']['output']>;
  title: Scalars['String']['output'];
  totalTimeMinutes?: Maybe<Scalars['Int']['output']>;
  updatedAt: Scalars['DateTime']['output'];
  userRating?: Maybe<Scalars['Float']['output']>;
  youtubeLink?: Maybe<Scalars['String']['output']>;
};

export type RecipeCreateInput = {
  allergens?: InputMaybe<Array<InputMaybe<MetaInputPartial>>>;
  category: MetaInputPartial;
  cookTimeMinutes?: InputMaybe<Scalars['Int']['input']>;
  cookingTime: Scalars['Int']['input'];
  costLevel?: InputMaybe<MetaInputPartial>;
  cuisine?: InputMaybe<MetaInputPartial>;
  description?: InputMaybe<Scalars['String']['input']>;
  dietaryFlags?: InputMaybe<Array<InputMaybe<MetaInputPartial>>>;
  difficultyLevel: MetaInputPartial;
  equipment?: InputMaybe<Array<InputMaybe<MetaInputPartial>>>;
  imgSrc?: InputMaybe<Scalars['String']['input']>;
  ingredients: Array<InputMaybe<IngredientInput>>;
  labels?: InputMaybe<Array<InputMaybe<MetaInputPartial>>>;
  prepTimeMinutes?: InputMaybe<Scalars['Int']['input']>;
  preparationSteps: Array<InputMaybe<PreparationStepInput>>;
  restTimeMinutes?: InputMaybe<Scalars['Int']['input']>;
  seoDescription?: InputMaybe<Scalars['String']['input']>;
  seoTitle?: InputMaybe<Scalars['String']['input']>;
  servingUnit?: InputMaybe<MetaInputPartial>;
  servings: Scalars['Int']['input'];
  slug?: InputMaybe<Scalars['String']['input']>;
  socialImage?: InputMaybe<Scalars['String']['input']>;
  substitutions?: InputMaybe<Scalars['String']['input']>;
  tips?: InputMaybe<Scalars['String']['input']>;
  title: Scalars['String']['input'];
  youtubeLink?: InputMaybe<Scalars['String']['input']>;
};

export type RecipeData = {
  __typename?: 'RecipeData';
  pageInfo: PageInfo;
  recipes: Array<Recipe>;
  totalRecipes: Scalars['Int']['output'];
};

export type RecipeEditInput = {
  allergens?: InputMaybe<Array<InputMaybe<MetaInputPartial>>>;
  category: MetaInputPartial;
  cookTimeMinutes?: InputMaybe<Scalars['Int']['input']>;
  cookingTime: Scalars['Int']['input'];
  costLevel?: InputMaybe<MetaInputPartial>;
  cuisine?: InputMaybe<MetaInputPartial>;
  description?: InputMaybe<Scalars['String']['input']>;
  dietaryFlags?: InputMaybe<Array<InputMaybe<MetaInputPartial>>>;
  difficultyLevel: MetaInputPartial;
  equipment?: InputMaybe<Array<InputMaybe<MetaInputPartial>>>;
  imgSrc?: InputMaybe<Scalars['String']['input']>;
  ingredients: Array<InputMaybe<IngredientInput>>;
  labels?: InputMaybe<Array<InputMaybe<MetaInputPartial>>>;
  prepTimeMinutes?: InputMaybe<Scalars['Int']['input']>;
  preparationSteps: Array<InputMaybe<PreparationStepInput>>;
  restTimeMinutes?: InputMaybe<Scalars['Int']['input']>;
  seoDescription?: InputMaybe<Scalars['String']['input']>;
  seoTitle?: InputMaybe<Scalars['String']['input']>;
  servingUnit?: InputMaybe<MetaInputPartial>;
  servings: Scalars['Int']['input'];
  slug?: InputMaybe<Scalars['String']['input']>;
  socialImage?: InputMaybe<Scalars['String']['input']>;
  substitutions?: InputMaybe<Scalars['String']['input']>;
  tips?: InputMaybe<Scalars['String']['input']>;
  title: Scalars['String']['input'];
  youtubeLink?: InputMaybe<Scalars['String']['input']>;
};

export type RecipeFilterInput = {
  allergenKeys?: InputMaybe<Array<Scalars['String']['input']>>;
  categoryKey?: InputMaybe<Scalars['String']['input']>;
  costLevelKey?: InputMaybe<Scalars['String']['input']>;
  cuisineKey?: InputMaybe<Scalars['String']['input']>;
  dietaryFlagKeys?: InputMaybe<Array<Scalars['String']['input']>>;
  difficultyLevelKey?: InputMaybe<Scalars['String']['input']>;
  equipmentKeys?: InputMaybe<Array<Scalars['String']['input']>>;
  labelKeys?: InputMaybe<Array<Scalars['String']['input']>>;
  maxCookingTime?: InputMaybe<Scalars['Int']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
};

export type RegisterResponse = {
  __typename?: 'RegisterResponse';
  message: Scalars['String']['output'];
  messageKey: Scalars['String']['output'];
  success: Scalars['Boolean']['output'];
};

export type User = {
  __typename?: 'User';
  createdAt: Scalars['DateTime']['output'];
  email: Scalars['String']['output'];
  favoriteRecipes?: Maybe<Array<Recipe>>;
  firstName: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  lastName: Scalars['String']['output'];
  locale: Scalars['String']['output'];
  recipes?: Maybe<Array<Recipe>>;
  role: UserRole;
  updatedAt: Scalars['DateTime']['output'];
  userName: Scalars['String']['output'];
};

export type UserOperationResponse = {
  __typename?: 'UserOperationResponse';
  message: Scalars['String']['output'];
  messageKey: Scalars['String']['output'];
  statusCode?: Maybe<Scalars['Int']['output']>;
  success: Scalars['Boolean']['output'];
  user?: Maybe<User>;
};

export type UserRegisterInput = {
  confirmPassword: Scalars['String']['input'];
  email: Scalars['String']['input'];
  firstName: Scalars['String']['input'];
  lastName: Scalars['String']['input'];
  locale?: InputMaybe<Scalars['String']['input']>;
  password: Scalars['String']['input'];
  userName: Scalars['String']['input'];
};

export { UserRole };

export type UserUpdateInput = {
  firstName?: InputMaybe<Scalars['String']['input']>;
  lastName?: InputMaybe<Scalars['String']['input']>;
  locale?: InputMaybe<Scalars['String']['input']>;
};

export type UserUpdateResponse = {
  __typename?: 'UserUpdateResponse';
  message: Scalars['String']['output'];
  success: Scalars['Boolean']['output'];
  user?: Maybe<User>;
};

export type WithIndex<TObject> = TObject & Record<string, any>;
export type ResolversObject<TObject> = WithIndex<TObject>;

export type ResolverTypeWrapper<T> = Promise<T> | T;


export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type Resolver<TResult, TParent = Record<PropertyKey, never>, TContext = Record<PropertyKey, never>, TArgs = Record<PropertyKey, never>> = ResolverFn<TResult, TParent, TContext, TArgs> | ResolverWithResolve<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterable<TResult> | Promise<AsyncIterable<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>;
  resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<TResult, TKey extends string, TParent = Record<PropertyKey, never>, TContext = Record<PropertyKey, never>, TArgs = Record<PropertyKey, never>> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = Record<PropertyKey, never>, TContext = Record<PropertyKey, never>> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = Record<PropertyKey, never>, TContext = Record<PropertyKey, never>> = (obj: T, context: TContext, info: GraphQLResolveInfo) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = Record<PropertyKey, never>, TParent = Record<PropertyKey, never>, TContext = Record<PropertyKey, never>, TArgs = Record<PropertyKey, never>> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;





/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = ResolversObject<{
  BaseResponse: ResolverTypeWrapper<BaseResponse>;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']['output']>;
  Category: ResolverTypeWrapper<Category>;
  DateTime: ResolverTypeWrapper<Scalars['DateTime']['output']>;
  DifficultyLevel: ResolverTypeWrapper<DifficultyLevel>;
  Float: ResolverTypeWrapper<Scalars['Float']['output']>;
  FollowedUser: ResolverTypeWrapper<Omit<FollowedUser, 'latestRecipes'> & { latestRecipes: Array<ResolversTypes['Recipe']> }>;
  FollowingData: ResolverTypeWrapper<Omit<FollowingData, 'users'> & { users: Array<ResolversTypes['FollowedUser']> }>;
  ID: ResolverTypeWrapper<Scalars['ID']['output']>;
  Ingredient: ResolverTypeWrapper<Ingredient>;
  IngredientInput: IngredientInput;
  Int: ResolverTypeWrapper<Scalars['Int']['output']>;
  Label: ResolverTypeWrapper<Label>;
  MetaInputPartial: MetaInputPartial;
  MetadataItem: ResolverTypeWrapper<MetadataItem>;
  Mutation: ResolverTypeWrapper<Record<PropertyKey, never>>;
  OperationResponse: ResolverTypeWrapper<OperationResponse>;
  PageInfo: ResolverTypeWrapper<PageInfo>;
  PasswordEditInput: PasswordEditInput;
  PreparationStep: ResolverTypeWrapper<PreparationStep>;
  PreparationStepInput: PreparationStepInput;
  Query: ResolverTypeWrapper<Record<PropertyKey, never>>;
  Rating: ResolverTypeWrapper<Rating>;
  RatingInput: RatingInput;
  Recipe: ResolverTypeWrapper<RecipeResolverParent>;
  RecipeCreateInput: RecipeCreateInput;
  RecipeData: ResolverTypeWrapper<Omit<RecipeData, 'recipes'> & { recipes: Array<ResolversTypes['Recipe']> }>;
  RecipeEditInput: RecipeEditInput;
  RecipeFilterInput: RecipeFilterInput;
  RegisterResponse: ResolverTypeWrapper<RegisterResponse>;
  String: ResolverTypeWrapper<Scalars['String']['output']>;
  User: ResolverTypeWrapper<UserResolverParent>;
  UserOperationResponse: ResolverTypeWrapper<Omit<UserOperationResponse, 'user'> & { user?: Maybe<ResolversTypes['User']> }>;
  UserRegisterInput: UserRegisterInput;
  UserRole: UserRole;
  UserUpdateInput: UserUpdateInput;
  UserUpdateResponse: ResolverTypeWrapper<Omit<UserUpdateResponse, 'user'> & { user?: Maybe<ResolversTypes['User']> }>;
}>;

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = ResolversObject<{
  BaseResponse: BaseResponse;
  Boolean: Scalars['Boolean']['output'];
  Category: Category;
  DateTime: Scalars['DateTime']['output'];
  DifficultyLevel: DifficultyLevel;
  Float: Scalars['Float']['output'];
  FollowedUser: Omit<FollowedUser, 'latestRecipes'> & { latestRecipes: Array<ResolversParentTypes['Recipe']> };
  FollowingData: Omit<FollowingData, 'users'> & { users: Array<ResolversParentTypes['FollowedUser']> };
  ID: Scalars['ID']['output'];
  Ingredient: Ingredient;
  IngredientInput: IngredientInput;
  Int: Scalars['Int']['output'];
  Label: Label;
  MetaInputPartial: MetaInputPartial;
  MetadataItem: MetadataItem;
  Mutation: Record<PropertyKey, never>;
  OperationResponse: OperationResponse;
  PageInfo: PageInfo;
  PasswordEditInput: PasswordEditInput;
  PreparationStep: PreparationStep;
  PreparationStepInput: PreparationStepInput;
  Query: Record<PropertyKey, never>;
  Rating: Rating;
  RatingInput: RatingInput;
  Recipe: RecipeResolverParent;
  RecipeCreateInput: RecipeCreateInput;
  RecipeData: Omit<RecipeData, 'recipes'> & { recipes: Array<ResolversParentTypes['Recipe']> };
  RecipeEditInput: RecipeEditInput;
  RecipeFilterInput: RecipeFilterInput;
  RegisterResponse: RegisterResponse;
  String: Scalars['String']['output'];
  User: UserResolverParent;
  UserOperationResponse: Omit<UserOperationResponse, 'user'> & { user?: Maybe<ResolversParentTypes['User']> };
  UserRegisterInput: UserRegisterInput;
  UserUpdateInput: UserUpdateInput;
  UserUpdateResponse: Omit<UserUpdateResponse, 'user'> & { user?: Maybe<ResolversParentTypes['User']> };
}>;

export type BaseResponseResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['BaseResponse'] = ResolversParentTypes['BaseResponse']> = ResolversObject<{
  message?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  success?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
}>;

export type CategoryResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['Category'] = ResolversParentTypes['Category']> = ResolversObject<{
  id?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  key?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  label?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  type?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
}>;

export interface DateTimeScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['DateTime'], any> {
  name: 'DateTime';
}

export type DifficultyLevelResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['DifficultyLevel'] = ResolversParentTypes['DifficultyLevel']> = ResolversObject<{
  id?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  key?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  label?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  type?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
}>;

export type FollowedUserResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['FollowedUser'] = ResolversParentTypes['FollowedUser']> = ResolversObject<{
  firstName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  followedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  lastName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  latestRecipes?: Resolver<Array<ResolversTypes['Recipe']>, ParentType, ContextType>;
  recipeCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  userName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
}>;

export type FollowingDataResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['FollowingData'] = ResolversParentTypes['FollowingData']> = ResolversObject<{
  totalFollowing?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  users?: Resolver<Array<ResolversTypes['FollowedUser']>, ParentType, ContextType>;
}>;

export type IngredientResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['Ingredient'] = ResolversParentTypes['Ingredient']> = ResolversObject<{
  id?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  isOptional?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  localId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  note?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  quantity?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  unit?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
}>;

export type LabelResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['Label'] = ResolversParentTypes['Label']> = ResolversObject<{
  id?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  key?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  label?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  type?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
}>;

export type MetadataItemResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['MetadataItem'] = ResolversParentTypes['MetadataItem']> = ResolversObject<{
  id?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  key?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  label?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  type?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
}>;

export type MutationResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = ResolversObject<{
  addToFavoriteRecipes?: Resolver<ResolversTypes['OperationResponse'], ParentType, ContextType, RequireFields<MutationAddToFavoriteRecipesArgs, 'recipeId' | 'userId'>>;
  changePassword?: Resolver<ResolversTypes['BaseResponse'], ParentType, ContextType, RequireFields<MutationChangePasswordArgs, 'passwordEditInput'>>;
  cleanUserRecipes?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationCleanUserRecipesArgs, 'userId'>>;
  createRecipe?: Resolver<ResolversTypes['Recipe'], ParentType, ContextType, Partial<MutationCreateRecipeArgs>>;
  createUser?: Resolver<ResolversTypes['UserOperationResponse'], ParentType, ContextType, Partial<MutationCreateUserArgs>>;
  deleteAllRecipes?: Resolver<ResolversTypes['Int'], ParentType, ContextType, RequireFields<MutationDeleteAllRecipesArgs, 'confirmation'>>;
  deleteAllUser?: Resolver<ResolversTypes['Int'], ParentType, ContextType, RequireFields<MutationDeleteAllUserArgs, 'confirmation'>>;
  deleteRating?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationDeleteRatingArgs, 'recipeId'>>;
  deleteRecipe?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationDeleteRecipeArgs, 'id'>>;
  deleteUser?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationDeleteUserArgs, 'id'>>;
  editRecipe?: Resolver<ResolversTypes['Recipe'], ParentType, ContextType, RequireFields<MutationEditRecipeArgs, 'id'>>;
  followUser?: Resolver<ResolversTypes['OperationResponse'], ParentType, ContextType, RequireFields<MutationFollowUserArgs, 'targetUserId'>>;
  rateRecipe?: Resolver<ResolversTypes['Recipe'], ParentType, ContextType, RequireFields<MutationRateRecipeArgs, 'ratingInput'>>;
  removeFromFavoriteRecipes?: Resolver<ResolversTypes['OperationResponse'], ParentType, ContextType, RequireFields<MutationRemoveFromFavoriteRecipesArgs, 'recipeId' | 'userId'>>;
  resetPassword?: Resolver<ResolversTypes['BaseResponse'], ParentType, ContextType, RequireFields<MutationResetPasswordArgs, 'email'>>;
  setNewPassword?: Resolver<ResolversTypes['BaseResponse'], ParentType, ContextType, RequireFields<MutationSetNewPasswordArgs, 'newPassword' | 'token'>>;
  unfollowUser?: Resolver<ResolversTypes['OperationResponse'], ParentType, ContextType, RequireFields<MutationUnfollowUserArgs, 'targetUserId'>>;
  updateUser?: Resolver<ResolversTypes['UserUpdateResponse'], ParentType, ContextType, RequireFields<MutationUpdateUserArgs, 'userUpdateInput'>>;
}>;

export type OperationResponseResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['OperationResponse'] = ResolversParentTypes['OperationResponse']> = ResolversObject<{
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  messageKey?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  statusCode?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
}>;

export type PageInfoResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['PageInfo'] = ResolversParentTypes['PageInfo']> = ResolversObject<{
  endCursor?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  hasNextPage?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
}>;

export type PreparationStepResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['PreparationStep'] = ResolversParentTypes['PreparationStep']> = ResolversObject<{
  description?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  order?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
}>;

export type QueryResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = ResolversObject<{
  getAllMetadata?: Resolver<Array<ResolversTypes['MetadataItem']>, ParentType, ContextType>;
  getAllUser?: Resolver<Array<ResolversTypes['User']>, ParentType, ContextType>;
  getFavoriteRecipes?: Resolver<Array<ResolversTypes['Recipe']>, ParentType, ContextType, Partial<QueryGetFavoriteRecipesArgs>>;
  getFollowing?: Resolver<ResolversTypes['FollowingData'], ParentType, ContextType, Partial<QueryGetFollowingArgs>>;
  getMetadataByType?: Resolver<Array<ResolversTypes['MetadataItem']>, ParentType, ContextType, RequireFields<QueryGetMetadataByTypeArgs, 'type'>>;
  getRatingsByRecipe?: Resolver<Array<ResolversTypes['Rating']>, ParentType, ContextType, RequireFields<QueryGetRatingsByRecipeArgs, 'recipeId'>>;
  getRecipeById?: Resolver<ResolversTypes['Recipe'], ParentType, ContextType, RequireFields<QueryGetRecipeByIdArgs, 'id'>>;
  getRecipes?: Resolver<ResolversTypes['RecipeData'], ParentType, ContextType, Partial<QueryGetRecipesArgs>>;
  getRecipesByTitle?: Resolver<ResolversTypes['RecipeData'], ParentType, ContextType, RequireFields<QueryGetRecipesByTitleArgs, 'title'>>;
  getRecipesByUserId?: Resolver<ResolversTypes['RecipeData'], ParentType, ContextType, RequireFields<QueryGetRecipesByUserIdArgs, 'userId'>>;
  getRecipesByUserName?: Resolver<ResolversTypes['RecipeData'], ParentType, ContextType, RequireFields<QueryGetRecipesByUserNameArgs, 'userName'>>;
  getUserById?: Resolver<ResolversTypes['User'], ParentType, ContextType, RequireFields<QueryGetUserByIdArgs, 'id'>>;
  getUserByUserName?: Resolver<ResolversTypes['User'], ParentType, ContextType, RequireFields<QueryGetUserByUserNameArgs, 'userName'>>;
}>;

export type RatingResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['Rating'] = ResolversParentTypes['Rating']> = ResolversObject<{
  createdAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  ratingValue?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  recipeId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  updatedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  userId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
}>;

export type RecipeResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['Recipe'] = ResolversParentTypes['Recipe']> = ResolversObject<{
  allergens?: Resolver<Maybe<Array<ResolversTypes['MetadataItem']>>, ParentType, ContextType>;
  author?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  averageRating?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  category?: Resolver<ResolversTypes['Category'], ParentType, ContextType>;
  cookTimeMinutes?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  cookingTime?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  costLevel?: Resolver<Maybe<ResolversTypes['MetadataItem']>, ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  createdBy?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  cuisine?: Resolver<Maybe<ResolversTypes['MetadataItem']>, ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  dietaryFlags?: Resolver<Maybe<Array<ResolversTypes['MetadataItem']>>, ParentType, ContextType>;
  difficultyLevel?: Resolver<ResolversTypes['DifficultyLevel'], ParentType, ContextType>;
  equipment?: Resolver<Maybe<Array<ResolversTypes['MetadataItem']>>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  imgSrc?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  ingredients?: Resolver<Array<ResolversTypes['Ingredient']>, ParentType, ContextType>;
  isFavorite?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  labels?: Resolver<Array<ResolversTypes['Label']>, ParentType, ContextType>;
  prepTimeMinutes?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  preparationSteps?: Resolver<Array<ResolversTypes['PreparationStep']>, ParentType, ContextType>;
  ratingsCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  restTimeMinutes?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  seoDescription?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  seoTitle?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  servingUnit?: Resolver<Maybe<ResolversTypes['MetadataItem']>, ParentType, ContextType>;
  servings?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  slug?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  socialImage?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  substitutions?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  tips?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  totalTimeMinutes?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  userRating?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  youtubeLink?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
}>;

export type RecipeDataResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['RecipeData'] = ResolversParentTypes['RecipeData']> = ResolversObject<{
  pageInfo?: Resolver<ResolversTypes['PageInfo'], ParentType, ContextType>;
  recipes?: Resolver<Array<ResolversTypes['Recipe']>, ParentType, ContextType>;
  totalRecipes?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
}>;

export type RegisterResponseResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['RegisterResponse'] = ResolversParentTypes['RegisterResponse']> = ResolversObject<{
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  messageKey?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
}>;

export type UserResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['User'] = ResolversParentTypes['User']> = ResolversObject<{
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  email?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  favoriteRecipes?: Resolver<Maybe<Array<ResolversTypes['Recipe']>>, ParentType, ContextType>;
  firstName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  lastName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  locale?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  recipes?: Resolver<Maybe<Array<ResolversTypes['Recipe']>>, ParentType, ContextType>;
  role?: Resolver<ResolversTypes['UserRole'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  userName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
}>;

export type UserOperationResponseResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['UserOperationResponse'] = ResolversParentTypes['UserOperationResponse']> = ResolversObject<{
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  messageKey?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  statusCode?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  user?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
}>;

export type UserRoleResolvers = EnumResolverSignature<{ ADMIN?: any, BLOGGER?: any, USER?: any }, ResolversTypes['UserRole']>;

export type UserUpdateResponseResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['UserUpdateResponse'] = ResolversParentTypes['UserUpdateResponse']> = ResolversObject<{
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  user?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
}>;

export type Resolvers<ContextType = GraphQLContext> = ResolversObject<{
  BaseResponse?: BaseResponseResolvers<ContextType>;
  Category?: CategoryResolvers<ContextType>;
  DateTime?: GraphQLScalarType;
  DifficultyLevel?: DifficultyLevelResolvers<ContextType>;
  FollowedUser?: FollowedUserResolvers<ContextType>;
  FollowingData?: FollowingDataResolvers<ContextType>;
  Ingredient?: IngredientResolvers<ContextType>;
  Label?: LabelResolvers<ContextType>;
  MetadataItem?: MetadataItemResolvers<ContextType>;
  Mutation?: MutationResolvers<ContextType>;
  OperationResponse?: OperationResponseResolvers<ContextType>;
  PageInfo?: PageInfoResolvers<ContextType>;
  PreparationStep?: PreparationStepResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  Rating?: RatingResolvers<ContextType>;
  Recipe?: RecipeResolvers<ContextType>;
  RecipeData?: RecipeDataResolvers<ContextType>;
  RegisterResponse?: RegisterResponseResolvers<ContextType>;
  User?: UserResolvers<ContextType>;
  UserOperationResponse?: UserOperationResponseResolvers<ContextType>;
  UserRole?: UserRoleResolvers;
  UserUpdateResponse?: UserUpdateResponseResolvers<ContextType>;
}>;


import type { DocumentNode } from 'graphql';
import {
  ADD_TO_FAVORITE_RECIPES,
  CHANGE_PASSWORD,
  CREATE_RECIPE,
  CREATE_USER,
  DELETE_RATING,
  EDIT_RECIPE,
  FOLLOW_USER,
  RATE_RECIPE,
  REMOVE_FROM_FAVORITE_RECIPES,
  RESET_PASSWORD,
  SET_NEW_PASSWORD,
  UNFOLLOW_USER,
  UPDATE_USER,
} from './mutations';
import { getPersistedQueryHashFromDocument } from './protection';
import {
  GET_ALL_METADATA,
  GET_FAVORITE_RECIPES,
  GET_FOLLOWING,
  GET_LATEST_RECIPES,
  GET_METADATA_BY_TYPE,
  GET_RECIPE_BY_ID,
  GET_RECIPES_BY_USER_ID,
  GET_USER_BY_ID,
} from './queries';

const clientDocuments: DocumentNode[] = [
  GET_USER_BY_ID,
  GET_ALL_METADATA,
  GET_METADATA_BY_TYPE,
  GET_RECIPE_BY_ID,
  GET_FAVORITE_RECIPES,
  GET_LATEST_RECIPES,
  GET_RECIPES_BY_USER_ID,
  GET_FOLLOWING,
  CREATE_USER,
  RESET_PASSWORD,
  SET_NEW_PASSWORD,
  CHANGE_PASSWORD,
  UPDATE_USER,
  CREATE_RECIPE,
  EDIT_RECIPE,
  RATE_RECIPE,
  DELETE_RATING,
  ADD_TO_FAVORITE_RECIPES,
  REMOVE_FROM_FAVORITE_RECIPES,
  FOLLOW_USER,
  UNFOLLOW_USER,
];

export const persistedQueryHashes = new Set(
  clientDocuments.map((document) =>
    getPersistedQueryHashFromDocument(document),
  ),
);

export const isPersistedQueryAllowed = (query: string, persistedHash: string) =>
  persistedQueryHashes.has(persistedHash) &&
  getPersistedQueryHashFromDocument(query) === persistedHash;

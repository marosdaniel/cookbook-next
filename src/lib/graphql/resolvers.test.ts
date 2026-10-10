import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockGetAllMetadata, mockGetAdminMetadata, mockGetMetadataByType } =
  vi.hoisted(() => ({
    mockGetAllMetadata: vi.fn(),
    mockGetAdminMetadata: vi.fn(),
    mockGetMetadataByType: vi.fn(),
  }));

vi.mock('./resolvers/metadata/queries', () => ({
  getAllMetadata: mockGetAllMetadata,
  getAdminMetadata: mockGetAdminMetadata,
  getMetadataByType: mockGetMetadataByType,
}));

vi.mock('./resolvers/metadata/mutations', () => ({
  createMetadata: vi.fn(),
  reorderMetadata: vi.fn(),
  setMetadataActive: vi.fn(),
  updateMetadata: vi.fn(),
}));

vi.mock('./resolvers/recipe/mutations', () => ({
  createRecipe: vi.fn(),
  deleteRating: vi.fn(),
  deleteRecipe: vi.fn(),
  editRecipe: vi.fn(),
  rateRecipe: vi.fn(),
}));

vi.mock('./resolvers/recipe/queries', () => ({
  getRecipeById: vi.fn(),
  getRecipes: vi.fn(),
  getRecipesByUserId: vi.fn(),
}));

vi.mock('./resolvers/user/mutations', () => ({
  addToFavoriteRecipes: vi.fn(),
  changePassword: vi.fn(),
  cleanUserRecipes: vi.fn(),
  createUser: vi.fn(),
  deleteAllRecipes: vi.fn(),
  deleteAllUser: vi.fn(),
  deleteUser: vi.fn(),
  followUser: vi.fn(),
  removeFromFavoriteRecipes: vi.fn(),
  resetPassword: vi.fn(),
  setNewPassword: vi.fn(),
  unfollowUser: vi.fn(),
  updateUser: vi.fn(),
}));

vi.mock('./resolvers/user/queries', () => ({
  getFavoriteRecipes: vi.fn(),
  getFollowing: vi.fn(),
  getUserById: vi.fn(),
}));

import { resolvers } from './resolvers';

describe('graphql resolvers registry', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('exposes the query and mutation resolver groups', () => {
    expect(resolvers.Query).toBeDefined();
    expect(resolvers.Mutation).toBeDefined();
    expect(resolvers.Recipe).toBeDefined();
    expect(resolvers.User).toBeDefined();
  });

  it('exposes metadata query resolvers', () => {
    expect(resolvers.Query?.getAllMetadata).toBeDefined();
    expect(resolvers.Query?.getMetadataByType).toBeDefined();
    expect(resolvers.Query?.getAdminMetadata).toBeDefined();
  });

  it('exposes admin metadata mutation resolvers', () => {
    expect(resolvers.Mutation?.createMetadata).toBeDefined();
    expect(resolvers.Mutation?.updateMetadata).toBeDefined();
    expect(resolvers.Mutation?.setMetadataActive).toBeDefined();
    expect(resolvers.Mutation?.reorderMetadata).toBeDefined();
  });
});

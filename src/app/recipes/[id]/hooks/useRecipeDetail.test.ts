import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useRecipeDetail } from './useRecipeDetail';

const mocks = vi.hoisted(() => ({
  useSession: vi.fn(),
  useQuery: vi.fn(),
}));

vi.mock('next-auth/react', () => ({
  useSession: () => mocks.useSession(),
}));

vi.mock('@apollo/client/react', () => ({
  useQuery: () => mocks.useQuery(),
}));

describe('useRecipeDetail', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.useSession.mockReturnValue({ data: null });
    mocks.useQuery.mockReturnValue({
      data: undefined,
      loading: false,
      error: undefined,
    });
  });

  it('returns loading and error state from the query', () => {
    mocks.useQuery.mockReturnValue({
      data: undefined,
      loading: true,
      error: { message: 'Failed to load recipe' },
    });

    const { result } = renderHook(() => useRecipeDetail('recipe-1'));

    expect(result.current.loading).toBe(true);
    expect(result.current.error).toEqual({ message: 'Failed to load recipe' });
    expect(result.current.recipe).toBeUndefined();
  });

  it('hydrates recipe data and exposes owner, youtube and sorted steps metadata', () => {
    const recipe = {
      id: 'recipe-1',
      servings: 4,
      createdBy: 'user-1',
      youtubeLink: 'https://www.youtube.com/watch?v=abc123',
      preparationSteps: [
        { localId: 'step-2', description: 'Second', order: 2 },
        { localId: 'step-1', description: 'First', order: 1 },
      ],
    };

    mocks.useSession.mockReturnValue({ data: { user: { id: 'user-1' } } });
    mocks.useQuery.mockReturnValue({
      data: { getRecipeById: recipe },
      loading: false,
      error: undefined,
    });

    const { result } = renderHook(() => useRecipeDetail('recipe-1'));

    expect(result.current.recipe).toEqual(recipe);
    expect(result.current.adjustedServings).toBe(4);
    expect(result.current.youtubeId).toBe('abc123');
    expect(result.current.isOwner).toBe(true);
    expect(result.current.sortedSteps.map((step) => step.description)).toEqual([
      'First',
      'Second',
    ]);
  });

  it('toggles ingredient check state and keeps the serving multiplier within bounds', () => {
    const recipe = {
      id: 'recipe-1',
      servings: 2,
      createdBy: 'user-2',
      youtubeLink: 'https://youtu.be/xyz789',
      preparationSteps: [],
    };

    mocks.useSession.mockReturnValue({ data: { user: { id: 'user-1' } } });
    mocks.useQuery.mockReturnValue({
      data: { getRecipeById: recipe },
      loading: false,
      error: undefined,
    });

    const { result } = renderHook(() => useRecipeDetail('recipe-1'));

    act(() => {
      result.current.toggleIngredient('ing-1');
      result.current.toggleIngredient('ing-1');
      result.current.incrementServings();
      result.current.incrementServings();
      result.current.incrementServings();
      result.current.decrementServings();
      result.current.decrementServings();
      result.current.decrementServings();
      result.current.decrementServings();
      result.current.decrementServings();
    });

    expect(result.current.checkedIngredients.has('ing-1')).toBe(false);
    expect(result.current.servingMultiplier).toBe(1);
    expect(result.current.adjustedServings).toBe(2);
    expect(result.current.youtubeId).toBe('xyz789');
    expect(result.current.isOwner).toBe(false);
  });

  it('returns null youtube ids for empty or invalid links', () => {
    const recipe = {
      id: 'recipe-1',
      servings: 4,
      createdBy: 'user-1',
      youtubeLink: 'not-a-url',
      preparationSteps: [],
    };

    mocks.useQuery.mockReturnValue({
      data: { getRecipeById: recipe },
      loading: false,
      error: undefined,
    });

    const { result } = renderHook(() => useRecipeDetail('recipe-1'));

    expect(result.current.youtubeId).toBeNull();
  });
});

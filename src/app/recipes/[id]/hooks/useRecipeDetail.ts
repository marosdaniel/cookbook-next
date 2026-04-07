import { useQuery } from '@apollo/client/react';
import { useSession } from 'next-auth/react';
import { useCallback, useMemo, useState } from 'react';
import { GET_RECIPE_BY_ID } from '@/lib/graphql/queries';
import type { RecipeDetailData } from '../types';
import { extractYoutubeId, sortByOrder } from '../utils';

const SERVING_MIN = 1;
const SERVING_MAX = 20;

export const useRecipeDetail = (recipeId: string) => {
  const { data: session } = useSession();
  const { data, loading, error } = useQuery<RecipeDetailData>(
    GET_RECIPE_BY_ID,
    { variables: { id: recipeId } },
  );

  const recipe = data?.getRecipeById;

  /* ── Serving adjuster ── */
  const [servingMultiplier, setServingMultiplier] = useState(1);

  const adjustedServings = useMemo(
    () => (recipe ? recipe.servings * servingMultiplier : 0),
    [recipe, servingMultiplier],
  );

  const incrementServings = useCallback(
    () => setServingMultiplier((m) => Math.min(m + 1, SERVING_MAX)),
    [],
  );
  const decrementServings = useCallback(
    () => setServingMultiplier((m) => Math.max(m - 1, SERVING_MIN)),
    [],
  );

  /* ── Checked ingredients ── */
  const [checkedIngredients, setCheckedIngredients] = useState<Set<string>>(
    new Set(),
  );

  const toggleIngredient = useCallback((localId: string) => {
    setCheckedIngredients((prev) => {
      const next = new Set(prev);
      if (next.has(localId)) next.delete(localId);
      else next.add(localId);
      return next;
    });
  }, []);

  /* ── Derived data ── */
  const youtubeId = useMemo(
    () => (recipe?.youtubeLink ? extractYoutubeId(recipe.youtubeLink) : null),
    [recipe?.youtubeLink],
  );

  const isOwner =
    !!recipe &&
    (session?.user as { id?: string } | undefined)?.id === recipe.createdBy;

  const sortedSteps = useMemo(
    () => (recipe ? sortByOrder(recipe.preparationSteps) : []),
    [recipe],
  );

  return {
    recipe,
    loading,
    error,
    servingMultiplier,
    adjustedServings,
    checkedIngredients,
    toggleIngredient,
    incrementServings,
    decrementServings,
    youtubeId,
    isOwner,
    sortedSteps,
  };
};

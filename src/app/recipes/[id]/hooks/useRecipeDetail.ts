import { useQuery } from '@apollo/client/react';
import { useSession } from 'next-auth/react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { GET_RECIPE_BY_ID } from '@/lib/graphql/queries';
import type { RecipeDetail, RecipeIngredientId } from '@/types/recipe';
import { extractYoutubeId, sortByOrder } from '../utils';

const SERVING_MIN = 1;
const SERVING_MAX = 20;

export const useRecipeDetail = (
  recipeId: string,
  initialRecipe?: RecipeDetail,
) => {
  const { data: session } = useSession();

  const { data, loading, error } = useQuery(GET_RECIPE_BY_ID, {
    variables: { id: recipeId },
  });

  const recipe = data?.getRecipeById ?? initialRecipe;

  const [servingMultiplier, setServingMultiplier] = useState(1);
  const [checkedIngredients, setCheckedIngredients] = useState<
    Set<RecipeIngredientId>
  >(() => new Set());

  useEffect(() => {
    setServingMultiplier(1);
    setCheckedIngredients(new Set());
  }, []);

  const adjustedServings = useMemo(
    () => (recipe ? recipe.servings * servingMultiplier : 0),
    [recipe?.servings, servingMultiplier, recipe],
  );

  const incrementServings = useCallback(() => {
    setServingMultiplier((currentMultiplier) =>
      Math.min(currentMultiplier + 1, SERVING_MAX),
    );
  }, []);

  const decrementServings = useCallback(() => {
    setServingMultiplier((currentMultiplier) =>
      Math.max(currentMultiplier - 1, SERVING_MIN),
    );
  }, []);

  const toggleIngredient = useCallback((localId: RecipeIngredientId) => {
    setCheckedIngredients((previousIngredients) => {
      const nextIngredients = new Set(previousIngredients);

      if (nextIngredients.has(localId)) {
        nextIngredients.delete(localId);
      } else {
        nextIngredients.add(localId);
      }

      return nextIngredients;
    });
  }, []);

  const youtubeId = useMemo(() => {
    if (!recipe?.youtubeLink) {
      return null;
    }

    return extractYoutubeId(recipe.youtubeLink);
  }, [recipe?.youtubeLink]);

  const sortedSteps = useMemo(
    () => (recipe ? sortByOrder(recipe.preparationSteps) : []),
    [recipe?.preparationSteps, recipe],
  );

  const isOwner = recipe?.createdBy === session?.user?.id;

  return {
    recipe,
    loading: !recipe && loading,
    error: recipe ? undefined : error,
    servingMultiplier,
    adjustedServings,
    checkedIngredients,
    toggleIngredient,
    incrementServings,
    decrementServings,
    youtubeId,
    isOwner: Boolean(isOwner),
    sortedSteps,
  };
};

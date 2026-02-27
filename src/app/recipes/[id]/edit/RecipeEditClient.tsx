'use client';

import { useQuery } from '@apollo/client/react';
import { Center, LoadingOverlay, Stack, Text, Title } from '@mantine/core';
import { redirect } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useRecipeEditForm } from '@/components/Recipe/Create/hooks/useRecipeEditForm';
import { useRecipeMetadata } from '@/components/Recipe/Create/hooks/useRecipeMetadata';
import { RecipeComposer } from '@/components/Recipe/Create/RecipeComposer';
import type { ComposerSection } from '@/components/Recipe/Create/types';
import { recipeToFormValues } from '@/components/Recipe/Create/utils';
import { GET_RECIPE_BY_ID } from '@/lib/graphql/queries';

interface RecipeByIdData {
  getRecipeById: {
    id: string;
    title: string;
    description?: string | null;
    imgSrc?: string | null;
    cookingTime: number;
    servings: number;
    youtubeLink?: string | null;
    createdBy: string;
    category: { key: string; label: string };
    difficultyLevel: { key: string; label: string };
    labels: { key: string; label: string }[];
    ingredients: {
      localId: string;
      name: string;
      quantity: number;
      unit: string;
    }[];
    preparationSteps: { description: string; order: number }[];
  };
}

interface RecipeEditClientProps {
  recipeId: string;
}

export default function RecipeEditClient({
  recipeId,
}: Readonly<RecipeEditClientProps>) {
  const { data: session, status: authStatus } = useSession();

  /* Auth guard */
  useEffect(() => {
    if (authStatus === 'unauthenticated') {
      redirect('/api/auth/signin');
    }
  }, [authStatus]);

  /* Fetch recipe data */
  const {
    data: recipeData,
    loading: recipeLoading,
    error: recipeError,
  } = useQuery<RecipeByIdData>(GET_RECIPE_BY_ID, {
    variables: { id: recipeId },
    skip: !session,
  });

  const { labels } = useRecipeMetadata();

  /**
   * Ref that RecipeComposer populates with its internal goToSection callback.
   * This lets form hooks imperatively navigate (e.g. on validation failure).
   */
  const goToSectionRef = useRef<((s: ComposerSection) => void) | null>(null);
  const goToSection = useCallback(
    (section: ComposerSection) => goToSectionRef.current?.(section),
    [],
  );

  /* Transform server data to form values */
  const initialValues = useMemo(() => {
    if (!recipeData?.getRecipeById) return null;
    return recipeToFormValues(recipeData.getRecipeById);
  }, [recipeData]);

  /* Form hook – only create after we have initial values */
  const editForm = useRecipeEditForm({
    recipeId,
    initialValues: initialValues ?? {
      title: '',
      description: '',
      imgSrc: '',
      cookingTime: '',
      servings: '',
      difficultyLevel: null,
      category: null,
      labels: [],
      youtubeLink: '',
      ingredients: [],
      preparationSteps: [],
    },
    onSectionChange: goToSection,
    labels,
  });

  /* Loading states */
  if (authStatus === 'loading' || recipeLoading) {
    return (
      <LoadingOverlay
        visible
        zIndex={1000}
        overlayProps={{ blur: 2, radius: 'sm' }}
      />
    );
  }

  if (!session) return null;

  /* Error state */
  if (recipeError) {
    return (
      <Center h="100vh">
        <Stack align="center" gap="md">
          <Title order={3}>Failed to load recipe</Title>
          <Text c="dimmed">{recipeError.message}</Text>
        </Stack>
      </Center>
    );
  }

  /* Authorization check – only the author can edit */
  const recipe = recipeData?.getRecipeById;
  if (recipe && session.user?.id && recipe.createdBy !== session.user.id) {
    return (
      <Center h="100vh">
        <Stack align="center" gap="md">
          <Title order={3}>Not Authorized</Title>
          <Text c="dimmed">You can only edit your own recipes.</Text>
        </Stack>
      </Center>
    );
  }

  if (!initialValues) return null;

  return (
    <RecipeComposer
      mode="edit"
      formik={editForm.formik}
      submitLoading={editForm.submitLoading}
      completion={editForm.completion}
      lastSavedLabel="Editing"
      onSave={editForm.formik.submitForm}
      onReset={editForm.resetToOriginal}
      addIngredient={editForm.addIngredient}
      addStep={editForm.addStep}
      headerTitle="Edit Recipe"
      submitLabel="Save Changes"
      resetLabel="Reset changes"
      goToSectionRef={goToSectionRef}
    />
  );
}

'use client';

import { redirect } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useCallback, useEffect, useRef } from 'react';
import { useRecipeForm } from '@/components/Recipe/Create/hooks/useRecipeForm';
import { useRecipeMetadata } from '@/components/Recipe/Create/hooks/useRecipeMetadata';
import { RecipeComposer } from '@/components/Recipe/Create/RecipeComposer';
import type { ComposerSection } from '@/components/Recipe/Create/types';

export default function RecipeCreateClient() {
  const { data: session, status } = useSession();

  const { labels, metadataLoaded } = useRecipeMetadata();

  /**
   * Ref that RecipeComposer populates with its internal goToSection callback.
   * This lets form hooks imperatively navigate (e.g. on validation failure).
   */
  const goToSectionRef = useRef<((s: ComposerSection) => void) | null>(null);
  const goToSection = useCallback(
    (section: ComposerSection) => goToSectionRef.current?.(section),
    [],
  );

  const {
    formik,
    publishLoading,
    completion,
    lastSavedLabel,
    saveDraftNow,
    resetDraft,
    addIngredient,
    addStep,
  } = useRecipeForm({
    metadataLoaded,
    onSectionChange: goToSection,
    labels,
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      redirect('/api/auth/signin');
    }
  }, [status]);

  if (status === 'loading') return null;
  if (!session) return null;

  return (
    <RecipeComposer
      mode="create"
      formik={formik}
      submitLoading={publishLoading}
      completion={completion}
      lastSavedLabel={lastSavedLabel}
      onSave={saveDraftNow}
      onReset={resetDraft}
      addIngredient={addIngredient}
      addStep={addStep}
      headerTitle="Create Recipe"
      submitLabel="Publish"
      resetLabel="Clear draft"
      goToSectionRef={goToSectionRef}
    />
  );
}

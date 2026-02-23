'use client';

import {
  ActionIcon,
  Box,
  Drawer,
  Group,
  LoadingOverlay,
  ScrollArea,
} from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { IconArrowLeft } from '@tabler/icons-react';
import { FormikProvider } from 'formik';
import { useRouter } from 'next/navigation';
import { useCallback, useRef, useState } from 'react';
import ComposerHeader from './components/ComposerHeader';
import ComposerSidebar from './components/ComposerSidebar';
import { useRecipeForm } from './hooks/useRecipeForm';
import { useRecipeMetadata } from './hooks/useRecipeMetadata';
import { Preview } from './Preview';
import BasicsSection from './sections/BasicsSection';
import IngredientsSection from './sections/IngredientsSection';
import MediaSection from './sections/MediaSection';
import StepsSection from './sections/StepsSection';
import type { ComposerSection } from './types';

/* ─── Main Component ──────────────────────────── */
export const RecipeComposer = () => {
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeSection, setActiveSection] = useState<ComposerSection>('basics');
  const [previewOpen, setPreviewOpen] = useState(false);

  /* 1. Data & Metadata */
  const {
    categories,
    levels,
    labels,
    unitSuggestions,
    metadataLoading,
    metadataLoaded,
  } = useRecipeMetadata();

  const goToSection = useCallback((section: ComposerSection) => {
    setActiveSection(section);
    scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  /* 2. Form Logic */
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
    labels, // Used for transform on submit
  });

  /* Debounced values for Preview – avoids heavy re-render on every keystroke */
  const [debouncedPreviewValues] = useDebouncedValue(formik.values, 300);

  /* Stable navigation callbacks */
  const handleBack = useCallback(() => router.back(), [router]);
  const handleOpenPreview = useCallback(() => setPreviewOpen(true), []);
  const handleClosePreview = useCallback(() => setPreviewOpen(false), []);
  const goToBasics = useCallback(() => goToSection('basics'), [goToSection]);
  const goToMedia = useCallback(() => goToSection('media'), [goToSection]);
  const goToIngredients = useCallback(
    () => goToSection('ingredients'),
    [goToSection],
  );
  const goToSteps = useCallback(() => goToSection('steps'), [goToSection]);

  /* Loading gate */
  if (!metadataLoaded && metadataLoading) {
    return (
      <LoadingOverlay
        visible
        zIndex={1000}
        overlayProps={{ blur: 2, radius: 'sm' }}
      />
    );
  }

  return (
    <FormikProvider value={formik}>
      <Box
        style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}
      >
        <LoadingOverlay
          visible={publishLoading || metadataLoading}
          zIndex={1000}
          overlayProps={{ blur: 2, radius: 'sm' }}
        />

        {/* ═══ HEADER ═══ */}
        <ComposerHeader
          onBack={handleBack}
          completion={completion}
          lastSavedLabel={lastSavedLabel}
          onSave={saveDraftNow}
          onPreview={handleOpenPreview}
          onPublish={formik.submitForm}
          publishLoading={publishLoading}
        />

        {/* ═══ WORKSPACE ═══ */}
        <Group
          align="stretch"
          gap={0}
          style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}
        >
          {/* ── SIDEBAR NAV (desktop) ── */}
          <ComposerSidebar
            activeSection={activeSection}
            onSectionChange={goToSection}
            values={formik.values}
            completion={completion}
            onAddIngredient={addIngredient}
            onAddStep={addStep}
            onResetDraft={resetDraft}
          />

          {/* ── EDITOR (center) ── */}
          <ScrollArea
            viewportRef={scrollRef}
            style={{ flex: 1, height: '100%' }}
            type="always"
            bg="gray.0"
          >
            <Box
              py="xl"
              px={{ base: 'md', sm: 'xl' }}
              maw={860}
              mx="auto"
              style={{
                background:
                  'radial-gradient(1200px 500px at 0% 0%, rgba(99,102,241,0.04), transparent 60%), radial-gradient(900px 400px at 100% 0%, rgba(236,72,153,0.04), transparent 55%)',
              }}
            >
              {activeSection === 'basics' && (
                <BasicsSection
                  categories={categories}
                  levels={levels}
                  labels={labels}
                  onNext={goToMedia}
                />
              )}

              {activeSection === 'media' && (
                <MediaSection onBack={goToBasics} onNext={goToIngredients} />
              )}

              {activeSection === 'ingredients' && (
                <IngredientsSection
                  unitSuggestions={unitSuggestions}
                  onAdd={addIngredient}
                  onBack={goToMedia}
                  onNext={goToSteps}
                />
              )}

              {activeSection === 'steps' && (
                <StepsSection
                  onAdd={addStep}
                  onBack={goToIngredients}
                  onSubmit={formik.submitForm}
                  isSubmitting={publishLoading}
                />
              )}
            </Box>
          </ScrollArea>

          {/* ── PREVIEW (desktop right / drawer on mobile) ── */}
          <Box
            visibleFrom="lg"
            w={400}
            style={{
              borderLeft: '1px solid var(--mantine-color-gray-2)',
              flexShrink: 0,
            }}
          >
            <Preview labels={labels} values={debouncedPreviewValues} />
          </Box>
        </Group>

        <Drawer
          opened={previewOpen}
          onClose={handleClosePreview}
          position="right"
          size="lg"
          withCloseButton={false}
          styles={{ body: { height: '100%', padding: 0 } }}
        >
          <Preview labels={labels} values={debouncedPreviewValues} />
          <ActionIcon
            variant="filled"
            color="dark"
            radius="xl"
            size="lg"
            onClick={handleClosePreview}
            style={{
              position: 'absolute',
              top: 16,
              right: 16,
              zIndex: 200,
            }}
          >
            <IconArrowLeft size={18} />
          </ActionIcon>
        </Drawer>
      </Box>
    </FormikProvider>
  );
};

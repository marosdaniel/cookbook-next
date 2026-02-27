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
import type { FormikProps } from 'formik';
import { FormikProvider } from 'formik';
import { useRouter } from 'next/navigation';
import { type RefObject, useCallback, useEffect, useRef, useState } from 'react';
import ComposerHeader from './components/ComposerHeader';
import ComposerSidebar from './components/ComposerSidebar';
import { useRecipeMetadata } from './hooks/useRecipeMetadata';
import { Preview } from './Preview';
import BasicsSection from './sections/BasicsSection';
import IngredientsSection from './sections/IngredientsSection';
import MediaSection from './sections/MediaSection';
import StepsSection from './sections/StepsSection';
import type { ComposerMode, ComposerSection, RecipeFormValues } from './types';

/* ─── Props ───────────────────────────────────── */
export interface RecipeComposerProps {
  mode: ComposerMode;
  formik: FormikProps<RecipeFormValues>;
  submitLoading: boolean;
  completion: { done: number; total: number; percent: number };
  lastSavedLabel: string;
  onSave: () => void;
  onReset: () => void;
  addIngredient: () => void;
  addStep: () => void;
  /** Header title (e.g. "Create Recipe" | "Edit Recipe") */
  headerTitle: string;
  /** Submit button label (e.g. "Publish" | "Save Changes") */
  submitLabel: string;
  /** Reset button label (e.g. "Clear draft" | "Reset changes") */
  resetLabel: string;
  /**
   * Optional ref that parent components can use to imperatively
   * navigate to a specific section (e.g. on validation failure).
   */
  goToSectionRef?: RefObject<((section: ComposerSection) => void) | null>;
}

/* ─── Main Component ──────────────────────────── */
export const RecipeComposer = ({
  formik,
  submitLoading,
  completion,
  lastSavedLabel,
  onSave,
  onReset,
  addIngredient,
  addStep,
  headerTitle,
  submitLabel,
  resetLabel,
  goToSectionRef,
}: Readonly<RecipeComposerProps>) => {
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeSection, setActiveSection] = useState<ComposerSection>('basics');
  const [previewOpen, setPreviewOpen] = useState(false);

  /* Metadata */
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

  /* Expose goToSection to parent via ref */
  useEffect(() => {
    if (goToSectionRef) {
      goToSectionRef.current = goToSection;
    }
  }, [goToSection, goToSectionRef]);

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
          visible={submitLoading || metadataLoading}
          zIndex={1000}
          overlayProps={{ blur: 2, radius: 'sm' }}
        />

        {/* ═══ HEADER ═══ */}
        <ComposerHeader
          title={headerTitle}
          onBack={handleBack}
          completion={completion}
          lastSavedLabel={lastSavedLabel}
          onSave={onSave}
          onPreview={handleOpenPreview}
          onPublish={formik.submitForm}
          publishLoading={submitLoading}
          submitLabel={submitLabel}
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
            onReset={onReset}
            resetLabel={resetLabel}
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
                  isSubmitting={submitLoading}
                  submitLabel={submitLabel}
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

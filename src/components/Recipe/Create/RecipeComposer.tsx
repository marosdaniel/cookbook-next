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
import { AnimatePresence, motion } from 'motion/react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ComposerHeader from './components/ComposerHeader';
import ComposerSidebar from './components/ComposerSidebar';
import { sectionVariants } from './consts';
import { RecipeFormProvider } from './FormContext';
import { useRecipeMetadata } from './hooks/useRecipeMetadata';
import Preview from './Preview';
import BasicsSection from './sections/BasicsSection';
import IngredientsSection from './sections/IngredientsSection';
import MediaSection from './sections/MediaSection';
import StepsSection from './sections/StepsSection';
import type { ComposerSection, RecipeComposerProps } from './types';
import { getPublishButtonState } from './utils';

const RecipeComposer = ({
  form,
  handlePublish,
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

  const {
    categories,
    levels,
    labels,
    unitOptions,
    cuisines,
    servingUnits,
    dietaryFlags,
    allergens,
    equipment,
    costLevels,
    metadataLoading,
    metadataLoaded,
  } = useRecipeMetadata();

  const [debouncedPreviewValues] = useDebouncedValue(form.values, 300);

  const publishButtonState = useMemo(
    () => getPublishButtonState(form.values),
    [form.values],
  );

  const goToSection = useCallback((section: ComposerSection) => {
    setActiveSection(section);
    scrollRef.current?.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }, []);

  useEffect(() => {
    if (goToSectionRef) {
      goToSectionRef.current = goToSection;
    }

    return () => {
      if (goToSectionRef) {
        goToSectionRef.current = null;
      }
    };
  }, [goToSection, goToSectionRef]);

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

  const sectionContent = useMemo(() => {
    switch (activeSection) {
      case 'basics':
        return (
          <BasicsSection
            categories={categories}
            levels={levels}
            labels={labels}
            cuisines={cuisines}
            servingUnits={servingUnits}
            costLevels={costLevels}
            dietaryFlags={dietaryFlags}
            allergens={allergens}
            equipment={equipment}
            onNext={goToMedia}
          />
        );

      case 'media':
        return <MediaSection onBack={goToBasics} onNext={goToIngredients} />;

      case 'ingredients':
        return (
          <IngredientsSection
            unitOptions={unitOptions}
            onAdd={addIngredient}
            onBack={goToMedia}
            onNext={goToSteps}
          />
        );

      case 'steps':
        return (
          <StepsSection
            onAdd={addStep}
            onBack={goToIngredients}
            onSubmit={form.onSubmit(handlePublish)}
            isSubmitting={submitLoading}
            submitLabel={submitLabel}
          />
        );
    }
  }, [
    activeSection,
    addIngredient,
    categories,
    costLevels,
    dietaryFlags,
    equipment,
    form,
    goToBasics,
    goToIngredients,
    goToMedia,
    goToSteps,
    handlePublish,
    labels,
    levels,
    servingUnits,
    submitLabel,
    submitLoading,
    unitOptions,
    allergens,
    cuisines,
    addStep,
  ]);

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
    <RecipeFormProvider form={form}>
      <Box
        h="100vh"
        style={{ display: 'flex', flexDirection: 'column' }}
        data-testid="recipe-composer"
      >
        <LoadingOverlay
          visible={submitLoading || metadataLoading}
          zIndex={1000}
          overlayProps={{ blur: 2, radius: 'sm' }}
        />

        <ComposerHeader
          title={headerTitle}
          onBack={handleBack}
          completion={completion}
          lastSavedLabel={lastSavedLabel}
          onSave={onSave}
          onPreview={handleOpenPreview}
          onPublish={form.onSubmit(handlePublish)}
          publishLoading={submitLoading}
          submitLabel={submitLabel}
          isPublishDisabled={publishButtonState.disabled}
          publishTooltip={publishButtonState.missingFields.join(', ')}
        />

        <Group
          align="stretch"
          gap={0}
          style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}
          data-testid="recipe-composer-workspace"
        >
          <ComposerSidebar
            activeSection={activeSection}
            onSectionChange={goToSection}
            values={form.values}
            completion={completion}
            onAddIngredient={addIngredient}
            onAddStep={addStep}
            onReset={onReset}
            resetLabel={resetLabel}
          />

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
                  'radial-gradient(1200px 500px at 0% 0%, rgba(99, 102, 241, 0.04), transparent 60%), radial-gradient(900px 400px at 100% 0%, rgba(236, 72, 153, 0.04), transparent 55%)',
              }}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={activeSection}
                  variants={sectionVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                >
                  {sectionContent}
                </motion.div>
              </AnimatePresence>
            </Box>
          </ScrollArea>

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
            aria-label="Close preview"
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
    </RecipeFormProvider>
  );
};

export default RecipeComposer;

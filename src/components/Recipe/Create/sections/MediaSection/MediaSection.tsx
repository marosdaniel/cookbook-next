'use client';

import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Group,
  Image,
  Paper,
  Stack,
  Text,
  Textarea,
  TextInput,
  ThemeIcon,
  Title,
  Tooltip,
} from '@mantine/core';
import {
  IconArrowLeft,
  IconLink,
  IconPhoto,
  IconRefresh,
  IconSearch,
  IconToolsKitchen2,
  IconVideo,
  IconX,
} from '@tabler/icons-react';
import { AnimatePresence, motion } from 'motion/react';
import { useTranslations } from 'next-intl';
import { useCallback } from 'react';
import { slugify } from '@/utils/slugify';
import { MOTION_TRANSITION } from '../../../../../lib/motion/transitions';
import { useRecipeFormContext } from '../../FormContext';
import { useFormError } from '../../hooks/useFormError';
import { SEO_DESCRIPTION_MAX_LENGTH, SEO_TITLE_MAX_LENGTH } from '../../utils';
import type { MediaSectionProps } from './types';

type MediaTextField =
  | 'imgSrc'
  | 'youtubeLink'
  | 'slug'
  | 'seoTitle'
  | 'seoDescription'
  | 'socialImage';

const MediaSection = ({ onBack, onNext }: Readonly<MediaSectionProps>) => {
  const translate = useTranslations('recipeComposer.sections.media');
  const form = useRecipeFormContext();
  const { values, setFieldValue } = form;
  const { getFieldError, revalidateOnChange } = useFormError(form);

  const updateAndValidateField = useCallback(
    (field: MediaTextField) =>
      (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFieldValue(field, event.currentTarget.value);
        revalidateOnChange(field);
      },
    [revalidateOnChange, setFieldValue],
  );

  const clearCoverImage = useCallback(() => {
    setFieldValue('imgSrc', '');
    revalidateOnChange('imgSrc');
  }, [revalidateOnChange, setFieldValue]);

  const regenerateSlug = useCallback(() => {
    setFieldValue('slug', slugify(values.title));
    revalidateOnChange('slug');
  }, [revalidateOnChange, setFieldValue, values.title]);

  const seoTitleLength = values.seoTitle.length;
  const seoDescriptionLength = values.seoDescription.length;

  return (
    <Paper
      p={{ base: 'md', sm: 'xl' }}
      radius="lg"
      withBorder
      shadow="sm"
      data-testid="recipe-media-section"
    >
      <Stack gap="lg">
        <Group justify="space-between" align="baseline">
          <Group gap="xs">
            <ThemeIcon
              size={32}
              radius="md"
              variant="gradient"
              gradient={{ from: 'pink', to: 'orange' }}
            >
              <IconPhoto size={18} />
            </ThemeIcon>

            <Title order={3}>{translate('title')}</Title>
          </Group>

          <Badge variant="light" color={values.imgSrc ? 'green' : 'gray'}>
            {values.imgSrc ? translate('set') : translate('optional')}
          </Badge>
        </Group>

        <Text c="dimmed" size="sm">
          {translate('description')}
        </Text>

        <TextInput
          label={translate('coverImageUrl')}
          data-testid="recipe-media-cover-url"
          placeholder={translate('imageUrlPlaceholder')}
          leftSection={<IconPhoto size={16} />}
          value={values.imgSrc}
          onChange={updateAndValidateField('imgSrc')}
          error={getFieldError('imgSrc')}
          rightSection={
            values.imgSrc ? (
              <ActionIcon
                type="button"
                variant="subtle"
                color="gray"
                onClick={clearCoverImage}
                aria-label={translate('clearCoverImage')}
              >
                <IconX size={14} />
              </ActionIcon>
            ) : null
          }
        />

        <AnimatePresence initial={false}>
          {values.imgSrc && (
            <motion.div
              key="cover-image-preview"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 220 }}
              exit={{ opacity: 0, height: 0 }}
              transition={MOTION_TRANSITION.standard}
              style={{ overflow: 'hidden' }}
            >
              <Paper radius="md" withBorder>
                <Image
                  src={values.imgSrc}
                  alt={translate('coverPreview')}
                  h={220}
                  fit="cover"
                  fallbackSrc={`https://placehold.co/800x400?text=${translate(
                    'invalidImageUrl',
                  )}`}
                />
              </Paper>
            </motion.div>
          )}
        </AnimatePresence>

        <TextInput
          label={translate('youtubeVideo')}
          data-testid="recipe-media-youtube-url"
          placeholder={translate('youtubeUrlPlaceholder')}
          leftSection={<IconVideo size={16} />}
          value={values.youtubeLink}
          onChange={updateAndValidateField('youtubeLink')}
          error={getFieldError('youtubeLink')}
        />

        <Box>
          <Group gap="xs" mb="sm">
            <ThemeIcon size={24} radius="md" variant="light" color="grape">
              <IconSearch size={14} />
            </ThemeIcon>

            <Text fw={600} size="sm">
              {translate('seoSection')}
            </Text>
          </Group>

          <Stack gap="sm">
            <TextInput
              label={translate('slug')}
              data-testid="recipe-media-slug"
              placeholder={translate('slugPlaceholder')}
              leftSection={<IconLink size={16} />}
              value={values.slug}
              onChange={updateAndValidateField('slug')}
              error={getFieldError('slug')}
              rightSection={
                <Tooltip label={translate('regenerateSlugFromTitle')}>
                  <span>
                    <ActionIcon
                      type="button"
                      variant="subtle"
                      color="gray"
                      disabled={!values.title.trim()}
                      onClick={regenerateSlug}
                      aria-label={translate('regenerateSlugFromTitle')}
                    >
                      <IconRefresh size={14} />
                    </ActionIcon>
                  </span>
                </Tooltip>
              }
            />

            <Box>
              <TextInput
                label={translate('seoTitle')}
                data-testid="recipe-media-seo-title"
                placeholder={translate('seoTitlePlaceholder')}
                value={values.seoTitle}
                onChange={updateAndValidateField('seoTitle')}
                error={getFieldError('seoTitle')}
              />

              <Text
                size="xs"
                c={
                  seoTitleLength > SEO_TITLE_MAX_LENGTH * 0.9
                    ? 'orange'
                    : 'dimmed'
                }
                ta="right"
              >
                {seoTitleLength}/{SEO_TITLE_MAX_LENGTH}
              </Text>
            </Box>

            <Box>
              <Textarea
                label={translate('seoDescription')}
                data-testid="recipe-media-seo-description"
                placeholder={translate('seoDescriptionPlaceholder')}
                autosize
                minRows={2}
                maxRows={4}
                value={values.seoDescription}
                onChange={updateAndValidateField('seoDescription')}
                error={getFieldError('seoDescription')}
              />

              <Text
                size="xs"
                c={
                  seoDescriptionLength > SEO_DESCRIPTION_MAX_LENGTH * 0.9
                    ? 'orange'
                    : 'dimmed'
                }
                ta="right"
              >
                {seoDescriptionLength}/{SEO_DESCRIPTION_MAX_LENGTH}
              </Text>
            </Box>

            <TextInput
              label={translate('socialImage')}
              data-testid="recipe-media-social-image"
              placeholder={translate('socialImagePlaceholder')}
              leftSection={<IconPhoto size={16} />}
              value={values.socialImage}
              onChange={updateAndValidateField('socialImage')}
              error={getFieldError('socialImage')}
            />
          </Stack>
        </Box>

        <Group justify="space-between" mt="xs">
          <Button
            type="button"
            variant="subtle"
            color="gray"
            onClick={onBack}
            leftSection={<IconArrowLeft size={16} />}
          >
            {translate('back')}
          </Button>

          <Button
            type="button"
            variant="light"
            onClick={onNext}
            rightSection={<IconToolsKitchen2 size={16} />}
          >
            {translate('next')}
          </Button>
        </Group>
      </Stack>
    </Paper>
  );
};

export default MediaSection;

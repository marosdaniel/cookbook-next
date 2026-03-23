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
  TextInput,
  ThemeIcon,
  Title,
} from '@mantine/core';
import {
  IconArrowLeft,
  IconLink,
  IconPhoto,
  IconSearch,
  IconToolsKitchen2,
  IconVideo,
  IconX,
} from '@tabler/icons-react';
import { useTranslations } from 'next-intl';
import { useRecipeFormContext } from '../../FormContext';
import { useFormError } from '../../hooks/useFormError';
import { SEO_DESCRIPTION_MAX_LENGTH, SEO_TITLE_MAX_LENGTH } from '../../utils';
import type { MediaSectionProps } from './types';

const MediaSection = ({ onBack, onNext }: Readonly<MediaSectionProps>) => {
  const translate = useTranslations('recipeComposer.sections.media');
  const form = useRecipeFormContext();
  const { values, setFieldValue } = form;
  const { getFieldError, revalidateOnChange } = useFormError(form);

  return (
    <Paper p={{ base: 'md', sm: 'xl' }} radius="lg" withBorder shadow="sm">
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
          placeholder={translate('imageUrlPlaceholder')}
          leftSection={<IconPhoto size={16} />}
          value={values.imgSrc}
          onChange={(e) => {
            setFieldValue('imgSrc', e.target.value);
            revalidateOnChange('imgSrc');
          }}
          error={getFieldError('imgSrc')}
          rightSection={
            values.imgSrc ? (
              <ActionIcon
                variant="subtle"
                color="gray"
                onClick={() => {
                  setFieldValue('imgSrc', '');
                  revalidateOnChange('imgSrc');
                }}
              >
                <IconX size={14} />
              </ActionIcon>
            ) : null
          }
        />

        {values.imgSrc && (
          <Paper radius="md" style={{ overflow: 'hidden' }} withBorder>
            <Image
              src={values.imgSrc}
              alt={translate('coverPreview')}
              h={220}
              fit="cover"
              fallbackSrc={`https://placehold.co/800x400?text=${translate('invalidImageUrl')}`}
            />
          </Paper>
        )}

        <TextInput
          label={translate('youtubeVideo')}
          placeholder={translate('youtubeUrlPlaceholder')}
          leftSection={<IconVideo size={16} />}
          value={values.youtubeLink}
          onChange={(e) => {
            setFieldValue('youtubeLink', e.target.value);
            revalidateOnChange('youtubeLink');
          }}
          error={getFieldError('youtubeLink')}
        />

        {/* ── SEO Fields ── */}
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
              placeholder={translate('slugPlaceholder')}
              leftSection={<IconLink size={16} />}
              value={values.slug}
              onChange={(e) => {
                setFieldValue('slug', e.target.value);
                revalidateOnChange('slug');
              }}
              error={getFieldError('slug')}
            />

            <Box>
              <TextInput
                label={translate('seoTitle')}
                placeholder={translate('seoTitlePlaceholder')}
                value={values.seoTitle}
                onChange={(e) => {
                  setFieldValue('seoTitle', e.target.value);
                  revalidateOnChange('seoTitle');
                }}
                error={getFieldError('seoTitle')}
              />
              <Text
                size="xs"
                c={
                  (values.seoTitle?.length ?? 0) > SEO_TITLE_MAX_LENGTH * 0.9
                    ? 'orange'
                    : 'dimmed'
                }
                ta="right"
              >
                {values.seoTitle?.length ?? 0}/{SEO_TITLE_MAX_LENGTH}
              </Text>
            </Box>

            <Box>
              <TextInput
                label={translate('seoDescription')}
                placeholder={translate('seoDescriptionPlaceholder')}
                value={values.seoDescription}
                onChange={(e) => {
                  setFieldValue('seoDescription', e.target.value);
                  revalidateOnChange('seoDescription');
                }}
                error={getFieldError('seoDescription')}
              />
              <Text
                size="xs"
                c={
                  (values.seoDescription?.length ?? 0) >
                  SEO_DESCRIPTION_MAX_LENGTH * 0.9
                    ? 'orange'
                    : 'dimmed'
                }
                ta="right"
              >
                {values.seoDescription?.length ?? 0}/
                {SEO_DESCRIPTION_MAX_LENGTH}
              </Text>
            </Box>

            <TextInput
              label={translate('socialImage')}
              placeholder={translate('socialImagePlaceholder')}
              leftSection={<IconPhoto size={16} />}
              value={values.socialImage}
              onChange={(e) => {
                setFieldValue('socialImage', e.target.value);
                revalidateOnChange('socialImage');
              }}
              error={getFieldError('socialImage')}
            />
          </Stack>
        </Box>

        <Group justify="space-between" mt="xs">
          <Button
            variant="subtle"
            color="gray"
            onClick={onBack}
            leftSection={<IconArrowLeft size={16} />}
          >
            {translate('back')}
          </Button>
          <Button
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

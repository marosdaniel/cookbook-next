import {
  ActionIcon,
  Badge,
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
  IconPhoto,
  IconToolsKitchen2,
  IconVideo,
  IconX,
} from '@tabler/icons-react';
import { useFormikContext } from 'formik';
import { useTranslations } from 'next-intl';
import { useFormikError } from '../../hooks/useFormikError';
import type { RecipeFormValues } from '../../types';
import type { MediaSectionProps } from './types';

const MediaSection = ({ onBack, onNext }: Readonly<MediaSectionProps>) => {
  const t = useTranslations('recipeComposer.sections.media');
  const { values, setFieldValue } = useFormikContext<RecipeFormValues>();
  const { getFieldError, revalidateOnChange } = useFormikError();

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
            <Title order={3}>{t('title')}</Title>
          </Group>
          <Badge variant="light" color={values.imgSrc ? 'green' : 'gray'}>
            {values.imgSrc ? t('set') : t('optional')}
          </Badge>
        </Group>

        <Text c="dimmed" size="sm">
          {t('description')}
        </Text>

        <TextInput
          label={t('coverImageUrl')}
          placeholder={t('imageUrlPlaceholder')}
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
              alt={t('coverPreview')}
              h={220}
              fit="cover"
              fallbackSrc={`https://placehold.co/800x400?text=${t('invalidImageUrl')}`}
            />
          </Paper>
        )}

        <TextInput
          label={t('youtubeVideo')}
          placeholder={t('youtubeUrlPlaceholder')}
          leftSection={<IconVideo size={16} />}
          value={values.youtubeLink}
          onChange={(e) => {
            setFieldValue('youtubeLink', e.target.value);
            revalidateOnChange('youtubeLink');
          }}
          error={getFieldError('youtubeLink')}
        />

        <Group justify="space-between" mt="xs">
          <Button
            variant="subtle"
            color="gray"
            onClick={onBack}
            leftSection={<IconArrowLeft size={16} />}
          >
            {t('back')}
          </Button>
          <Button
            variant="light"
            onClick={onNext}
            rightSection={<IconToolsKitchen2 size={16} />}
          >
            {t('next')}
          </Button>
        </Group>
      </Stack>
    </Paper>
  );
};

export default MediaSection;

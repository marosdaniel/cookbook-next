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
import { getIn, useFormikContext } from 'formik';
import type { RecipeFormValues } from '../../types';
import type { MediaSectionProps } from './types';

const MediaSection = ({ onBack, onNext }: Readonly<MediaSectionProps>) => {
  const { values, setFieldValue, touched, errors } =
    useFormikContext<RecipeFormValues>();

  const getFieldError = (path: string): string | undefined => {
    const isTouched = Boolean(getIn(touched, path));
    const error = getIn(errors, path);
    return isTouched && typeof error === 'string' ? error : undefined;
  };

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
            <Title order={3}>Media</Title>
          </Group>
          <Badge variant="light" color={values.imgSrc ? 'green' : 'gray'}>
            {values.imgSrc ? 'Set' : 'Optional'}
          </Badge>
        </Group>

        <Text c="dimmed" size="sm">
          A stunning cover image makes your recipe stand out. Paste a URL below
          or leave it empty for now.
        </Text>

        <TextInput
          label="Cover Image URL"
          placeholder="https://..."
          leftSection={<IconPhoto size={16} />}
          value={values.imgSrc}
          onChange={(e) => setFieldValue('imgSrc', e.target.value)}
          error={getFieldError('imgSrc')}
          rightSection={
            values.imgSrc ? (
              <ActionIcon
                variant="subtle"
                color="gray"
                onClick={() => setFieldValue('imgSrc', '')}
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
              alt="Cover preview"
              h={220}
              fit="cover"
              fallbackSrc="https://placehold.co/800x400?text=Invalid+Image+URL"
            />
          </Paper>
        )}

        <TextInput
          label="YouTube Video (Optional)"
          placeholder="https://youtube.com/watch?v=..."
          leftSection={<IconVideo size={16} />}
          value={values.youtubeLink}
          onChange={(e) => setFieldValue('youtubeLink', e.target.value)}
          error={getFieldError('youtubeLink')}
        />

        <Group justify="space-between" mt="xs">
          <Button
            variant="subtle"
            color="gray"
            onClick={onBack}
            leftSection={<IconArrowLeft size={16} />}
          >
            Back
          </Button>
          <Button
            variant="light"
            onClick={onNext}
            rightSection={<IconToolsKitchen2 size={16} />}
          >
            Next: Ingredients
          </Button>
        </Group>
      </Stack>
    </Paper>
  );
};

export default MediaSection;

import { Box, Text } from '@mantine/core';
import { useTranslations } from 'next-intl';

type RecipeNotesProps = {
  tips?: string | null;
  substitutions?: string | null;
};

export const RecipeNotes = ({ tips, substitutions }: RecipeNotesProps) => {
  const t = useTranslations('recipePreview');

  const hasTips = Boolean(tips?.trim());
  const hasSubstitutions = Boolean(substitutions?.trim());

  if (!hasTips && !hasSubstitutions) {
    return null;
  }

  return (
    <>
      {hasTips && (
        <RecipeNote title={t('tips.title')} content={tips ?? ''} mt="xl" />
      )}

      {hasSubstitutions && (
        <RecipeNote
          title={t('substitutions.title')}
          content={substitutions ?? ''}
          mt="md"
        />
      )}
    </>
  );
};

type RecipeNoteProps = {
  title: string;
  content: string;
  mt: 'md' | 'xl';
};

const RecipeNote = ({ title, content, mt }: RecipeNoteProps) => (
  <Box mt={mt}>
    <Text size="sm" fw={600} mb="xs" c="dimmed" tt="uppercase">
      {title}
    </Text>

    <Text size="sm" style={{ whiteSpace: 'pre-wrap' }}>
      {content}
    </Text>
  </Box>
);

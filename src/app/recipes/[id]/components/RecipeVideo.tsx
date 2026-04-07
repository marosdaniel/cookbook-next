import { Box, Title } from '@mantine/core';
import { useTranslations } from 'next-intl';
import classes from '../RecipeDetail.module.css';
import type { RecipeVideoProps } from '../types';

export const RecipeVideo = ({
  youtubeId,
  title,
}: Readonly<RecipeVideoProps>) => {
  const translate = useTranslations('recipeDetail');

  return (
    <Box>
      <Title order={2} size="h3" mb="md">
        {translate('videoTitle')}
      </Title>
      <Box className={classes.videoWrapper}>
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${youtubeId}`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </Box>
    </Box>
  );
};

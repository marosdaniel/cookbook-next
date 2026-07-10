import { Box, Title } from '@mantine/core';
import { motion, useInView } from 'motion/react';
import { useTranslations } from 'next-intl';
import { useRef } from 'react';
import classes from '../RecipeDetail.module.css';
import type { RecipeVideoProps } from '../types';

export const RecipeVideo = ({
  youtubeId,
  title,
}: Readonly<RecipeVideoProps>) => {
  const translate = useTranslations('recipeDetail');

  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '200px 0px' });

  return (
    <Box ref={ref}>
      <Title order={2} size="h3" mb="md">
        {translate('videoTitle')}
      </Title>
      <Box
        className={classes.videoWrapper}
        style={{ backgroundColor: 'var(--mantine-color-gray-1)' }}
      >
        {isInView && (
          <motion.iframe
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            src={`https://www.youtube-nocookie.com/embed/${youtubeId}`}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              position: 'absolute',
              top: 0,
              left: 0,
            }}
          />
        )}
      </Box>
    </Box>
  );
};

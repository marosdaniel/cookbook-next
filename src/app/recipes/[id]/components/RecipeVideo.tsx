'use client';

import { Box, Title } from '@mantine/core';
import { motion, useInView } from 'motion/react';
import { useTranslations } from 'next-intl';
import { useRef } from 'react';
import { MOTION_TRANSITION } from '../../../../lib/motion/transitions';
import classes from '../RecipeDetail.module.css';
import type { RecipeVideoProps } from '../types';

export const RecipeVideo = ({
  youtubeId,
  title,
}: Readonly<RecipeVideoProps>) => {
  const translate = useTranslations('recipeDetail');
  const containerRef = useRef<HTMLDivElement>(null);

  const isInView = useInView(containerRef, {
    once: true,
    margin: '200px 0px',
    amount: 0.1,
  });

  return (
    <Box ref={containerRef}>
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
            transition={MOTION_TRANSITION.slow}
            src={`https://www.youtube-nocookie.com/embed/${youtubeId}`}
            title={title}
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              border: 0,
            }}
          />
        )}
      </Box>
    </Box>
  );
};

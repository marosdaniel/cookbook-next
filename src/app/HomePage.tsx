'use client';

import { useQuery } from '@apollo/client/react';
import { Box, Center, Stack, Text, Title } from '@mantine/core';
import { IconClockHour4, IconFlame } from '@tabler/icons-react';
import { motion } from 'motion/react';
import { useTranslations } from 'next-intl';
import type { RecipeCardData } from '@/components/Recipe/RecipeCard';
import { RecipeCarousel } from '@/components/Recipe/RecipeCarousel';
import { GET_LATEST_RECIPES } from '@/lib/graphql/queries';
import { MOTION_TRANSITION } from '../lib/motion/transitions';
import classes from './HomePage.module.css';
import { MOCK_RECENTLY_VIEWED_RECIPES } from './mockRecentlyViewed';

const sectionVariants = {
  hidden: {
    opacity: 0,
    y: 16,
  },
  visible: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      ...MOTION_TRANSITION.slow,
      delay: index * 0.08,
    },
  }),
};

const HomePage = () => {
  const translate = useTranslations('sidebar');
  const translateHome = useTranslations('home');

  const { data, loading } = useQuery(GET_LATEST_RECIPES, {
    variables: { limit: 10 },
  });

  const latestRecipes: RecipeCardData[] = data?.getRecipes?.recipes ?? [];

  return (
    <Stack gap="xl" p="md">
      <Box
        component={motion.section}
        className={classes.section}
        initial="hidden"
        animate="visible"
        custom={0}
        variants={sectionVariants}
      >
        <Box className={classes.sectionHeader}>
          <Title order={1} size="h3">
            <motion.span
              className={classes.titleIcon}
              whileHover={{ rotate: 8, scale: 1.08 }}
              transition={MOTION_TRANSITION.interactive}
            >
              <IconFlame size={22} />
            </motion.span>
            {translate('latestRecipes')}
          </Title>
        </Box>

        <RecipeCarousel
          loading={loading}
          recipes={latestRecipes}
          emptyMessage={translateHome('carouselEmpty')}
          withFavorite
        />
      </Box>

      <Box
        component={motion.section}
        className={classes.section}
        initial="hidden"
        animate="visible"
        custom={1}
        variants={sectionVariants}
      >
        <Box className={classes.sectionHeader}>
          <Title order={3}>
            <motion.span
              className={classes.titleIcon}
              whileHover={{ rotate: -8, scale: 1.08 }}
              transition={MOTION_TRANSITION.interactive}
            >
              <IconClockHour4 size={22} />
            </motion.span>
            {translateHome('recentlyViewed')}
          </Title>
        </Box>

        <RecipeCarousel
          recipes={MOCK_RECENTLY_VIEWED_RECIPES}
          withFavorite={false}
        />

        <Center mt="xs">
          <Text size="xs" c="dimmed" fs="italic">
            {translateHome('recentlyViewedHint')}
          </Text>
        </Center>
      </Box>
    </Stack>
  );
};

export default HomePage;

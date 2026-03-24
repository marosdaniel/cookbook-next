'use client';

import {
  Badge,
  Box,
  Card,
  Checkbox,
  Container,
  Divider,
  Group,
  Image,
  Paper,
  ScrollArea,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from '@mantine/core';
import {
  IconChefHat,
  IconClock,
  IconCoin,
  IconFlame,
  IconToolsKitchen2,
  IconUsers,
  IconWorld,
} from '@tabler/icons-react';
import { useTranslations } from 'next-intl';
import { memo } from 'react';
import type { PreviewProps } from './types';

const NO_VALUE_FALLBACK = '—';

export const Preview = memo(({ labels, values }: Readonly<PreviewProps>) => {
  const t = useTranslations('recipePreview');
  const categoryLabel = values.category?.label;
  const difficultyLabel = values.difficultyLevel?.label;
  const cuisineLabel = values.cuisine?.label;
  const costLevelLabel = values.costLevel?.label;
  const servingUnitLabel = values.servingUnit?.label;
  const tags = values.labels
    .map((k) => labels.find((l) => l.value === k)?.label ?? k)
    .filter(Boolean);

  // Compute total time
  const prep =
    typeof values.prepTimeMinutes === 'number' ? values.prepTimeMinutes : 0;
  const cook =
    typeof values.cookTimeMinutes === 'number' ? values.cookTimeMinutes : 0;
  const rest =
    typeof values.restTimeMinutes === 'number' ? values.restTimeMinutes : 0;
  const hasTimeParts =
    values.prepTimeMinutes || values.cookTimeMinutes || values.restTimeMinutes;

  return (
    <Card
      radius="lg"
      p={0}
      h="100%"
      style={{
        overflow: 'hidden',
        backgroundColor: 'var(--mantine-color-body)',
        border: '1px solid var(--mantine-color-gray-2)',
        boxShadow: 'var(--mantine-shadow-sm)',
      }}
    >
      <ScrollArea h="100%" type="scroll" offsetScrollbars>
        {/* HERO SECTION */}
        <Box pos="relative" h={{ base: 280, sm: 360 }} bg="gray.1">
          {values.imgSrc ? (
            <Image
              src={values.imgSrc}
              alt={t('imageAlt')}
              h="100%"
              w="100%"
              fit="cover"
              fallbackSrc="https://placehold.co/1200x600?text=Your+Delicious+Dish"
            />
          ) : (
            <Stack
              h="100%"
              align="center"
              justify="center"
              gap="md"
              bg="gray.1"
            >
              <ThemeIcon
                size={80}
                radius="50%"
                variant="light"
                color="gray"
                style={{ border: '2px dashed var(--mantine-color-gray-4)' }}
              >
                <IconChefHat size={40} />
              </ThemeIcon>
              <Text c="dimmed" fw={500}>
                {t('noCover')}
              </Text>
            </Stack>
          )}

          {/* Gradient Overlay */}
          <Box
            pos="absolute"
            inset={0}
            style={{
              background:
                'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.4) 60%, rgba(0,0,0,0.8) 100%)',
            }}
          />

          {/* Title & Key Meta Overlay */}
          <Box
            pos="absolute"
            bottom={0}
            left={0}
            right={0}
            p={{ base: 'md', sm: 'xl' }}
          >
            <Group gap="xs" mb="xs">
              {categoryLabel && (
                <Badge
                  variant="filled"
                  color="rgba(255,255,255,0.2)"
                  radius="sm"
                  c="white"
                  style={{ backdropFilter: 'blur(4px)' }}
                >
                  {categoryLabel}
                </Badge>
              )}
              {difficultyLabel && (
                <Badge
                  variant="filled"
                  color="rgba(255,255,255,0.2)"
                  radius="sm"
                  c="white"
                  style={{ backdropFilter: 'blur(4px)' }}
                  leftSection={<IconFlame size={12} />}
                >
                  {difficultyLabel}
                </Badge>
              )}
              {cuisineLabel && (
                <Badge
                  variant="filled"
                  color="rgba(255,255,255,0.2)"
                  radius="sm"
                  c="white"
                  style={{ backdropFilter: 'blur(4px)' }}
                  leftSection={<IconWorld size={12} />}
                >
                  {cuisineLabel}
                </Badge>
              )}
              {costLevelLabel && (
                <Badge
                  variant="filled"
                  color="rgba(255,255,255,0.2)"
                  radius="sm"
                  c="white"
                  style={{ backdropFilter: 'blur(4px)' }}
                  leftSection={<IconCoin size={12} />}
                >
                  {costLevelLabel}
                </Badge>
              )}
            </Group>

            <Title
              order={1}
              c="white"
              style={{
                fontSize: 'clamp(1.5rem, 4vw, 2.2rem)',
                lineHeight: 1.1,
                textShadow: '0 2px 10px rgba(0,0,0,0.3)',
              }}
            >
              {values.title?.trim() || t('title.untitled')}
            </Title>

            {!values.title?.trim() && (
              <Text c="dimmed" size="sm" mt="xs" fs="italic" opacity={0.7}>
                {t('title.addHint')}
              </Text>
            )}
          </Box>
        </Box>

        {/* CONTENT SECTION */}
        <Container size="md" p={{ base: 'md', sm: 'xl' }}>
          {/* Stats Grid */}
          <Group grow mb="xl">
            <Paper withBorder p="sm" radius="md">
              <Stack gap={4} align="center">
                <Text c="dimmed" size="xs" tt="uppercase" fw={700}>
                  {t('totalTime.label')}
                </Text>
                <Group gap={6}>
                  <IconClock size={18} color="var(--mantine-color-orange-6)" />
                  <Text fw={700}>
                    {values.cookingTime
                      ? `${values.cookingTime} m`
                      : NO_VALUE_FALLBACK}
                  </Text>
                </Group>
              </Stack>
            </Paper>
            <Paper withBorder p="sm" radius="md">
              <Stack gap={4} align="center">
                <Text c="dimmed" size="xs" tt="uppercase" fw={700}>
                  {t('servings.label')}
                </Text>
                <Group gap={6}>
                  <IconUsers size={18} color="var(--mantine-color-blue-6)" />
                  <Text fw={700}>
                    {values.servings
                      ? `${values.servings} ${servingUnitLabel || t('servings.fallbackUnit')}`
                      : NO_VALUE_FALLBACK}
                  </Text>
                </Group>
              </Stack>
            </Paper>
          </Group>

          {/* Time Breakdown */}
          {hasTimeParts && (
            <Group grow mb="md">
              {values.prepTimeMinutes ? (
                <Paper withBorder p="xs" radius="md">
                  <Stack gap={2} align="center">
                    <Text c="dimmed" size="xs" tt="uppercase" fw={600}>
                      {t('time.prep')}
                    </Text>
                    <Text size="sm" fw={600}>
                      {prep} min
                    </Text>
                  </Stack>
                </Paper>
              ) : null}
              {values.cookTimeMinutes ? (
                <Paper withBorder p="xs" radius="md">
                  <Stack gap={2} align="center">
                    <Text c="dimmed" size="xs" tt="uppercase" fw={600}>
                      {t('time.cook')}
                    </Text>
                    <Text size="sm" fw={600}>
                      {cook} min
                    </Text>
                  </Stack>
                </Paper>
              ) : null}
              {values.restTimeMinutes ? (
                <Paper withBorder p="xs" radius="md">
                  <Stack gap={2} align="center">
                    <Text c="dimmed" size="xs" tt="uppercase" fw={600}>
                      {t('time.rest')}
                    </Text>
                    <Text size="sm" fw={600}>
                      {rest} min
                    </Text>
                  </Stack>
                </Paper>
              ) : null}
            </Group>
          )}

          {/* Description */}
          {values.description?.trim() ? (
            <Text
              size="lg"
              lh={1.6}
              c="dimmed"
              mb="xl"
              style={{ whiteSpace: 'pre-wrap' }}
            >
              {values.description}
            </Text>
          ) : (
            <Text c="dimmed" fs="italic" opacity={0.5} mb="xl">
              {t('description.placeholder')}
            </Text>
          )}

          {/* Equipment */}
          {values.equipment.length > 0 && (
            <Box mb="md">
              <Text size="sm" fw={600} mb="xs" c="dimmed" tt="uppercase">
                {t('equipment.label')}
              </Text>
              <Group gap="xs">
                {values.equipment.map((key) => (
                  <Badge key={key} variant="outline" color="gray" size="sm">
                    {key}
                  </Badge>
                ))}
              </Group>
            </Box>
          )}

          <Divider
            my="xl"
            label={<IconToolsKitchen2 size={16} />}
            labelPosition="center"
          />

          {/* Main Content Grid (Ingredients & Steps) */}
          <Stack gap="xl">
            {/* Ingredients */}
            <Box>
              <Title order={3} mb="md">
                {t('ingredients.title')}
              </Title>
              {values.ingredients.length > 0 ? (
                <Paper
                  withBorder
                  radius="md"
                  p={0}
                  style={{ overflow: 'hidden' }}
                >
                  {values.ingredients.map((ing, i) => (
                    <Box
                      key={ing.localId}
                      p="sm"
                      style={{
                        borderBottom:
                          i < values.ingredients.length - 1
                            ? '1px solid var(--mantine-color-gray-2)'
                            : 'none',
                        backgroundColor:
                          i % 2 === 0
                            ? 'var(--mantine-color-gray-0)'
                            : 'transparent',
                        opacity: ing.isOptional ? 0.6 : 1,
                      }}
                    >
                      <Group justify="space-between" align="center">
                        <Group gap="sm">
                          <Checkbox
                            color="orange"
                            tabIndex={-1}
                            style={{ cursor: 'default' }}
                            readOnly
                          />
                          <Text fw={500}>
                            {ing.name}
                            {ing.isOptional && (
                              <Text span size="xs" c="dimmed" ml={4}>
                                {t('optional')}
                              </Text>
                            )}
                          </Text>
                        </Group>
                        <Badge variant="light" color="gray" size="sm">
                          {ing.quantity} {ing.unit}
                        </Badge>
                      </Group>
                      {ing.note && (
                        <Text size="xs" c="dimmed" mt={2} ml={36} fs="italic">
                          {ing.note}
                        </Text>
                      )}
                    </Box>
                  ))}
                </Paper>
              ) : (
                <Text c="dimmed" size="sm" fs="italic">
                  {t('ingredients.noIngredients')}
                </Text>
              )}
            </Box>

            {/* Steps */}
            <Box>
              <Title order={3} mb="md">
                {t('preparation.title')}
              </Title>
              {values.preparationSteps.length > 0 ? (
                <Stack gap="lg">
                  {values.preparationSteps
                    .slice()
                    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
                    .map((step, idx) => (
                      <Group
                        key={step.localId ?? idx}
                        align="flex-start"
                        wrap="nowrap"
                      >
                        <ThemeIcon
                          size={28}
                          radius="50%"
                          variant="gradient"
                          gradient={{ from: 'orange', to: 'red' }}
                          style={{ flexShrink: 0, marginTop: 4 }}
                        >
                          <Text size="sm" fw={700}>
                            {idx + 1}
                          </Text>
                        </ThemeIcon>
                        <Text pt={2} style={{ lineHeight: 1.6 }}>
                          {step.description || (
                            <Text span c="dimmed" fs="italic">
                              {t('step.describePlaceholder')}
                            </Text>
                          )}
                        </Text>
                      </Group>
                    ))}
                </Stack>
              ) : (
                <Text c="dimmed" size="sm" fs="italic">
                  {t('preparation.noSteps')}
                </Text>
              )}
            </Box>
          </Stack>

          {/* Tips */}
          {values.tips?.trim() && (
            <Box mt="xl">
              <Text size="sm" fw={600} mb="xs" c="dimmed" tt="uppercase">
                {t('tips.title')}
              </Text>
              <Text size="sm" style={{ whiteSpace: 'pre-wrap' }}>
                {values.tips}
              </Text>
            </Box>
          )}

          {/* Substitutions */}
          {values.substitutions?.trim() && (
            <Box mt="md">
              <Text size="sm" fw={600} mb="xs" c="dimmed" tt="uppercase">
                {t('substitutions.title')}
              </Text>
              <Text size="sm" style={{ whiteSpace: 'pre-wrap' }}>
                {values.substitutions}
              </Text>
            </Box>
          )}

          {/* Tags Footer */}
          {tags.length > 0 && (
            <Group mt={50} gap="xs">
              {tags.map((t) => (
                <Badge key={t} variant="dot" size="lg" color="gray" radius="sm">
                  {t}
                </Badge>
              ))}
            </Group>
          )}
        </Container>
      </ScrollArea>
    </Card>
  );
});

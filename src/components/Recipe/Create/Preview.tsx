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
  IconFlame,
  IconToolsKitchen2,
  IconUsers,
} from '@tabler/icons-react';
import { memo } from 'react';
import type { RecipeFormValues, TMetadataCleaned } from './types';

interface PreviewProps {
  labels: TMetadataCleaned[];
  values: RecipeFormValues;
}

const NO_VALUE_FALLBACK = '—';

export const Preview = memo(({ labels, values }: Readonly<PreviewProps>) => {
  const categoryLabel = values.category?.label;
  const difficultyLabel = values.difficultyLevel?.label;
  const tags = values.labels
    .map((k) => labels.find((l) => l.value === k)?.label ?? k)
    .filter(Boolean);

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
              alt="Recipe cover"
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
                No cover image yet
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
              {values.title?.trim() || 'Untitled Recipe'}
            </Title>

            {!values.title?.trim() && (
              <Text c="dimmed" size="sm" mt="xs" fs="italic" opacity={0.7}>
                (Add a title to see it here)
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
                  Total Time
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
                  Servings
                </Text>
                <Group gap={6}>
                  <IconUsers size={18} color="var(--mantine-color-blue-6)" />
                  <Text fw={700}>
                    {values.servings
                      ? `${values.servings} pp`
                      : NO_VALUE_FALLBACK}
                  </Text>
                </Group>
              </Stack>
            </Paper>
          </Group>

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
              Add a catchy description to hook your readers...
            </Text>
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
                Ingredients
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
                          <Text fw={500}>{ing.name}</Text>
                        </Group>
                        <Badge variant="light" color="gray" size="sm">
                          {ing.quantity} {ing.unit}
                        </Badge>
                      </Group>
                    </Box>
                  ))}
                </Paper>
              ) : (
                <Text c="dimmed" size="sm" fs="italic">
                  No ingredients listed yet.
                </Text>
              )}
            </Box>

            {/* Steps */}
            <Box>
              <Title order={3} mb="md">
                Preparation
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
                              Describe this step...
                            </Text>
                          )}
                        </Text>
                      </Group>
                    ))}
                </Stack>
              ) : (
                <Text c="dimmed" size="sm" fs="italic">
                  No steps added yet.
                </Text>
              )}
            </Box>
          </Stack>

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

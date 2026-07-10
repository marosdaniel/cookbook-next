import {
  ActionIcon,
  Button,
  Group,
  Paper,
  RingProgress,
  Stack,
  Text,
  Title,
  Tooltip,
} from '@mantine/core';
import {
  IconArrowLeft,
  IconDeviceFloppy,
  IconEye,
  IconWand,
} from '@tabler/icons-react';
import { AnimatePresence, motion } from 'motion/react';
import { useTranslations } from 'next-intl';
import { memo } from 'react';
import { MOTION_TRANSITION } from '../../../../../lib/motion/transitions';
import { getProgressColor } from '../../utils';
import type { ComposerHeaderProps } from './types';

const ComposerHeader = memo(
  ({
    title,
    onBack,
    completion,
    lastSavedLabel,
    onSave,
    onPreview,
    onPublish,
    publishLoading,
    submitLabel,
    isPublishDisabled,
    publishTooltip,
  }: Readonly<ComposerHeaderProps>) => {
    const ringColor = getProgressColor(completion.percent);
    const t = useTranslations('composerHeader');

    return (
      <Paper
        h={64}
        px="md"
        radius={0}
        data-testid="recipe-composer-header"
        style={{
          borderBottom: '1px solid var(--mantine-color-gray-2)',
          flexShrink: 0,
          zIndex: 100,
        }}
      >
        <Group h="100%" justify="space-between">
          <Group gap="sm">
            <ActionIcon
              variant="subtle"
              color="gray"
              onClick={onBack}
              size="lg"
              data-testid="recipe-composer-back"
            >
              <IconArrowLeft size={20} />
            </ActionIcon>
            <Group gap="xs" visibleFrom="xs">
              <Title order={4}>{title}</Title>
            </Group>
          </Group>

          <Group gap="xs">
            {/* Progress ring (desktop) */}
            <Group gap={8} visibleFrom="sm" mr="sm">
              <RingProgress
                size={36}
                thickness={3}
                sections={[
                  {
                    value: completion.percent,
                    color: ringColor,
                  },
                ]}
                label={
                  <AnimatePresence initial={false} mode="popLayout">
                    <motion.div
                      key={completion.percent}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={MOTION_TRANSITION.fast}
                    >
                      <Text size="xs" ta="center" fw={700}>
                        {completion.percent}
                      </Text>
                    </motion.div>
                  </AnimatePresence>
                }
              />
              <Stack gap={0}>
                <Text size="xs" fw={500}>
                  {completion.done}/{completion.total}
                </Text>
                <Text size="10px" c="dimmed">
                  {lastSavedLabel}
                </Text>
              </Stack>
            </Group>

            <Tooltip label={t('saveDraft.tooltip')}>
              <Button
                variant="default"
                leftSection={<IconDeviceFloppy size={16} />}
                onClick={onSave}
                visibleFrom="sm"
                data-testid="recipe-composer-save"
              >
                {t('save.button')}
              </Button>
            </Tooltip>
            <ActionIcon
              variant="default"
              size="lg"
              onClick={onSave}
              hiddenFrom="sm"
              data-testid="recipe-composer-save-mobile"
            >
              <IconDeviceFloppy size={18} />
            </ActionIcon>

            <Button
              variant="default"
              leftSection={<IconEye size={16} />}
              onClick={onPreview}
              hiddenFrom="lg"
              data-testid="recipe-composer-preview"
            >
              {t('preview.button')}
            </Button>

            <Tooltip
              label={publishTooltip}
              disabled={!isPublishDisabled}
              withArrow
              multiline
            >
              <motion.div
                whileHover={
                  isPublishDisabled || publishLoading ? undefined : { y: -1 }
                }
                whileTap={
                  isPublishDisabled || publishLoading
                    ? undefined
                    : { scale: 0.98 }
                }
                transition={MOTION_TRANSITION.interactive}
              >
                <Button
                  color="dark"
                  onClick={onPublish}
                  loading={publishLoading}
                  leftSection={<IconWand size={16} />}
                  radius="xl"
                  disabled={isPublishDisabled}
                  data-testid="recipe-composer-publish"
                >
                  {submitLabel}
                </Button>
              </motion.div>
            </Tooltip>
          </Group>
        </Group>
      </Paper>
    );
  },
);

export default ComposerHeader;

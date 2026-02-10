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

interface ComposerHeaderProps {
  onBack: () => void;
  completion: { done: number; total: number; percent: number };
  lastSavedLabel: string;
  onSave: () => void;
  onPreview: () => void;
  onPublish: () => void;
  publishLoading: boolean;
}

export function ComposerHeader({
  onBack,
  completion,
  lastSavedLabel,
  onSave,
  onPreview,
  onPublish,
  publishLoading,
}: Readonly<ComposerHeaderProps>) {
  let ringColor = 'orange';

  if (completion.percent === 100) {
    ringColor = 'teal';
  } else if (completion.percent > 50) {
    ringColor = 'blue';
  }

  return (
    <Paper
      h={64}
      px="md"
      radius={0}
      style={{
        borderBottom: '1px solid var(--mantine-color-gray-2)',
        flexShrink: 0,
        zIndex: 100,
      }}
    >
      <Group h="100%" justify="space-between">
        <Group gap="sm">
          <ActionIcon variant="subtle" color="gray" onClick={onBack} size="lg">
            <IconArrowLeft size={20} />
          </ActionIcon>
          <Group gap="xs" visibleFrom="xs">
            <Title order={4}>Create Recipe</Title>
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
                <Text size="xs" ta="center" fw={700}>
                  {completion.percent}
                </Text>
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

          <Tooltip label="Save draft">
            <Button
              variant="default"
              leftSection={<IconDeviceFloppy size={16} />}
              onClick={onSave}
              visibleFrom="sm"
            >
              Save
            </Button>
          </Tooltip>
          <ActionIcon
            variant="default"
            size="lg"
            onClick={onSave}
            hiddenFrom="sm"
          >
            <IconDeviceFloppy size={18} />
          </ActionIcon>

          <Button
            variant="default"
            leftSection={<IconEye size={16} />}
            onClick={onPreview}
            hiddenFrom="lg"
          >
            Preview
          </Button>

          <Button
            color="dark"
            onClick={onPublish}
            loading={publishLoading}
            leftSection={<IconWand size={16} />}
            radius="xl"
          >
            Publish
          </Button>
        </Group>
      </Group>
    </Paper>
  );
}

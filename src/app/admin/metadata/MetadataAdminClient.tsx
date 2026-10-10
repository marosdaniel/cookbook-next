'use client';

import { useMutation, useQuery } from '@apollo/client/react';
import {
  Badge,
  Box,
  Button,
  Group,
  Skeleton,
  Stack,
  Tabs,
  Text,
  Title,
} from '@mantine/core';
import { IconPlus, IconTags } from '@tabler/icons-react';
import { motion } from 'motion/react';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';
import { EmptyState } from '@/components/EmptyState';
import { REORDER_METADATA, SET_METADATA_ACTIVE } from '@/lib/graphql/mutations';
import { GET_ADMIN_METADATA } from '@/lib/graphql/queries';
import {
  METADATA_TYPES,
  type MetadataTypeName,
} from '@/lib/metadata/metadataTypes';
import { MOTION_TRANSITION } from '@/lib/motion/transitions';
import { ADMIN_METADATA_REFETCH_QUERIES } from './consts';
import { MetadataFormModal } from './MetadataFormModal';
import { MetadataTable } from './MetadataTable';
import type {
  AdminMetadataItem,
  MetadataFormState,
  TranslationKeysByType,
} from './types';
import {
  getReorderedIds,
  isMetadataTypeName,
  type MoveDirection,
  sortByOrder,
} from './utils';

type MetadataAdminClientProps = {
  translationKeysByType: TranslationKeysByType;
};

const NO_ITEMS: readonly AdminMetadataItem[] = [];
const SKELETON_ROWS = [1, 2, 3, 4, 5];

const MetadataAdminClient = ({
  translationKeysByType,
}: Readonly<MetadataAdminClientProps>) => {
  const translate = useTranslations('admin.metadata');
  const [activeType, setActiveType] = useState<MetadataTypeName>(
    METADATA_TYPES[0],
  );
  const [formState, setFormState] = useState<MetadataFormState | null>(null);
  const [formOpened, setFormOpened] = useState(false);

  const { data, loading } = useQuery(GET_ADMIN_METADATA, {
    fetchPolicy: 'cache-and-network',
  });
  const items: readonly AdminMetadataItem[] =
    data?.getAdminMetadata ?? NO_ITEMS;
  const hasData = data !== undefined;

  const itemsByType = useMemo(
    () =>
      Object.fromEntries(
        METADATA_TYPES.map((type) => [
          type,
          sortByOrder(items.filter((item) => item.type === type)),
        ]),
      ) as Record<MetadataTypeName, AdminMetadataItem[]>,
    [items],
  );

  const [setMetadataActive, { loading: toggling }] = useMutation(
    SET_METADATA_ACTIVE,
    { refetchQueries: ADMIN_METADATA_REFETCH_QUERIES },
  );
  const [reorderMetadata, { loading: reordering }] = useMutation(
    REORDER_METADATA,
    { refetchQueries: ADMIN_METADATA_REFETCH_QUERIES },
  );
  const mutating = toggling || reordering;

  const handleToggleActive = async (
    item: AdminMetadataItem,
    isActive: boolean,
  ) => {
    await setMetadataActive({ variables: { id: item.id, isActive } });
  };

  const handleMove = async (
    item: AdminMetadataItem,
    direction: MoveDirection,
  ) => {
    const orderedIds = getReorderedIds(
      itemsByType[item.type],
      item.id,
      direction,
    );

    if (orderedIds) {
      await reorderMetadata({
        variables: { type: item.type, orderedIds },
      });
    }
  };

  const openCreate = (type: MetadataTypeName) => {
    setFormState({ type, item: null });
    setFormOpened(true);
  };

  const openEdit = (item: AdminMetadataItem) => {
    setFormState({ type: item.type, item });
    setFormOpened(true);
  };

  const renderTypeContent = (type: MetadataTypeName) => {
    const typeItems = itemsByType[type];

    if (!hasData && loading) {
      return (
        <Stack gap="sm" data-testid="admin-metadata-loading">
          {SKELETON_ROWS.map((row) => (
            <Skeleton
              key={`metadata-skeleton-${row}`}
              height={44}
              radius="sm"
            />
          ))}
        </Stack>
      );
    }

    if (typeItems.length === 0) {
      return (
        <EmptyState
          data-testid="admin-metadata-empty"
          icon={<IconTags size={40} />}
          iconSize={80}
          title={translate('emptyTitle')}
          description={translate('emptyDescription')}
          action={{
            label: translate('createButton'),
            onClick: () => openCreate(type),
          }}
        />
      );
    }

    return (
      <MetadataTable
        items={typeItems}
        disabled={mutating}
        onMove={handleMove}
        onToggleActive={handleToggleActive}
        onEdit={openEdit}
      />
    );
  };

  return (
    <Stack gap="lg" data-testid="admin-metadata-page">
      <Group justify="space-between" align="flex-end" wrap="wrap" gap="md">
        <Box>
          <Title order={1} size="h2">
            {translate('title')}
          </Title>
          <Text c="dimmed" mt={4}>
            {translate('description')}
          </Text>
        </Box>
        <Button
          leftSection={<IconPlus size={16} />}
          onClick={() => openCreate(activeType)}
          data-testid="admin-metadata-create"
        >
          {translate('createButton')}
        </Button>
      </Group>

      <Tabs
        value={activeType}
        keepMounted={false}
        onChange={(value) => {
          if (value && isMetadataTypeName(value)) {
            setActiveType(value);
          }
        }}
        data-testid="admin-metadata-tabs"
      >
        <Tabs.List style={{ flexWrap: 'wrap' }}>
          {METADATA_TYPES.map((type) => (
            <Tabs.Tab
              key={type}
              value={type}
              data-testid={`admin-metadata-tab-${type}`}
              rightSection={
                <Badge size="xs" variant="light" radius="sm">
                  {itemsByType[type].length}
                </Badge>
              }
            >
              {translate(`types.${type}`)}
            </Tabs.Tab>
          ))}
        </Tabs.List>

        {METADATA_TYPES.map((type) => (
          <Tabs.Panel key={type} value={type} pt="md">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={MOTION_TRANSITION.fast}
            >
              {renderTypeContent(type)}
            </motion.div>
          </Tabs.Panel>
        ))}
      </Tabs>

      <MetadataFormModal
        opened={formOpened}
        state={formState}
        translationKeys={formState ? translationKeysByType[formState.type] : []}
        onClose={() => setFormOpened(false)}
      />
    </Stack>
  );
};

export default MetadataAdminClient;

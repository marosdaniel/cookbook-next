'use client';

import {
  ActionIcon,
  Code,
  Group,
  Switch,
  Table,
  Text,
  Tooltip,
} from '@mantine/core';
import {
  IconChevronDown,
  IconChevronUp,
  IconPencil,
} from '@tabler/icons-react';
import { motion } from 'motion/react';
import { useTranslations } from 'next-intl';
import { MOTION_TRANSITION } from '@/lib/motion/transitions';
import type { AdminMetadataItem } from './types';
import type { MoveDirection } from './utils';

const STAGGER_MAX_ROWS = 15;
const STAGGER_STEP_SECONDS = 0.03;

type MetadataTableProps = {
  items: readonly AdminMetadataItem[];
  disabled: boolean;
  onMove: (item: AdminMetadataItem, direction: MoveDirection) => void;
  onToggleActive: (item: AdminMetadataItem, isActive: boolean) => void;
  onEdit: (item: AdminMetadataItem) => void;
};

export const MetadataTable = ({
  items,
  disabled,
  onMove,
  onToggleActive,
  onEdit,
}: Readonly<MetadataTableProps>) => {
  const translate = useTranslations('admin.metadata');
  const translateMisc = useTranslations('misc');
  const animateRows = items.length <= STAGGER_MAX_ROWS;

  return (
    <Table.ScrollContainer minWidth={720} data-testid="admin-metadata-table">
      <Table verticalSpacing="sm" highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>{translate('columns.order')}</Table.Th>
            <Table.Th>{translate('columns.label')}</Table.Th>
            <Table.Th>{translate('columns.translationKey')}</Table.Th>
            <Table.Th>{translate('columns.active')}</Table.Th>
            <Table.Th>{translate('columns.actions')}</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {items.map((item, index) => {
            const isFirst = index === 0;
            const isLast = index === items.length - 1;
            const label = translateMisc(item.translationKey);

            return (
              <Table.Tr
                key={item.id}
                renderRoot={(props) => (
                  <motion.tr
                    {...props}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      ...MOTION_TRANSITION.fast,
                      delay: animateRows ? index * STAGGER_STEP_SECONDS : 0,
                    }}
                  />
                )}
                data-testid={`admin-metadata-row-${item.id}`}
              >
                <Table.Td>
                  <Group gap={4} wrap="nowrap">
                    <Tooltip label={translate('actions.moveUp')}>
                      <ActionIcon
                        variant="subtle"
                        size="sm"
                        disabled={disabled || isFirst}
                        onClick={() => onMove(item, 'up')}
                        aria-label={translate('actions.moveUp')}
                        data-testid={`admin-metadata-move-up-${item.id}`}
                      >
                        <IconChevronUp size={16} />
                      </ActionIcon>
                    </Tooltip>
                    <Tooltip label={translate('actions.moveDown')}>
                      <ActionIcon
                        variant="subtle"
                        size="sm"
                        disabled={disabled || isLast}
                        onClick={() => onMove(item, 'down')}
                        aria-label={translate('actions.moveDown')}
                        data-testid={`admin-metadata-move-down-${item.id}`}
                      >
                        <IconChevronDown size={16} />
                      </ActionIcon>
                    </Tooltip>
                    <Text size="sm" c="dimmed" ml={4}>
                      {item.sortOrder}
                    </Text>
                  </Group>
                </Table.Td>
                <Table.Td>
                  <Text
                    size="sm"
                    fw={500}
                    c={item.isActive ? undefined : 'dimmed'}
                  >
                    {label}
                  </Text>
                  <Text size="xs" c="dimmed">
                    {item.key}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Code>{item.translationKey}</Code>
                </Table.Td>
                <Table.Td>
                  <Switch
                    checked={item.isActive}
                    disabled={disabled}
                    onChange={(event) =>
                      onToggleActive(item, event.currentTarget.checked)
                    }
                    aria-label={translate('actions.toggleActive')}
                    data-testid={`admin-metadata-toggle-${item.id}`}
                  />
                </Table.Td>
                <Table.Td>
                  <Tooltip label={translate('actions.edit')}>
                    <ActionIcon
                      variant="subtle"
                      color="pink"
                      onClick={() => onEdit(item)}
                      aria-label={translate('actions.edit')}
                      data-testid={`admin-metadata-edit-${item.id}`}
                    >
                      <IconPencil size={16} />
                    </ActionIcon>
                  </Tooltip>
                </Table.Td>
              </Table.Tr>
            );
          })}
        </Table.Tbody>
      </Table>
    </Table.ScrollContainer>
  );
};

export default MetadataTable;

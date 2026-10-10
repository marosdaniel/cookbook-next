'use client';

import { useMutation } from '@apollo/client/react';
import { Button, Group, Modal, Select, Stack, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';
import { CREATE_METADATA, UPDATE_METADATA } from '@/lib/graphql/mutations';
import {
  showErrorNotification,
  showSuccessNotification,
} from '@/utils/notifications';
import { ADMIN_METADATA_REFETCH_QUERIES } from './consts';
import type { MetadataFormState, MetadataFormValues } from './types';
import { hasGraphQLErrorCode, validateMetadataKey } from './utils';

type MetadataFormModalProps = {
  opened: boolean;
  state: MetadataFormState | null;
  translationKeys: readonly string[];
  onClose: () => void;
};

export const MetadataFormModal = ({
  opened,
  state,
  translationKeys,
  onClose,
}: Readonly<MetadataFormModalProps>) => {
  const translate = useTranslations('admin.metadata');

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={state?.item ? translate('editTitle') : translate('createTitle')}
      centered
      data-testid="admin-metadata-modal"
    >
      {state && (
        <MetadataFormBody
          state={state}
          translationKeys={translationKeys}
          onDone={onClose}
        />
      )}
    </Modal>
  );
};

type MetadataFormBodyProps = {
  state: MetadataFormState;
  translationKeys: readonly string[];
  onDone: () => void;
};

// Mounted only while the modal is open, so the form resets on every opening.
const MetadataFormBody = ({
  state,
  translationKeys,
  onDone,
}: Readonly<MetadataFormBodyProps>) => {
  const translate = useTranslations('admin.metadata');
  const translateMisc = useTranslations('misc');
  const translateCommon = useTranslations();
  const { item } = state;
  const isEdit = item !== null;

  // errorPolicy 'none' so conflicts reject and can be reported next to the form.
  const [createMetadata, { loading: creating }] = useMutation(CREATE_METADATA, {
    errorPolicy: 'none',
    refetchQueries: ADMIN_METADATA_REFETCH_QUERIES,
  });
  const [updateMetadata, { loading: updating }] = useMutation(UPDATE_METADATA, {
    errorPolicy: 'none',
    refetchQueries: ADMIN_METADATA_REFETCH_QUERIES,
  });
  const saving = creating || updating;

  const form = useForm<MetadataFormValues>({
    mode: 'uncontrolled',
    initialValues: {
      key: item?.key ?? '',
      translationKey: item?.translationKey ?? '',
    },
    validate: {
      key: (value) => (isEdit ? null : validateMetadataKey(value, translate)),
      translationKey: (value) =>
        value ? null : translate('validation.translationKeyRequired'),
    },
  });

  const labelOptions = useMemo(
    () =>
      translationKeys.map((key) => ({
        value: key,
        label: translateMisc(key),
      })),
    [translationKeys, translateMisc],
  );

  const handleSubmit = async (values: MetadataFormValues) => {
    try {
      if (item) {
        await updateMetadata({
          variables: {
            id: item.id,
            metadataUpdateInput: { translationKey: values.translationKey },
          },
        });
        showSuccessNotification(
          translate('notifications.updatedTitle'),
          translate('notifications.updatedMessage'),
        );
      } else {
        await createMetadata({
          variables: {
            metadataCreateInput: {
              type: state.type,
              key: values.key.trim(),
              translationKey: values.translationKey,
            },
          },
        });
        showSuccessNotification(
          translate('notifications.createdTitle'),
          translate('notifications.createdMessage'),
        );
      }

      onDone();
    } catch (error) {
      if (hasGraphQLErrorCode(error, 'CONFLICT')) {
        showErrorNotification(
          translate('notifications.keyTakenTitle'),
          translate('notifications.keyTakenMessage'),
        );
      }
    }
  };

  return (
    <form
      onSubmit={form.onSubmit(handleSubmit)}
      data-testid="admin-metadata-form"
    >
      <Stack gap="md">
        <TextInput
          label={translate('fields.key')}
          description={isEdit ? undefined : translate('fields.keyHint')}
          required={!isEdit}
          disabled={isEdit}
          key={form.key('key')}
          {...form.getInputProps('key')}
          data-testid="admin-metadata-key-input"
        />
        <Select
          label={translate('fields.translationKey')}
          description={translate('fields.translationKeyHint')}
          required
          searchable
          data={labelOptions}
          nothingFoundMessage={translate('noTranslationKeys')}
          key={form.key('translationKey')}
          {...form.getInputProps('translationKey')}
          data-testid="admin-metadata-translation-select"
        />
        <Group justify="flex-end" mt="sm">
          <Button variant="default" onClick={onDone}>
            {translateCommon('general.cancel')}
          </Button>
          <Button
            type="submit"
            loading={saving}
            data-testid="admin-metadata-submit"
          >
            {translateCommon('general.save')}
          </Button>
        </Group>
      </Stack>
    </form>
  );
};

export default MetadataFormModal;

import { type MetadataType, Prisma } from '@prisma/client';
import type {
  MetadataCreateInput,
  MetadataUpdateInput,
} from '@/lib/graphql/generated/resolvers-types';
import {
  METADATA_KEY_MAX_LENGTH,
  METADATA_KEY_PATTERN,
} from '@/lib/metadata/metadataTypes';
import { getAvailableTranslationKeys } from '@/lib/metadata/translationKeys';
import { prisma } from '@/lib/prisma/prisma';
import { MetadataService } from '@/lib/services/MetadataService';
import { ErrorTypes } from '@/lib/validation/errorCatalog';
import { throwCustomError } from '@/lib/validation/throwCustomError';

const SORT_ORDER_STEP = 10;

type AuditEntry = {
  actorId: string;
  action: string;
  targetType: string;
  targetId: string;
  payload?: Prisma.InputJsonObject;
};

type AuditableMetadata = {
  key: string;
  translationKey: string;
  sortOrder: number;
  isActive: boolean;
};

/** Runs after the action and never throws: a logging failure must not fail the admin action. */
const writeAuditLog = async (entry: AuditEntry): Promise<void> => {
  try {
    await prisma.auditLog.create({ data: entry });
  } catch (error) {
    console.error('Audit log write failed', error);
  }
};

const toAuditSnapshot = (item: AuditableMetadata): Prisma.InputJsonObject => ({
  key: item.key,
  translationKey: item.translationKey,
  sortOrder: item.sortOrder,
  isActive: item.isActive,
});

const assertAdminRole = (role: string | undefined): void => {
  if (role !== 'ADMIN') {
    throwCustomError(
      'Unauthorized operation - admin rights required',
      ErrorTypes.FORBIDDEN,
    );
  }
};

const assertKnownTranslationKey = async (
  type: MetadataType,
  translationKey: string,
): Promise<void> => {
  const allowedKeys = await getAvailableTranslationKeys(type);

  if (!allowedKeys.includes(translationKey)) {
    return throwCustomError(
      'Translation key is not available for this metadata type',
      ErrorTypes.VALIDATION_ERROR,
    );
  }
};

const findMetadataOrThrow = async (id: string) => {
  const item = await prisma.metadata.findUnique({ where: { id } });

  if (!item) {
    return throwCustomError('Metadata item not found', ErrorTypes.NOT_FOUND);
  }

  return item;
};

const isUniqueConstraintViolation = (error: unknown): boolean =>
  error instanceof Prisma.PrismaClientKnownRequestError &&
  error.code === 'P2002';

export const AdminService = {
  async listMetadata(actorRole: string | undefined, type?: MetadataType) {
    assertAdminRole(actorRole);

    return prisma.metadata.findMany({
      where: type ? { type } : undefined,
      orderBy: [{ type: 'asc' }, { sortOrder: 'asc' }],
    });
  },

  async createMetadata(
    actorId: string,
    actorRole: string | undefined,
    input: MetadataCreateInput,
  ) {
    assertAdminRole(actorRole);

    const key = input.key.trim();
    if (
      !METADATA_KEY_PATTERN.test(key) ||
      key.length > METADATA_KEY_MAX_LENGTH
    ) {
      return throwCustomError(
        'Metadata key must use lowercase letters, digits and single hyphens',
        ErrorTypes.VALIDATION_ERROR,
      );
    }

    await assertKnownTranslationKey(input.type, input.translationKey);

    const lastItem = await prisma.metadata.findFirst({
      where: { type: input.type },
      orderBy: { sortOrder: 'desc' },
      select: { sortOrder: true },
    });

    try {
      const created = await prisma.metadata.create({
        data: {
          type: input.type,
          key,
          translationKey: input.translationKey,
          sortOrder: (lastItem?.sortOrder ?? 0) + SORT_ORDER_STEP,
          isActive: true,
        },
      });

      await MetadataService.invalidateActiveMetadataCache();
      await writeAuditLog({
        actorId,
        action: 'METADATA_CREATED',
        targetType: 'Metadata',
        targetId: created.id,
        payload: { after: toAuditSnapshot(created) },
      });

      return created;
    } catch (error) {
      if (isUniqueConstraintViolation(error)) {
        return throwCustomError(
          'Metadata key already exists for this type',
          ErrorTypes.CONFLICT,
        );
      }
      throw error;
    }
  },

  async updateMetadata(
    actorId: string,
    actorRole: string | undefined,
    id: string,
    input: MetadataUpdateInput,
  ) {
    assertAdminRole(actorRole);

    const before = await findMetadataOrThrow(id);
    await assertKnownTranslationKey(before.type, input.translationKey);

    const after = await prisma.metadata.update({
      where: { id },
      data: { translationKey: input.translationKey },
    });

    await MetadataService.invalidateActiveMetadataCache();
    await writeAuditLog({
      actorId,
      action: 'METADATA_UPDATED',
      targetType: 'Metadata',
      targetId: id,
      payload: {
        before: toAuditSnapshot(before),
        after: toAuditSnapshot(after),
      },
    });

    return after;
  },

  /** Soft delete: inactive items stay in the database and keep resolving for existing recipes. */
  async setMetadataActive(
    actorId: string,
    actorRole: string | undefined,
    id: string,
    isActive: boolean,
  ) {
    assertAdminRole(actorRole);

    const before = await findMetadataOrThrow(id);
    const after = await prisma.metadata.update({
      where: { id },
      data: { isActive },
    });

    await MetadataService.invalidateActiveMetadataCache();
    await writeAuditLog({
      actorId,
      action: isActive ? 'METADATA_ACTIVATED' : 'METADATA_DEACTIVATED',
      targetType: 'Metadata',
      targetId: id,
      payload: {
        before: toAuditSnapshot(before),
        after: toAuditSnapshot(after),
      },
    });

    return after;
  },

  async reorderMetadata(
    actorId: string,
    actorRole: string | undefined,
    type: MetadataType,
    orderedIds: string[],
  ) {
    assertAdminRole(actorRole);

    if (new Set(orderedIds).size !== orderedIds.length) {
      return throwCustomError(
        'Reorder request contains duplicate ids',
        ErrorTypes.BAD_REQUEST,
      );
    }

    const existingItems = await prisma.metadata.findMany({
      where: { type },
      select: { id: true },
    });
    const existingIds = new Set(existingItems.map((item) => item.id));
    const listsEveryItem =
      existingItems.length === orderedIds.length &&
      orderedIds.every((id) => existingIds.has(id));

    if (!listsEveryItem) {
      return throwCustomError(
        'Reorder request must list every item of the type exactly once',
        ErrorTypes.BAD_REQUEST,
      );
    }

    await prisma.$transaction(
      orderedIds.map((id, index) =>
        prisma.metadata.update({
          where: { id },
          data: { sortOrder: (index + 1) * SORT_ORDER_STEP },
        }),
      ),
    );

    await MetadataService.invalidateActiveMetadataCache();
    await writeAuditLog({
      actorId,
      action: 'METADATA_REORDERED',
      targetType: 'Metadata',
      targetId: type,
      payload: { after: orderedIds },
    });

    return prisma.metadata.findMany({
      where: { type },
      orderBy: { sortOrder: 'asc' },
    });
  },
};

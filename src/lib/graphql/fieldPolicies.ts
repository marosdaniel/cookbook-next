import type { UserRole } from '@/types/user';

type FieldPolicyContext = {
  userId?: string;
  role?: UserRole;
};

type FieldPolicySource = {
  id?: string;
};

type FieldPolicy = (
  source: FieldPolicySource | null | undefined,
  context: FieldPolicyContext,
) => boolean;

const isSelfOrAdmin: FieldPolicy = (source, context) =>
  context.role === 'ADMIN' ||
  Boolean(context.userId && source?.id && context.userId === source.id);

export const userFieldPolicies: Record<string, FieldPolicy> = {
  email: isSelfOrAdmin,
};

export const canResolveUserField = (
  fieldName: string,
  source: FieldPolicySource | null | undefined,
  context: FieldPolicyContext,
) => userFieldPolicies[fieldName]?.(source, context) ?? true;

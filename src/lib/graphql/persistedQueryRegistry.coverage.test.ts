import type { DocumentNode } from 'graphql';
import { describe, expect, it } from 'vitest';
import * as generated from '@/lib/graphql/generated/graphql';
import { isDocumentAllowed } from './persistedQueryRegistry';

// Generated documents that are intentionally never sent by the client.
// Keep this list empty unless there is a documented reason.
const INTENTIONALLY_EXCLUDED: readonly string[] = [];

const isDocumentNode = (value: unknown): value is DocumentNode =>
  typeof value === 'object' &&
  value !== null &&
  (value as { kind?: unknown }).kind === 'Document';

const generatedDocuments = Object.entries(generated).filter(
  ([name, value]) => name.endsWith('Document') && isDocumentNode(value),
) as Array<[string, DocumentNode]>;

describe('persisted query registry coverage', () => {
  it('discovers the generated client documents', () => {
    expect(generatedDocuments.length).toBeGreaterThan(0);
  });

  it('contains every generated client document', () => {
    const missing = generatedDocuments
      .filter(([name]) => !INTENTIONALLY_EXCLUDED.includes(name))
      .filter(([, document]) => !isDocumentAllowed(document))
      .map(([name]) => name);

    // A non-empty list means a client operation would be rejected with
    // PERSISTED_QUERY_NOT_ALLOWED in production. Add it to
    // persistedQueryRegistry.ts (or to INTENTIONALLY_EXCLUDED with a reason).
    expect(missing).toEqual([]);
  });
});

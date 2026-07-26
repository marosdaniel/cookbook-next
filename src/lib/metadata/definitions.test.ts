import { describe, expect, it } from 'vitest';
import { METADATA_DEFINITIONS } from './definitions';

describe('metadata data', () => {
  it('exports a non-empty metadata list', () => {
    expect(METADATA_DEFINITIONS.length).toBeGreaterThan(0);
  });

  it('contains category and label entries', () => {
    const categories = METADATA_DEFINITIONS.filter(
      (entry) => entry.type === 'CATEGORY',
    );
    const labels = METADATA_DEFINITIONS.filter(
      (entry) => entry.type === 'LABEL',
    );

    expect(categories.length).toBeGreaterThan(0);
    expect(labels.length).toBeGreaterThan(0);
  });

  it('has valid translationKeys and sortOrders', () => {
    for (const item of METADATA_DEFINITIONS) {
      expect(item.translationKey).toBeTruthy();
      expect(item.sortOrder).toBeGreaterThanOrEqual(0);
      expect(item.isActive).toBeDefined();
    }
  });

  it('has unique type and key combinations', () => {
    const seen = new Set();
    for (const item of METADATA_DEFINITIONS) {
      const id = `${item.type}_${item.key}`;
      expect(seen.has(id)).toBe(false);
      seen.add(id);
    }
  });
});

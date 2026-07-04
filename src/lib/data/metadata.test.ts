import { describe, expect, it } from 'vitest';

import { METADATA } from './metadata';

describe('metadata data', () => {
  it('exports a non-empty metadata list', () => {
    expect(METADATA.length).toBeGreaterThan(0);
  });

  it('contains category and label entries', () => {
    const categories = METADATA.filter((entry) => entry.type === 'CATEGORY');
    const labels = METADATA.filter((entry) => entry.type === 'LABEL');

    expect(categories.length).toBeGreaterThan(0);
    expect(labels.length).toBeGreaterThan(0);
  });
});

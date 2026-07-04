import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { zodResolver } from './zodResolver';

describe('zodResolver', () => {
  it('returns no errors for valid values', () => {
    const schema = z.object({ name: z.string().min(1) });
    const resolver = zodResolver(schema);

    expect(resolver({ name: 'Ada' })).toEqual({});
  });

  it('returns field errors for invalid values', () => {
    const schema = z.object({ name: z.string().min(1) });
    const resolver = zodResolver(schema);

    const errors = resolver({ name: '' });

    expect(errors).toEqual({
      name: expect.any(String),
    });
    expect(errors.name).toContain('characters');
  });
});

import { describe, expect, it, vi } from 'vitest';

import { isFormSubmitDisabled } from './isFormSubmitDisabled';

describe('isFormSubmitDisabled', () => {
  const createForm = (
    overrides: Partial<{
      isValid: () => boolean | Promise<boolean>;
      isDirty: () => boolean;
    }> = {},
  ) => ({
    isValid: () => true,
    isDirty: () => true,
    ...overrides,
  });

  it('disables when the form is loading', () => {
    expect(isFormSubmitDisabled(createForm(), true)).toBe(true);
  });

  it('disables when the form is not dirty', () => {
    expect(
      isFormSubmitDisabled(createForm({ isDirty: () => false }), false),
    ).toBe(true);
  });

  it('disables when form validation returns a promise', () => {
    expect(
      isFormSubmitDisabled(
        createForm({ isValid: () => Promise.resolve(true) }),
        false,
      ),
    ).toBe(true);
  });

  it('disables when form validation throws', () => {
    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    expect(
      isFormSubmitDisabled(
        createForm({
          isValid: () => {
            throw new Error('boom');
          },
        }),
        false,
      ),
    ).toBe(true);
    expect(consoleErrorSpy).toHaveBeenCalled();
  });

  it('disables when any extra loading flag is true', () => {
    expect(isFormSubmitDisabled(createForm(), false, false, true)).toBe(true);
  });

  it('disables when the form is invalid', () => {
    expect(
      isFormSubmitDisabled(createForm({ isValid: () => false }), false),
    ).toBe(true);
  });

  it('treats a boolean false validation result as invalid', () => {
    expect(
      isFormSubmitDisabled(
        createForm({ isValid: () => false as unknown as boolean }),
        false,
      ),
    ).toBe(true);
  });

  it('enables when the form is valid, dirty, and not loading', () => {
    expect(isFormSubmitDisabled(createForm(), false)).toBe(false);
  });
});

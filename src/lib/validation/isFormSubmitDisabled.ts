/**
 * Determines whether a form submit button should be disabled.
 *
 * Why this helper exists
 * ─────────────────────
 * Mantine Form v9 (alpha) changed the return type of `form.isValid()` to
 * `boolean | Promise<boolean>` when async validation rules are possible.
 * Putting that value directly into a boolean conditional (e.g. `!form.isValid()`)
 * triggers SonarQube rule typescript:S6544 ("Expected non-Promise value in a
 * boolean conditional") and is also subtly wrong at runtime: a Promise object
 * is always truthy, so `!form.isValid()` would always be `false` when async
 * rules resolve to a Promise.
 *
 * We unwrap the result explicitly with an `instanceof Promise` guard:
 *   - Sync validator  → plain `boolean` → use directly
 *   - Async validator → `Promise`       → treat as "not yet valid" (disabled)
 *
 * This is safer than checking `Object.keys(form.errors)`, which only reflects
 * errors that have already been surfaced via a blur/submit event – meaning the
 * button could incorrectly appear enabled before the user interacts with the form.
 */

type FormLike = {
  errors: Record<string, unknown>;
  isDirty: (path?: string) => boolean;
  isValid: () => boolean | Promise<boolean>;
};

/**
 * Returns `true` when the submit button should be **disabled**.
 *
 * @param form     - The Mantine `useForm` instance.
 * @param loading  - Whether an async operation (mutation / request) is in flight.
 * @param extra    - Optional additional loading flags (e.g. `isLoggingIn`).
 */
export function isFormSubmitDisabled(
  form: FormLike,
  loading: boolean,
  ...extra: boolean[]
): boolean {
  let isFormValid = false;

  try {
    const validResult = form.isValid();
    // Safely unwrap: async validators (Promise) count as "not yet valid".
    isFormValid = validResult instanceof Promise ? false : validResult;
  } catch (_err) {
    // Some Mantine versions may expect internal structures (like rules)
    // to exist when `isValid()` is called; in those cases fall back to a
    // conservative behaviour: treat the form as invalid so the submit stays
    // disabled. This prevents runtime crashes in test/dev environments.
    isFormValid = false;
  }

  const isLoading = loading || extra.some(Boolean);
  return isLoading || !isFormValid || !form.isDirty();
}

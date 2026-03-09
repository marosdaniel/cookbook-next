/**
 * Determines whether a form submit button should be disabled.
 *
 * Why this helper exists
 * ─────────────────────
 * Mantine Form v9 (alpha) changed the return type of `form.isValid()` to
 * `boolean | Promise<boolean>` when async validation rules are possible.
 * Using that return value directly in a boolean conditional triggers the
 * SonarQube rule typescript:S6544 ("Expected non-Promise value in a boolean
 * conditional") and can also silently produce incorrect results at runtime,
 * because a Promise object is always truthy — meaning `!form.isValid()` would
 * always evaluate to `false` when async rules are present.
 *
 * Instead, we check `form.errors` which is always a plain synchronous
 * `Record<string, ReactNode>` object, making the guard type-safe and
 * free of any implicit Promise coercion.
 */

type FormLike = {
  errors: Record<string, unknown>;
  isDirty: (path?: string) => boolean;
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
  const hasErrors = Object.keys(form.errors).length > 0;
  const isLoading = loading || extra.some(Boolean);
  return isLoading || hasErrors || !form.isDirty();
}

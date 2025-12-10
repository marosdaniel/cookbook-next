/**
 * Shared constants for authentication flows
 */

export const AUTH_CONSTANTS = {
  /**
   * Redirect delay after successful password reset (ms)
   */
  PASSWORD_RESET_REDIRECT_DELAY: 1500,

  /**
   * Default notification position
   */
  NOTIFICATION_POSITION: 'top-right' as const,
} as const;

import type { Session } from 'next-auth';
import { auth } from '@/lib/auth/auth';
import { logger } from '@/server/platform/logger';

const REVOKED_SESSION_MESSAGE = 'Session has been revoked';

/**
 * Resolves the current session without ever throwing.
 *
 * The `session` callback rejects for revoked tokens, which would turn a plain
 * "please sign in again" case into a server error when `auth()` is called
 * directly. Revoked sessions are treated as anonymous; any other failure (for
 * example a database outage) is logged so it does not disappear silently.
 */
export const getSessionSafely = async (): Promise<Session | null> => {
  try {
    const session = await auth();
    return session?.user?.id ? session : null;
  } catch (error) {
    if (error instanceof Error && error.message === REVOKED_SESSION_MESSAGE) {
      logger.debug('Ignoring revoked session; treating request as anonymous');
    } else {
      logger.warn(
        { err: error },
        'Session resolution failed; treating request as anonymous',
      );
    }
    return null;
  }
};

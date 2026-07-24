import { notifications } from '@mantine/notifications';

/**
 * Extract a user-facing message from a variety of API response shapes.
 */
export const getNotificationMessage = (
  payload: unknown,
  fallbackMessage: string,
) => {
  if (typeof payload === 'string' && payload.trim().length > 0) {
    return payload;
  }

  if (payload && typeof payload === 'object') {
    const record = payload as { message?: unknown; error?: unknown };

    if (
      typeof record.message === 'string' &&
      record.message.trim().length > 0
    ) {
      return record.message;
    }

    if (typeof record.error === 'string' && record.error.trim().length > 0) {
      return record.error;
    }
  }

  return fallbackMessage;
};

/**
 * Display error notification with consistent styling
 */
export const showErrorNotification = (
  title: string,
  fallbackMessage: string,
  error?: unknown,
) => {
  const errorMessage = getNotificationMessage(error, fallbackMessage);

  notifications.show({
    title,
    message: errorMessage,
    color: 'red',
  });
};

/**
 * Display success notification with consistent styling
 */
export const showSuccessNotification = (title: string, message: string) => {
  notifications.show({
    title,
    message,
    color: 'teal',
  });
};

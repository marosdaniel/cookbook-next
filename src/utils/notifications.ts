import { notifications } from '@mantine/notifications';

/**
 * Display error notification with consistent styling
 */
export const showErrorNotification = (
  title: string,
  message: string,
  error?: unknown,
) => {
  const errorMessage = error instanceof Error ? error.message : message;

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
    color: 'green',
  });
};

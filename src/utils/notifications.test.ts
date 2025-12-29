import { notifications } from '@mantine/notifications';
import { describe, expect, it, vi } from 'vitest';
import {
  showErrorNotification,
  showSuccessNotification,
} from './notifications';

// Mock @mantine/notifications
vi.mock('@mantine/notifications', () => ({
  notifications: {
    show: vi.fn(),
  },
}));

describe('notifications utils', () => {
  describe('showErrorNotification', () => {
    it('should call notifications.show with red color and provided title/message', () => {
      const title = 'Error Title';
      const message = 'Something went wrong';

      showErrorNotification(title, message);

      expect(notifications.show).toHaveBeenCalledWith({
        title,
        message,
        color: 'red',
      });
    });

    it('should use error message if error is an instance of Error', () => {
      const title = 'Error Title';
      const message = 'Default message';
      const error = new Error('Actual error message');

      showErrorNotification(title, message, error);

      expect(notifications.show).toHaveBeenCalledWith({
        title,
        message: 'Actual error message',
        color: 'red',
      });
    });

    it('should use default message if error is not an instance of Error', () => {
      const title = 'Error Title';
      const message = 'Default message';
      const error = { some: 'object' };

      showErrorNotification(title, message, error);

      expect(notifications.show).toHaveBeenCalledWith({
        title,
        message,
        color: 'red',
      });
    });
  });

  describe('showSuccessNotification', () => {
    it('should call notifications.show with green color and provided title/message', () => {
      const title = 'Success Title';
      const message = 'Operations completed';

      showSuccessNotification(title, message);

      expect(notifications.show).toHaveBeenCalledWith({
        title,
        message,
        color: 'green',
      });
    });
  });
});

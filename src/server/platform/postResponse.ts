import { after } from 'next/server';
import { logger } from './logger';

export const schedulePostResponseTask = (
  task: () => Promise<unknown>,
  errorMessage: string,
): void => {
  const executeSafely = async () => {
    try {
      await task();
    } catch (error) {
      logger.error({ err: error }, errorMessage);
    }
  };

  try {
    after(executeSafely);
  } catch {
    void executeSafely();
  }
};

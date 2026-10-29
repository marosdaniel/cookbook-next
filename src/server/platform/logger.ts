import pino from 'pino';
import { requestStorage } from './requestContext';

export const REDACTED_LOG_PATHS = [
  'password',
  'token',
  'authorization',
  'cookie',
  'email',
  '*.password',
  '*.token',
  '*.authorization',
  '*.cookie',
  '*.email',
  'headers.authorization',
  'headers.cookie',
];

export const createLogger = (destination?: pino.DestinationStream) =>
  pino(
    {
      level: process.env.VITEST ? 'silent' : (process.env.LOG_LEVEL ?? 'info'),
      redact: {
        paths: REDACTED_LOG_PATHS,
        censor: '[REDACTED]',
      },
      mixin() {
        const requestId = requestStorage.getStore()?.requestId;
        return requestId ? { requestId } : {};
      },
    },
    destination,
  );

export const logger = createLogger();

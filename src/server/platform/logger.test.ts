import { Writable } from 'node:stream';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createLogger } from './logger';
import { requestStorage } from './requestContext';

describe('structured pino logger', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('redacts sensitive fields and automatically injects requestId from AsyncLocalStorage', () => {
    vi.stubEnv('VITEST', '');
    const chunks: string[] = [];
    const stream = new Writable({
      write(chunk, _encoding, callback) {
        chunks.push(chunk.toString());
        callback();
      },
    });

    const testLogger = createLogger(stream);

    requestStorage.run(
      { session: null, requestId: 'req-abc-123', clientKey: '127.0.0.1' },
      () => {
        testLogger.info(
          {
            event: 'auth.attempt',
            email: 'secret@example.com',
            password: 'super-secret-password',
            token: 'reset-token-123',
            nested: {
              cookie: 'session=xyz',
              authorization: 'Bearer tok',
            },
          },
          'Processed auth attempt',
        );
      },
    );

    expect(chunks.length).toBe(1);
    const parsed = JSON.parse(chunks[0] ?? '{}') as Record<string, unknown>;
    expect(parsed.requestId).toBe('req-abc-123');
    expect(parsed.event).toBe('auth.attempt');
    expect(parsed.email).toBe('[REDACTED]');
    expect(parsed.password).toBe('[REDACTED]');
    expect(parsed.token).toBe('[REDACTED]');
    expect((parsed.nested as Record<string, unknown>).cookie).toBe(
      '[REDACTED]',
    );
    expect((parsed.nested as Record<string, unknown>).authorization).toBe(
      '[REDACTED]',
    );
  });
});

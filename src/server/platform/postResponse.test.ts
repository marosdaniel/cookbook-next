import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockAfter, mockLoggerError } = vi.hoisted(() => ({
  mockAfter: vi.fn(),
  mockLoggerError: vi.fn(),
}));

vi.mock('next/server', () => ({ after: mockAfter }));
vi.mock('./logger', () => ({ logger: { error: mockLoggerError } }));

import { schedulePostResponseTask } from './postResponse';

const flushMicrotasks = () => new Promise((resolve) => setTimeout(resolve, 0));

describe('schedulePostResponseTask', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('hands the task to next/server after() when a request scope exists', async () => {
    const task = vi.fn().mockResolvedValue(undefined);
    mockAfter.mockImplementation((fn: () => Promise<void>) => fn());

    schedulePostResponseTask(task, 'boom');
    await flushMicrotasks();

    expect(mockAfter).toHaveBeenCalledTimes(1);
    expect(task).toHaveBeenCalledTimes(1);
  });

  it('falls back to running the task immediately when after() throws', async () => {
    const task = vi.fn().mockResolvedValue(undefined);
    mockAfter.mockImplementation(() => {
      throw new Error('no request scope');
    });

    schedulePostResponseTask(task, 'boom');
    await flushMicrotasks();

    expect(task).toHaveBeenCalledTimes(1);
  });

  it('logs task failures with the provided message instead of rejecting', async () => {
    const failure = new Error('smtp down');
    const task = vi.fn().mockRejectedValue(failure);
    mockAfter.mockImplementation((fn: () => Promise<void>) => fn());

    expect(() =>
      schedulePostResponseTask(task, 'Error sending email:'),
    ).not.toThrow();
    await flushMicrotasks();

    expect(mockLoggerError).toHaveBeenCalledWith(
      { err: failure },
      'Error sending email:',
    );
  });
});

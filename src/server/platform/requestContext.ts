import { AsyncLocalStorage } from 'node:async_hooks';
import type { Session } from 'next-auth';

export interface RequestStoreContext {
  session: Session | null;
  requestId: string;
  clientKey: string;
}

export const requestStorage = new AsyncLocalStorage<RequestStoreContext>();

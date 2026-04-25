import { AsyncLocalStorage } from "async_hooks";

export interface LogContext {
  ip: string;
  userId: string;
}

export const logContext = new AsyncLocalStorage<LogContext>();

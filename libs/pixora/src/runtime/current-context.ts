import type { ApplicationContext } from '../app/types';

const contextStack: ApplicationContext[] = [];

export function getCurrentApplicationContext(): ApplicationContext {
  const context = contextStack[contextStack.length - 1];

  if (!context) {
    throw new Error('Pixora composed components can only be created while rendering a scene or reactive subtree.');
  }

  return context;
}

export function withApplicationContext<T>(context: ApplicationContext, run: () => T): T {
  contextStack.push(context);

  try {
    return run();
  } finally {
    contextStack.pop();
  }
}

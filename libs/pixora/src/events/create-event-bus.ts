import type { Disposable } from '../utils/disposable';

export type EventMap = Record<string, unknown>;

export type EventBus<Events extends EventMap> = {
  clear(): void;
  emit<Key extends keyof Events>(event: Key, payload: Events[Key]): void;
  on<Key extends keyof Events>(event: Key, handler: (payload: Events[Key]) => void): Disposable;
  once<Key extends keyof Events>(event: Key, handler: (payload: Events[Key]) => void): Disposable;
};

export function createEventBus<Events extends EventMap>(): EventBus<Events> {
  const handlers = new Map<keyof Events, Set<(payload: Events[keyof Events]) => void>>();

  return {
    clear() {
      handlers.clear();
    },
    emit(event, payload) {
      const bucket = handlers.get(event);

      if (!bucket) {
        return;
      }

      for (const handler of bucket) {
        handler(payload);
      }
    },
    on(event, handler) {
      const bucket = handlers.get(event) ?? new Set<(payload: Events[keyof Events]) => void>();

      handlers.set(event, bucket);
      bucket.add(handler as (payload: Events[keyof Events]) => void);

      return {
        dispose: () => {
          bucket.delete(handler as (payload: Events[keyof Events]) => void);

          if (bucket.size === 0) {
            handlers.delete(event);
          }
        },
      };
    },
    once(event, handler) {
      const subscription = this.on(event, (payload) => {
        subscription.dispose();
        handler(payload);
      });

      return subscription;
    },
  };
}

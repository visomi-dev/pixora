import type { ApplicationContext } from '../app/types';

export type ServiceToken<T> = symbol & {
  readonly __type__?: T;
};

export type ServiceDescriptor<T = unknown> = {
  create: (context: ApplicationContext) => T;
  destroy?: (service: T) => Promise<void> | void;
  token: ServiceToken<T>;
};

export type ServiceRegistry = {
  destroy(): Promise<void>;
  get<T>(token: ServiceToken<T>): T;
  has(token: ServiceToken<unknown>): boolean;
  register<T>(descriptor: ServiceDescriptor<T>): T;
};

type ServiceRegistryWithContext = ServiceRegistry & {
  setContext(context: ApplicationContext): void;
};

type ServiceRecord = {
  destroy?: (service: unknown) => Promise<void> | void;
  value: unknown;
};

export function createServiceRegistry(): ServiceRegistry {
  const records = new Map<ServiceToken<unknown>, ServiceRecord>();
  let context: ApplicationContext | null = null;

  const registry: ServiceRegistryWithContext = {
    async destroy() {
      for (const [token, record] of Array.from(records.entries()).reverse()) {
        await record.destroy?.(record.value);
        records.delete(token);
      }
    },
    get(token) {
      const record = records.get(token);

      if (!record) {
        throw new Error(`Service is not registered: ${String(token.description ?? token.toString())}`);
      }

      return record.value as typeof token extends ServiceToken<infer Value> ? Value : never;
    },
    has(token) {
      return records.has(token);
    },
    register(descriptor) {
      if (records.has(descriptor.token)) {
        throw new Error(
          `Duplicate service token: ${String(descriptor.token.description ?? descriptor.token.toString())}`,
        );
      }

      if (!context) {
        throw new Error('Service registry context has not been initialized.');
      }

      const value = descriptor.create(context);

      records.set(descriptor.token, {
        destroy: descriptor.destroy as ServiceRecord['destroy'],
        value,
      });

      return value;
    },
    setContext(nextContext) {
      context = nextContext;
    },
  };

  return registry;
}

export function createServiceToken<T>(name: string): ServiceToken<T> {
  return Symbol(name) as ServiceToken<T>;
}

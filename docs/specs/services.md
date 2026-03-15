# Services Spec

## Goal

Provide a small typed registry for long-lived reusable logic.

## Responsibilities

- register services by typed token;
- create services during app startup;
- resolve services from scenes and framework modules;
- dispose services during app shutdown.

## Service model

```ts
type ServiceToken<T> = symbol & { __type?: T };

type ServiceDescriptor<T = unknown> = {
  token: ServiceToken<T>;
  create: (context: ApplicationContext) => T;
  destroy?: (service: T) => void | Promise<void>;
};
```

## Registry API

```ts
type ServiceRegistry = {
  register<T>(descriptor: ServiceDescriptor<T>): void;
  get<T>(token: ServiceToken<T>): T;
  has(token: ServiceToken<unknown>): boolean;
  destroy(): Promise<void>;
};

declare function createServiceRegistry(): ServiceRegistry;
declare function createServiceToken<T>(name: string): ServiceToken<T>;
```

## Rules

- duplicate tokens are errors;
- required services must fail fast when missing;
- services should prefer framework-owned context over hidden globals;
- services should not mutate unrelated scene internals directly.

## MVP deliverables

- typed token creation;
- service registration at app startup;
- service resolution from scenes;
- clean app-wide disposal.

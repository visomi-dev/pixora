import type { ApplicationContext } from '../app/types';

import { createServiceRegistry, createServiceToken } from './create-service-registry';

function createMockContext(): ApplicationContext {
  return {
    app: {} as ApplicationContext['app'],
    assets: {} as ApplicationContext['assets'],
    events: {} as ApplicationContext['events'],
    mount: {
      getBoundingClientRect: () => ({ width: 800, height: 600, x: 0, y: 0, left: 0, top: 0, right: 800, bottom: 600 }),
    } as unknown as HTMLElement,
    scenes: {} as ApplicationContext['scenes'],
    services: {} as ApplicationContext['services'],
    viewport: {
      get: () => ({ width: 800, height: 600, aspectRatio: 4 / 3, orientation: 'landscape' as const }),
    } as ApplicationContext['viewport'],
  } as ApplicationContext;
}

describe('createServiceRegistry', () => {
  it('creates a registry', () => {
    const registry = createServiceRegistry();
    expect(registry).toBeDefined();
  });

  it('reports unregistered tokens as absent', () => {
    const registry = createServiceRegistry();
    const token = createServiceToken<unknown>('test');
    expect(registry.has(token)).toBe(false);
  });

  it('registers and retrieves a service', () => {
    const registry = createServiceRegistry();
    const token = createServiceToken<{ value: number }>('counter');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (registry as any).setContext(createMockContext());

    const service = registry.register({
      create: () => ({ value: 42 }),
      token,
    });

    expect(registry.has(token)).toBe(true);
    expect(registry.get(token).value).toBe(42);
    expect(service.value).toBe(42);
  });

  it('throws when registering duplicate token', () => {
    const registry = createServiceRegistry();
    const token = createServiceToken<unknown>('dup');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (registry as any).setContext(createMockContext());

    registry.register({ create: () => ({}), token });

    expect(() => registry.register({ create: () => ({}), token })).toThrow(/Duplicate service token/);
  });

  it('throws when getting unregistered token', () => {
    const registry = createServiceRegistry();
    const token = createServiceToken<unknown>('nonexistent');

    expect(() => registry.get(token)).toThrow(/Service is not registered/);
  });

  it('destroys services in reverse order', () => {
    const registry = createServiceRegistry();
    const token1 = createServiceToken<{ name: string }>('s1');
    const token2 = createServiceToken<{ name: string }>('s2');
    const destroyOrder: string[] = [];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (registry as any).setContext(createMockContext());
    registry.register({ create: () => ({ name: 's1' }), token: token1 });
    registry.register({
      create: () => ({ name: 's2' }),
      destroy: (s) => {
        destroyOrder.push(s.name);
      },
      token: token2,
    });

    registry.destroy();

    expect(destroyOrder).toEqual(['s2']);
  });

  it('destroys all services', async () => {
    const registry = createServiceRegistry();
    const token1 = createServiceToken<unknown>('s1');
    const token2 = createServiceToken<unknown>('s2');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (registry as any).setContext(createMockContext());

    registry.register({ create: () => ({}), token: token1 });
    registry.register({ create: () => ({}), token: token2 });

    await registry.destroy();

    expect(registry.has(token1)).toBe(false);
    expect(registry.has(token2)).toBe(false);
  });

  it('throws when registering without context', () => {
    const registry = createServiceRegistry();
    const token = createServiceToken<unknown>('no-context');

    expect(() => registry.register({ create: () => ({}), token })).toThrow(/context has not been initialized/);
  });

  it('accepts async destroy', async () => {
    const registry = createServiceRegistry();
    const token = createServiceToken<unknown>('async-destroy');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (registry as any).setContext(createMockContext());

    registry.register({
      create: () => ({}),
      destroy: vi.fn().mockResolvedValue(undefined),
      token,
    });

    await registry.destroy();
    expect(registry.has(token)).toBe(false);
  });
});

describe('createServiceToken', () => {
  it('creates a unique symbol token', () => {
    const token1 = createServiceToken<number>('count');
    const token2 = createServiceToken<number>('count');

    expect(typeof token1).toBe('symbol');
    expect(token1).not.toBe(token2);
  });

  it('includes name in description', () => {
    const token = createServiceToken<{ foo: string }>('my-service');

    expect(token.description).toBe('my-service');
  });
});

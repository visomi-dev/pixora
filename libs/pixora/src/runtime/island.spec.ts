import { ContainerNode } from '../components/container-node';

import { island } from './island';
import { IMPERATIVE_MARKER } from './types';

import type { IslandSetupContext } from './island';
import type { ApplicationContext } from '../app/types';

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

describe('island', () => {
  it('creates an imperative PixoraNode', () => {
    const node = island({
      context: createMockContext(),
      setup: vi.fn(),
    });

    expect(node.type).toBe(IMPERATIVE_MARKER);
    expect(node.children).toEqual([]);
    expect(node.props).toHaveProperty('managed', true);
    expect(node.props).toHaveProperty('node');
  });

  it('creates island with a key', () => {
    const node = island({
      context: createMockContext(),
      key: 'my-island',
      setup: vi.fn(),
    });

    expect(node.key).toBe('my-island');
  });

  it('passes context and root to setup', () => {
    let receivedContext: ApplicationContext | null = null;
    let receivedRoot: ContainerNode | null = null;

    const ctx = createMockContext();
    island({
      context: ctx,
      setup: (args: IslandSetupContext) => {
        receivedContext = args.context;
        receivedRoot = args.root;
      },
    });

    expect(receivedContext).toBe(ctx);
    expect(receivedRoot).toBeInstanceOf(ContainerNode);
  });

  it('disposes a function cleanup', () => {
    const disposeFn = vi.fn();
    const node = island({
      context: createMockContext(),
      setup: () => disposeFn,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const containerNode = (node.props as any).node as ContainerNode;
    containerNode.dispose();

    expect(disposeFn).toHaveBeenCalled();
  });

  it('disposes a Disposable cleanup', () => {
    const disposeFn = vi.fn();
    const node = island({
      context: createMockContext(),
      setup: () => ({ dispose: disposeFn }),
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const containerNode = (node.props as any).node as ContainerNode;
    containerNode.dispose();

    expect(disposeFn).toHaveBeenCalled();
  });

  it('handles void cleanup', () => {
    const node = island({
      context: createMockContext(),
      setup: vi.fn(),
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const containerNode = (node.props as any).node as ContainerNode;
    expect(() => containerNode.dispose()).not.toThrow();
  });

  it('freezes the returned node', () => {
    const node = island({
      context: createMockContext(),
      setup: vi.fn(),
    });

    expect(Object.isFrozen(node)).toBe(true);
    expect(Object.isFrozen(node.children)).toBe(true);
  });
});

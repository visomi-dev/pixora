import { createViewportManager } from './create-viewport-manager';

function mockDOMRect(width: number, height: number): DOMRect {
  return {
    width,
    height,
    x: 0,
    y: 0,
    left: 0,
    top: 0,
    right: width,
    bottom: height,
    toJSON: () => ({ width, height, x: 0, y: 0, left: 0, top: 0, right: width, bottom: height }),
  };
}

function makeMount(clientWidth: number, clientHeight: number, rectWidth: number, rectHeight: number) {
  return {
    clientWidth,
    clientHeight,
    getBoundingClientRect: () => mockDOMRect(rectWidth, rectHeight),
  } as unknown as HTMLElement;
}

describe('createViewportManager', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('creates a viewport signal with initial dimensions', () => {
    const mount = makeMount(800, 600, 800, 600);
    const manager = createViewportManager({ mount });

    expect(manager.viewport.get().width).toBe(800);
    expect(manager.viewport.get().height).toBe(600);
    expect(manager.viewport.get().aspectRatio).toBeCloseTo(800 / 600);
    expect(manager.viewport.get().orientation).toBe('landscape');

    manager.destroy();
  });

  it('prefers explicit width and height over mount dimensions', () => {
    const mount = makeMount(800, 600, 800, 600);
    const manager = createViewportManager({ mount, width: 1920, height: 1080 });

    expect(manager.viewport.get().width).toBe(1920);
    expect(manager.viewport.get().height).toBe(1080);

    manager.destroy();
  });

  it('refresh updates the viewport signal', () => {
    const mount = makeMount(800, 600, 800, 600);
    const manager = createViewportManager({ mount });

    expect(manager.viewport.get().width).toBe(800);

    manager.refresh();

    expect(manager.viewport.get().width).toBe(800);

    manager.destroy();
  });

  it('detects portrait orientation', () => {
    const mount = makeMount(600, 800, 600, 800);
    const manager = createViewportManager({ mount });

    expect(manager.viewport.get().orientation).toBe('portrait');

    manager.destroy();
  });

  it('handles missing ResizeObserver gracefully', () => {
    const mount = makeMount(800, 600, 800, 600);

    const originalResizeObserver = globalThis.ResizeObserver;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (globalThis as any).ResizeObserver;

    const manager = createViewportManager({ mount });
    expect(manager.viewport.get().width).toBe(800);

    manager.destroy();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (globalThis as any).ResizeObserver = originalResizeObserver;
  });

  it('uses fallback width and height when getBoundingClientRect returns 0', () => {
    const mount = makeMount(0, 0, 0, 0);
    const manager = createViewportManager({ mount });

    expect(manager.viewport.get().width).toBeGreaterThan(0);
    expect(manager.viewport.get().height).toBeGreaterThan(0);

    manager.destroy();
  });

  it('destroy does not throw', () => {
    const mount = makeMount(800, 600, 800, 600);
    const manager = createViewportManager({ mount });

    expect(() => manager.destroy()).not.toThrow();
  });
});

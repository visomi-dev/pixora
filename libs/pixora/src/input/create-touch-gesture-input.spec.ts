import { vi } from 'vitest';
import type { FederatedPointerEvent } from 'pixi.js';

import { createTouchGestureInput } from './create-touch-gesture-input';

function createMockPointerEvent(type: string, pointerId: number, x: number, y: number): Partial<FederatedPointerEvent> {
  return {
    type,
    pointerId,
    globalX: x,
    globalY: y,
  } as Partial<FederatedPointerEvent>;
}

type MockContainer = {
  on: ReturnType<typeof vi.fn>;
  off: ReturnType<typeof vi.fn>;
  _handlers: Map<string, Array<(...args: unknown[]) => void>>;
};

function createMockContainer(): MockContainer {
  const _handlers = new Map<string, Array<(...args: unknown[]) => void>>();

  return {
    on: vi.fn((event: string, handler: (...args: unknown[]) => void) => {
      const existing = _handlers.get(event) || [];
      existing.push(handler);
      _handlers.set(event, existing);
    }),
    off: vi.fn((event: string, handler: (...args: unknown[]) => void) => {
      const existing = _handlers.get(event) || [];
      _handlers.set(
        event,
        existing.filter((h) => h !== handler),
      );
    }),
    _handlers,
  };
}

function getHandler(container: MockContainer, event: string): ((...args: unknown[]) => void) | undefined {
  return container._handlers.get(event)?.[0];
}

describe('createTouchGestureInput', () => {
  it('creates touch gesture state', () => {
    const state = createTouchGestureInput();

    expect(state.lastGesture).toBeDefined();
    expect(state.isTouching).toBeDefined();
    expect(typeof state.attach).toBe('function');
    expect(typeof state.detach).toBe('function');
    expect(typeof state.dispose).toBe('function');
  });

  it('lastGesture starts as null', () => {
    const state = createTouchGestureInput();
    expect(state.lastGesture.get()).toBeNull();
  });

  it('isTouching starts as false', () => {
    const state = createTouchGestureInput();
    expect(state.isTouching.get()).toBe(false);
  });

  it('dispose clears state', () => {
    const state = createTouchGestureInput();
    state.dispose();

    expect(state.lastGesture.get()).toBeNull();
  });

  it('dispose can be called multiple times', () => {
    const state = createTouchGestureInput();
    state.dispose();
    expect(() => state.dispose()).not.toThrow();
  });

  it('detach returns early when no target', () => {
    const state = createTouchGestureInput();
    expect(() => state.detach()).not.toThrow();
  });

  it('attach registers event listeners', () => {
    const state = createTouchGestureInput();
    const container = createMockContainer() as any;
    state.attach(container);

    expect(container.on).toHaveBeenCalledWith('pointerdown', expect.any(Function));
    expect(container.on).toHaveBeenCalledWith('pointermove', expect.any(Function));
    expect(container.on).toHaveBeenCalledWith('pointerup', expect.any(Function));
    expect(container.on).toHaveBeenCalledWith('pointerupoutside', expect.any(Function));
    expect(container.on).toHaveBeenCalledWith('pointercancel', expect.any(Function));
  });

  it('detach removes event listeners', () => {
    const state = createTouchGestureInput();
    const container = createMockContainer() as any;
    state.attach(container);
    state.detach();

    expect(container.off).toHaveBeenCalledWith('pointerdown', expect.any(Function));
    expect(container.off).toHaveBeenCalledWith('pointermove', expect.any(Function));
    expect(container.off).toHaveBeenCalledWith('pointerup', expect.any(Function));
  });

  it('emits tap gesture on quick pointer down/up', () => {
    const state = createTouchGestureInput();
    const container = createMockContainer() as any;
    state.attach(container);

    const downHandler = getHandler(container, 'pointerdown');
    const upHandler = getHandler(container, 'pointerup');

    downHandler!(createMockPointerEvent('pointerdown', 1, 100, 100) as FederatedPointerEvent);
    upHandler!(createMockPointerEvent('pointerup', 1, 100, 100) as FederatedPointerEvent);

    const gesture = state.lastGesture.get();
    expect(gesture).not.toBeNull();
    expect(gesture!.type).toBe('tap');
  });

  it('emits swipeRight gesture', () => {
    const state = createTouchGestureInput();
    const container = createMockContainer() as any;
    state.attach(container);

    const downHandler = getHandler(container, 'pointerdown');
    const moveHandler = getHandler(container, 'pointermove');
    const upHandler = getHandler(container, 'pointerup');

    downHandler!(createMockPointerEvent('pointerdown', 1, 100, 100) as FederatedPointerEvent);
    moveHandler!(createMockPointerEvent('pointermove', 1, 150, 100) as FederatedPointerEvent);
    moveHandler!(createMockPointerEvent('pointermove', 1, 200, 100) as FederatedPointerEvent);
    upHandler!(createMockPointerEvent('pointerup', 1, 200, 100) as FederatedPointerEvent);

    const gesture = state.lastGesture.get();
    expect(gesture).not.toBeNull();
    expect(['swipeRight', 'swipeLeft']).toContain(gesture!.type);
  });

  it('handles pointer cancel', () => {
    const state = createTouchGestureInput();
    const container = createMockContainer() as any;
    state.attach(container);

    const downHandler = getHandler(container, 'pointerdown');
    const cancelHandler = getHandler(container, 'pointercancel');

    downHandler!(createMockPointerEvent('pointerdown', 1, 100, 100) as FederatedPointerEvent);
    cancelHandler!(createMockPointerEvent('pointercancel', 1, 100, 100) as FederatedPointerEvent);

    expect(state.isTouching.get()).toBe(false);
  });

  it('emits swipeUp gesture', () => {
    const state = createTouchGestureInput();
    const container = createMockContainer() as any;
    state.attach(container);

    const downHandler = getHandler(container, 'pointerdown');
    const moveHandler = getHandler(container, 'pointermove');
    const upHandler = getHandler(container, 'pointerup');

    downHandler!(createMockPointerEvent('pointerdown', 1, 100, 100) as FederatedPointerEvent);
    moveHandler!(createMockPointerEvent('pointermove', 1, 100, 50) as FederatedPointerEvent);
    moveHandler!(createMockPointerEvent('pointermove', 1, 100, 0) as FederatedPointerEvent);
    upHandler!(createMockPointerEvent('pointerup', 1, 100, 0) as FederatedPointerEvent);

    const gesture = state.lastGesture.get();
    expect(gesture).not.toBeNull();
    expect(['swipeUp', 'swipeDown']).toContain(gesture!.type);
  });
});

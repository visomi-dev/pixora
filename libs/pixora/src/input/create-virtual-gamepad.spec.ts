import { createVirtualGamepad } from './create-virtual-gamepad';

describe('createVirtualGamepad', () => {
  function makeMockParent() {
    const addChild = vi.fn();
    const removeChild = vi.fn();
    const parent = {
      width: 400,
      height: 400,
      addChild,
      removeChild,
    } as unknown as import('pixi.js').Container;
    return { parent, addChild, removeChild };
  }

  it('creates a virtual gamepad state', () => {
    const { parent } = makeMockParent();
    const state = createVirtualGamepad({ parent });

    expect(state.direction).toBeDefined();
    expect(state.buttonsPressed).toBeDefined();
    expect(state.container).toBeDefined();
    expect(typeof state.dispose).toBe('function');
  });

  it('starts with zero direction', () => {
    const { parent } = makeMockParent();
    const state = createVirtualGamepad({ parent });

    const dir = state.direction.get();
    expect(dir.x).toBe(0);
    expect(dir.y).toBe(0);
    expect(dir.magnitude).toBe(0);
  });

  it('buttonsPressed starts empty', () => {
    const { parent } = makeMockParent();
    const state = createVirtualGamepad({ parent });

    expect(state.buttonsPressed.get().size).toBe(0);
  });

  it('dispose calls removeChild on parent', () => {
    const { parent, removeChild } = makeMockParent();
    const state = createVirtualGamepad({ parent });

    state.dispose();

    expect(removeChild).toHaveBeenCalled();
  });

  it('dispose is idempotent', () => {
    const { parent } = makeMockParent();
    const state = createVirtualGamepad({ parent });

    state.dispose();
    expect(() => state.dispose()).not.toThrow();
  });

  it('accepts custom joystick and button sizes', () => {
    const { parent } = makeMockParent();
    const state = createVirtualGamepad({
      parent,
      joystickSize: 100,
      buttonSize: 60,
    });

    expect(state.direction).toBeDefined();
    state.dispose();
  });

  it('accepts custom position', () => {
    const { parent } = makeMockParent();
    const state = createVirtualGamepad({
      parent,
      position: { x: 50, y: 50 },
    });

    expect(state.direction).toBeDefined();
    state.dispose();
  });

  it('has direction and buttonsPressed signals with readonly interface', () => {
    const { parent } = makeMockParent();
    const state = createVirtualGamepad({ parent });

    expect(typeof state.direction.get).toBe('function');
    expect(typeof state.direction.subscribe).toBe('function');
    expect(typeof state.buttonsPressed.get).toBe('function');
    expect(typeof state.buttonsPressed.subscribe).toBe('function');

    state.dispose();
  });

  it('direction has angle property', () => {
    const { parent } = makeMockParent();
    const state = createVirtualGamepad({ parent });

    const dir = state.direction.get();
    expect(typeof dir.angle).toBe('number');

    state.dispose();
  });
});

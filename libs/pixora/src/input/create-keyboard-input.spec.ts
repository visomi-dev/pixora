import { vi } from 'vitest';

import { createKeyboardInput, clearKeyboardFrame, Keys } from './create-keyboard-input';

describe('createKeyboardInput', () => {
  const originalWindow = global.window;

  beforeEach(() => {
    vi.stubGlobal('window', {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });
  });

  afterEach(() => {
    vi.stubGlobal('window', originalWindow);
  });

  it('Keys constant has expected values', () => {
    expect(Keys.ArrowLeft).toBe('ArrowLeft');
    expect(Keys.ArrowRight).toBe('ArrowRight');
    expect(Keys.ArrowUp).toBe('ArrowUp');
    expect(Keys.ArrowDown).toBe('ArrowDown');
    expect(Keys.Space).toBe('Space');
    expect(Keys.Escape).toBe('Escape');
    expect(Keys.Enter).toBe('Enter');
  });

  it('clearKeyboardFrame does not throw', () => {
    expect(() => clearKeyboardFrame()).not.toThrow();
  });

  it('initializes keyboard input and adds event listeners', () => {
    const state = createKeyboardInput();

    expect(state.keys).toBeDefined();
    expect(state.keysPressed).toBeDefined();
    expect(state.keysReleased).toBeDefined();
    expect(window.addEventListener).toHaveBeenCalledWith('keydown', expect.any(Function));
    expect(window.addEventListener).toHaveBeenCalledWith('keyup', expect.any(Function));
  });

  it('returns signals with get and subscribe methods', () => {
    const state = createKeyboardInput();

    expect(typeof state.keys.get).toBe('function');
    expect(typeof state.keysPressed.get).toBe('function');
    expect(typeof state.keysReleased.get).toBe('function');
    expect(typeof state.keys.subscribe).toBe('function');
  });

  it('clearKeyboardFrame clears pressed and released signals', () => {
    const state = createKeyboardInput();

    clearKeyboardFrame();

    expect(state.keysPressed.get()).toEqual({});
    expect(state.keysReleased.get()).toEqual({});
  });

  it('keys signal returns current key state', () => {
    const state = createKeyboardInput();

    expect(state.keys.get()).toBeDefined();
    expect(typeof state.keys.get()).toBe('object');
  });
});

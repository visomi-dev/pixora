import { signal } from '../state/signal';

import type { ReadonlySignal } from '../state/signal';

export type KeyboardState = {
  readonly keys: ReadonlySignal<Record<string, boolean>>;
  readonly keysPressed: ReadonlySignal<Record<string, boolean>>;
  readonly keysReleased: ReadonlySignal<Record<string, boolean>>;
};

const keys = signal<Record<string, boolean>>({});
const keysPressed = signal<Record<string, boolean>>({});
const keysReleased = signal<Record<string, boolean>>({});

let initialized = false;

function handleKeyDown(event: KeyboardEvent): void {
  if (event.repeat) {
    return;
  }

  keys.update((k) => ({ ...k, [event.code]: true }));
  keysPressed.update((k) => ({ ...k, [event.code]: true }));
}

function handleKeyUp(event: KeyboardEvent): void {
  keys.update((k) => ({ ...k, [event.code]: false }));
  keysReleased.update((k) => ({ ...k, [event.code]: true }));
}

function clearFrameState(): void {
  keysPressed.set({});
  keysReleased.set({});
}

export function createKeyboardInput(): KeyboardState {
  if (!initialized) {
    initialized = true;
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
  }

  return {
    keys: keys.asReadonly(),
    keysPressed: keysPressed.asReadonly(),
    keysReleased: keysReleased.asReadonly(),
  };
}

export function clearKeyboardFrame(): void {
  clearFrameState();
}

export const Keys = {
  ArrowLeft: 'ArrowLeft',
  ArrowRight: 'ArrowRight',
  ArrowUp: 'ArrowUp',
  ArrowDown: 'ArrowDown',
  Space: 'Space',
  Escape: 'Escape',
  Enter: 'Enter',
} as const;

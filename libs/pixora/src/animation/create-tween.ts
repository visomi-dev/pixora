import type { Disposable } from '../utils/disposable';

export type TweenOptions = {
  delayMs?: number;
  durationMs: number;
  easing?: 'ease-in' | 'ease-out' | 'ease-in-out' | 'linear';
  from: number;
  onComplete?: () => void;
  onUpdate: (value: number) => void;
  to: number;
};

export type TransitionOptions = {
  delayMs?: number;
  durationMs: number;
  easing?: 'ease-in' | 'ease-out' | 'ease-in-out' | 'linear';
  from?: number;
  onComplete?: () => void;
  onUpdate: (value: number) => void;
  to?: number;
};

export type Tween = Disposable;

export function createTween(options: TweenOptions): Tween {
  let disposed = false;
  let frameHandle: number | ReturnType<typeof setTimeout> | undefined;
  let startTime: number | undefined;

  const tick = (timestamp: number) => {
    if (disposed) {
      return;
    }

    if (startTime === undefined) {
      startTime = timestamp + (options.delayMs ?? 0);
    }

    if (timestamp < startTime) {
      frameHandle = requestFrame(tick);

      return;
    }

    const durationMs = Math.max(1, options.durationMs);
    const progress = Math.min(1, (timestamp - startTime) / durationMs);
    const easedProgress = applyEasing(options.easing ?? 'linear', progress);
    const value = options.from + (options.to - options.from) * easedProgress;

    options.onUpdate(value);

    if (progress >= 1) {
      options.onComplete?.();

      return;
    }

    frameHandle = requestFrame(tick);
  };

  frameHandle = requestFrame(tick);

  return {
    dispose() {
      if (disposed) {
        return;
      }

      disposed = true;

      if (frameHandle !== undefined) {
        cancelFrame(frameHandle);
      }
    },
  };
}

export function createTransition(options: TransitionOptions): Tween {
  return createTween({
    delayMs: options.delayMs,
    durationMs: options.durationMs,
    easing: options.easing,
    from: options.from ?? 0,
    onComplete: options.onComplete,
    onUpdate: options.onUpdate,
    to: options.to ?? 1,
  });
}

function applyEasing(easing: NonNullable<TweenOptions['easing']>, progress: number): number {
  switch (easing) {
    case 'ease-in':
      return progress * progress;
    case 'ease-in-out':
      return progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2;
    case 'ease-out':
      return 1 - (1 - progress) * (1 - progress);
    case 'linear':
    default:
      return progress;
  }
}

function cancelFrame(handle: number | ReturnType<typeof setTimeout>): void {
  if (typeof globalThis.cancelAnimationFrame === 'function' && typeof handle === 'number') {
    globalThis.cancelAnimationFrame(handle);

    return;
  }

  clearTimeout(handle);
}

function now(): number {
  if (typeof globalThis.performance?.now === 'function') {
    return globalThis.performance.now();
  }

  return Date.now();
}

function requestFrame(callback: (timestamp: number) => void): number | ReturnType<typeof setTimeout> {
  if (typeof globalThis.requestAnimationFrame === 'function') {
    return globalThis.requestAnimationFrame(callback);
  }

  return setTimeout(() => {
    callback(now());
  }, 16);
}

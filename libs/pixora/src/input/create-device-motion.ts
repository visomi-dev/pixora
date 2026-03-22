import { signal } from '../state/signal';

import type { ReadonlySignal } from '../state/signal';

export type DeviceMotionState = {
  readonly acceleration: ReadonlySignal<Acceleration | null>;
  readonly accelerationIncludingGravity: ReadonlySignal<Acceleration | null>;
  readonly rotationRate: ReadonlySignal<RotationRate | null>;
  readonly orientation: ReadonlySignal<Orientation | null>;
  readonly isSupported: boolean;
  readonly isActive: ReadonlySignal<boolean>;
  readonly start: () => boolean;
  readonly stop: () => void;
  readonly dispose: () => void;
};

export type Acceleration = {
  x: number;
  y: number;
  z: number;
};

export type RotationRate = {
  alpha: number;
  beta: number;
  gamma: number;
};

export type Orientation = {
  alpha: number;
  beta: number;
  gamma: number;
};

type DeviceMotionEvent = {
  acceleration: Acceleration | null;
  accelerationIncludingGravity: Acceleration | null;
  rotationRate: RotationRate | null;
};

type DeviceOrientationEvent = {
  alpha: number;
  beta: number;
  gamma: number;
};

export function createDeviceMotion(): DeviceMotionState {
  const acceleration = signal<Acceleration | null>(null);
  const accelerationIncludingGravity = signal<Acceleration | null>(null);
  const rotationRate = signal<RotationRate | null>(null);
  const orientation = signal<Orientation | null>(null);
  const isActive = signal<boolean>(false);

  const isSupported = typeof window !== 'undefined' && ('DeviceMotionEvent' in window || 'MozMotion' in window);

  let permissionGranted = false;

  async function requestPermission(): Promise<boolean> {
    if (typeof window === 'undefined') {
      return false;
    }

    const deviceMotionEvent = window.DeviceMotionEvent as unknown as {
      requestPermission?: () => Promise<string>;
    };

    if (typeof deviceMotionEvent?.requestPermission === 'function') {
      try {
        const permission = await deviceMotionEvent.requestPermission();
        permissionGranted = permission === 'granted';
        return permissionGranted;
      } catch {
        permissionGranted = false;
        return false;
      }
    }

    permissionGranted = true;
    return true;
  }

  function handleMotion(event: DeviceMotionEvent): void {
    if (event.acceleration) {
      acceleration.set({ ...event.acceleration });
    }
    if (event.accelerationIncludingGravity) {
      accelerationIncludingGravity.set({ ...event.accelerationIncludingGravity });
    }
    if (event.rotationRate) {
      rotationRate.set({ ...event.rotationRate });
    }
  }

  function handleOrientation(event: DeviceOrientationEvent): void {
    orientation.set({
      alpha: event.alpha,
      beta: event.beta,
      gamma: event.gamma,
    });
  }

  function start(): boolean {
    if (!isSupported) {
      return false;
    }

    if (!permissionGranted) {
      requestPermission().then((granted) => {
        if (granted) {
          enableListeners();
        }
      });
      return true;
    }

    enableListeners();
    return true;
  }

  function enableListeners(): void {
    if (typeof window !== 'undefined') {
      window.addEventListener('devicemotion', handleMotion as unknown as EventListener);
      window.addEventListener('deviceorientation', handleOrientation as unknown as EventListener);
      isActive.set(true);
    }
  }

  function stop(): void {
    if (typeof window !== 'undefined') {
      window.removeEventListener('devicemotion', handleMotion as unknown as EventListener);
      window.removeEventListener('deviceorientation', handleOrientation as unknown as EventListener);
      isActive.set(false);
    }
  }

  return {
    acceleration: acceleration.asReadonly(),
    accelerationIncludingGravity: accelerationIncludingGravity.asReadonly(),
    rotationRate: rotationRate.asReadonly(),
    orientation: orientation.asReadonly(),
    isSupported,
    isActive: isActive.asReadonly(),
    start,
    stop,
    dispose() {
      stop();
    },
  };
}

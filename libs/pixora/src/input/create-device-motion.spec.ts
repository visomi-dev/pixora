import { vi } from 'vitest';

import { createDeviceMotion } from './create-device-motion';

describe('createDeviceMotion', () => {
  const originalWindow = global.window;

  afterEach(() => {
    Object.defineProperty(global, 'window', {
      value: originalWindow,
      writable: true,
      configurable: true,
    });
  });

  describe('environment detection', () => {
    it('reports isSupported as false when window is undefined', () => {
      Object.defineProperty(global, 'window', {
        value: undefined,
        writable: true,
        configurable: true,
      });
      const state = createDeviceMotion();
      expect(state.isSupported).toBe(false);
    });

    it('reports isSupported as false when DeviceMotionEvent not in window', () => {
      Object.defineProperty(global, 'window', {
        value: {},
        writable: true,
        configurable: true,
      });
      const state = createDeviceMotion();
      expect(state.isSupported).toBe(false);
    });

    it('reports isSupported as true when DeviceMotionEvent exists', () => {
      Object.defineProperty(global, 'window', {
        value: { DeviceMotionEvent: {} },
        writable: true,
        configurable: true,
      });
      const state = createDeviceMotion();
      expect(state.isSupported).toBe(true);
    });

    it('reports isSupported as true when MozMotion exists', () => {
      Object.defineProperty(global, 'window', {
        value: { MozMotion: {} },
        writable: true,
        configurable: true,
      });
      const state = createDeviceMotion();
      expect(state.isSupported).toBe(true);
    });
  });

  describe('signals', () => {
    beforeEach(() => {
      Object.defineProperty(global, 'window', {
        value: {
          DeviceMotionEvent: { requestPermission: vi.fn().mockResolvedValue('granted') },
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
        },
        writable: true,
        configurable: true,
      });
    });

    it('acceleration starts as null', () => {
      const state = createDeviceMotion();
      expect(state.acceleration.get()).toBeNull();
    });

    it('accelerationIncludingGravity starts as null', () => {
      const state = createDeviceMotion();
      expect(state.accelerationIncludingGravity.get()).toBeNull();
    });

    it('rotationRate starts as null', () => {
      const state = createDeviceMotion();
      expect(state.rotationRate.get()).toBeNull();
    });

    it('orientation starts as null', () => {
      const state = createDeviceMotion();
      expect(state.orientation.get()).toBeNull();
    });

    it('isActive starts as false', () => {
      const state = createDeviceMotion();
      expect(state.isActive.get()).toBe(false);
    });
  });

  describe('start', () => {
    it('returns false when not supported', () => {
      Object.defineProperty(global, 'window', {
        value: {},
        writable: true,
        configurable: true,
      });
      const state = createDeviceMotion();
      expect(state.start()).toBe(false);
    });

    it('returns true when supported', () => {
      Object.defineProperty(global, 'window', {
        value: {
          DeviceMotionEvent: { requestPermission: vi.fn().mockResolvedValue('granted') },
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
        },
        writable: true,
        configurable: true,
      });
      const state = createDeviceMotion();
      expect(state.start()).toBe(true);
    });
  });

  describe('stop', () => {
    it('does not throw when window is undefined', () => {
      Object.defineProperty(global, 'window', {
        value: undefined,
        writable: true,
        configurable: true,
      });
      const state = createDeviceMotion();
      expect(() => state.stop()).not.toThrow();
    });
  });

  describe('dispose', () => {
    it('can be called without start', () => {
      Object.defineProperty(global, 'window', {
        value: {
          DeviceMotionEvent: {},
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
        },
        writable: true,
        configurable: true,
      });
      const state = createDeviceMotion();
      expect(() => state.dispose()).not.toThrow();
    });

    it('can be called multiple times', () => {
      Object.defineProperty(global, 'window', {
        value: {
          DeviceMotionEvent: {},
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
        },
        writable: true,
        configurable: true,
      });
      const state = createDeviceMotion();
      state.dispose();
      expect(() => state.dispose()).not.toThrow();
    });
  });
});

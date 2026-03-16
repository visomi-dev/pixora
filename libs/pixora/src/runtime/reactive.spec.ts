import { describe, expect, it } from 'vitest';

import { signal } from '../state/signal';

import { isSignal, unwrapSignal } from './reactive';

describe('reactive', () => {
  describe('isSignal', () => {
    it('returns true for signal objects', () => {
      const testSignal = signal('test');
      expect(isSignal(testSignal)).toBe(true);
    });

    it('returns false for non-signals', () => {
      expect(isSignal('string')).toBe(false);
      expect(isSignal(123)).toBe(false);
      expect(isSignal({})).toBe(false);
      expect(isSignal(null)).toBe(false);
      expect(isSignal(undefined)).toBe(false);
    });

    it('returns false for objects without get/subscribe', () => {
      expect(isSignal({ foo: 'bar' })).toBe(false);
    });
  });

  describe('unwrapSignal', () => {
    it('returns the signal value when given a signal', () => {
      const testSignal = signal('hello');
      expect(unwrapSignal(testSignal)).toBe('hello');
    });

    it('returns the original value when not a signal', () => {
      expect(unwrapSignal('string')).toBe('string');
      expect(unwrapSignal(123)).toBe(123);
      expect(unwrapSignal({ foo: 'bar' })).toEqual({ foo: 'bar' });
    });

    it('handles nested signals', () => {
      const innerSignal = signal('inner');
      const outerSignal = signal(innerSignal);
      expect(unwrapSignal(outerSignal)).toBe(innerSignal);
    });
  });
});

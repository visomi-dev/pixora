import { describe, expect, it, vi } from 'vitest';

import {
  setWarningHandler,
  type WarningHandler,
  warn,
  warnDeprecated,
  warnInvalidChild,
  warnInvalidKey,
  warnInvalidProp,
  warnMissingRequiredProp,
  warnUnknownHostType,
  WarningCode,
} from './warnings';

describe('warnings', () => {
  afterEach(() => {
    setWarningHandler(null as unknown as WarningHandler);
  });

  describe('warn', () => {
    it('calls custom warning handler when set', () => {
      const handler = vi.fn();
      setWarningHandler(handler);

      warn({
        code: WarningCode.INVALID_PROP,
        message: 'Test warning',
      });

      expect(handler).toHaveBeenCalledWith({
        code: WarningCode.INVALID_PROP,
        message: 'Test warning',
      });
    });

    it('logs to console when no handler set', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {
        return;
      });

      warn({
        code: WarningCode.INVALID_PROP,
        message: 'Test warning',
        payload: { foo: 'bar' },
      });

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('warnDeprecated', () => {
    it('emits deprecated API warning', () => {
      const handler = vi.fn();
      setWarningHandler(handler);

      warnDeprecated('Use newApi instead');

      expect(handler).toHaveBeenCalledWith(
        expect.objectContaining({
          code: WarningCode.DEPRECATED_API,
          message: expect.stringContaining('Use newApi instead'),
        }),
      );
    });
  });

  describe('warnInvalidChild', () => {
    it('emits invalid child warning', () => {
      const handler = vi.fn();
      setWarningHandler(handler);

      warnInvalidChild('container', 'invalid', 0);

      expect(handler).toHaveBeenCalledWith({
        code: WarningCode.INVALID_CHILD,
        message: expect.stringContaining('Invalid child type'),
        payload: { parentType: 'container', childType: 'invalid', index: 0 },
      });
    });
  });

  describe('warnInvalidKey', () => {
    it('emits invalid key warning', () => {
      const handler = vi.fn();
      setWarningHandler(handler);

      warnInvalidKey('duplicate');

      expect(handler).toHaveBeenCalledWith({
        code: WarningCode.INVALID_KEY,
        message: expect.stringContaining('duplicate'),
        payload: { key: 'duplicate' },
      });
    });
  });

  describe('warnInvalidProp', () => {
    it('emits invalid prop warning', () => {
      const handler = vi.fn();
      setWarningHandler(handler);

      warnInvalidProp('box', 'unknownProp');

      expect(handler).toHaveBeenCalledWith({
        code: WarningCode.INVALID_PROP,
        message: expect.stringContaining('unknownProp'),
        payload: { hostType: 'box', propName: 'unknownProp' },
      });
    });
  });

  describe('warnMissingRequiredProp', () => {
    it('emits missing required prop warning', () => {
      const handler = vi.fn();
      setWarningHandler(handler);

      warnMissingRequiredProp('button', 'label');

      expect(handler).toHaveBeenCalledWith({
        code: WarningCode.MISSING_REQUIRED_PROP,
        message: expect.stringContaining('label'),
        payload: { hostType: 'button', propName: 'label' },
      });
    });
  });

  describe('warnUnknownHostType', () => {
    it('emits unknown host type warning', () => {
      const handler = vi.fn();
      setWarningHandler(handler);

      warnUnknownHostType('unknown');

      expect(handler).toHaveBeenCalledWith({
        code: WarningCode.UNKNOWN_HOST_TYPE,
        message: expect.stringContaining('unknown'),
        payload: { type: 'unknown' },
      });
    });
  });

  describe('WarningCode', () => {
    it('has correct enum values', () => {
      expect(WarningCode.DEPRECATED_API).toBe('PIXORA_DEPRECATED_API');
      expect(WarningCode.INVALID_CHILD).toBe('PIXORA_INVALID_CHILD');
      expect(WarningCode.INVALID_KEY).toBe('PIXORA_INVALID_KEY');
      expect(WarningCode.INVALID_PROP).toBe('PIXORA_INVALID_PROP');
      expect(WarningCode.MISSING_REQUIRED_PROP).toBe('PIXORA_MISSING_REQUIRED_PROP');
      expect(WarningCode.UNKNOWN_HOST_TYPE).toBe('PIXORA_UNKNOWN_HOST_TYPE');
    });
  });
});

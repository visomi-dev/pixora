import {
  getWarningHandler,
  setWarningHandler,
  validateHostType,
  validateKey,
  validateProps,
  type WarningHandler,
} from './warnings';

describe('getWarningHandler', () => {
  afterEach(() => {
    setWarningHandler(null as unknown as WarningHandler);
  });

  it('returns null by default', () => {
    setWarningHandler(null as unknown as WarningHandler);
    expect(getWarningHandler()).toBeNull();
  });

  it('returns the set handler', () => {
    const handler: WarningHandler = vi.fn();
    setWarningHandler(handler);

    expect(getWarningHandler()).toBe(handler);
  });
});

describe('validateHostType', () => {
  it('returns true for valid host types', () => {
    expect(validateHostType('box')).toBe(true);
    expect(validateHostType('button')).toBe(true);
    expect(validateHostType('container')).toBe(true);
    expect(validateHostType('sprite')).toBe(true);
    expect(validateHostType('text')).toBe(true);
  });

  it('returns false for invalid types', () => {
    expect(validateHostType('unknown')).toBe(false);
    expect(validateHostType('BOX')).toBe(false);
    expect(validateHostType('')).toBe(false);
    expect(validateHostType(123)).toBe(false);
    expect(validateHostType(null)).toBe(false);
    expect(validateHostType(undefined)).toBe(false);
  });
});

describe('validateKey', () => {
  it('returns true for string keys', () => {
    expect(validateKey('my-key')).toBe(true);
    expect(validateKey('')).toBe(true);
  });

  it('returns true for numeric keys', () => {
    expect(validateKey(0)).toBe(true);
    expect(validateKey(123)).toBe(true);
    expect(validateKey(-1)).toBe(true);
  });

  it('returns false for non-string/number keys', () => {
    expect(validateKey(null)).toBe(false);
    expect(validateKey(undefined)).toBe(false);
    expect(validateKey({})).toBe(false);
    expect(validateKey([])).toBe(false);
    expect(validateKey(Symbol('sym'))).toBe(false);
  });
});

describe('validateProps', () => {
  it('returns empty array for valid props', () => {
    const result = validateProps({ x: 10, y: 20 }, 'container');
    expect(result).toEqual([]);
  });

  it('returns empty array for null/undefined props', () => {
    expect(validateProps(null, 'container')).toEqual([]);
    expect(validateProps(undefined, 'container')).toEqual([]);
  });

  it('returns empty array for number props', () => {
    expect(validateProps(123 as unknown, 'container')).toEqual([]);
  });

  it('returns warnings for unknown props on container', () => {
    const result = validateProps({ x: 10, unknownProp: true } as Record<string, unknown>, 'container');
    expect(result).toContain('unknownProp');
  });

  it('returns warnings for unknown props on text', () => {
    const result = validateProps({ text: 'hello', badProp: 1 } as Record<string, unknown>, 'text');
    expect(result).toContain('badProp');
    expect(result).not.toContain('text');
    expect(result).not.toContain('style');
  });

  it('returns warnings for unknown props on sprite', () => {
    const result = validateProps({ texture: 'img.png', unknown: true } as Record<string, unknown>, 'sprite');
    expect(result).toContain('unknown');
  });

  it('returns warnings for unknown props on box', () => {
    const result = validateProps({ width: 100, bad: true } as Record<string, unknown>, 'box');
    expect(result).toContain('bad');
    expect(result).not.toContain('width');
    expect(result).not.toContain('height');
  });

  it('returns warnings for unknown props on button', () => {
    const result = validateProps({ label: 'Click', nope: true } as Record<string, unknown>, 'button');
    expect(result).toContain('nope');
    expect(result).not.toContain('label');
  });

  it('returns warnings for unknown props on unknown type', () => {
    const result = validateProps({ x: 10, unknown: true } as Record<string, unknown>, 'unknown-type');
    expect(result).toContain('unknown');
  });
});

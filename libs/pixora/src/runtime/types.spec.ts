import { isPixoraNode, type PixoraNode } from './types';

describe('isPixoraNode', () => {
  it('returns true for a valid PixoraNode', () => {
    const node: PixoraNode = {
      children: [],
      key: undefined,
      props: {},
      type: 'container',
    };

    expect(isPixoraNode(node)).toBe(true);
  });

  it('returns false for null', () => {
    expect(isPixoraNode(null)).toBe(false);
  });

  it('returns false for undefined', () => {
    expect(isPixoraNode(undefined)).toBe(false);
  });

  it('returns false for a string', () => {
    expect(isPixoraNode('hello')).toBe(false);
  });

  it('returns false for a number', () => {
    expect(isPixoraNode(42)).toBe(false);
  });

  it('returns false for a plain object missing required fields', () => {
    expect(isPixoraNode({ type: 'text' })).toBe(false);
    expect(isPixoraNode({ type: 'text', props: {} })).toBe(false);
    expect(isPixoraNode({ props: {}, children: [] })).toBe(false);
  });

  it('returns true for an object with all required fields', () => {
    expect(isPixoraNode({ type: 'text', props: { content: 'hi' }, children: [] })).toBe(true);
  });
});

import { normalizeChildren } from './normalize';
import type { PixoraNode } from './types';

describe('normalizeChildren', () => {
  it('passes through PixoraNode values as-is', () => {
    const node: PixoraNode = {
      children: [],
      key: undefined,
      props: {},
      type: 'container',
    };

    const result = normalizeChildren([node]);

    expect(result).toHaveLength(1);
    expect(result[0]).toBe(node);
  });

  it('wraps strings as text nodes', () => {
    const result = normalizeChildren(['hello']);

    expect(result).toHaveLength(1);
    expect(result[0].type).toBe('text');
    expect(result[0].props).toEqual({ text: 'hello' });
    expect(result[0].children).toEqual([]);
  });

  it('wraps numbers as text nodes', () => {
    const result = normalizeChildren([42]);

    expect(result).toHaveLength(1);
    expect(result[0].type).toBe('text');
    expect(result[0].props).toEqual({ text: '42' });
  });

  it('filters out booleans', () => {
    const result = normalizeChildren([true, false]);

    expect(result).toHaveLength(0);
  });

  it('filters out null and undefined', () => {
    const result = normalizeChildren([null, undefined]);

    expect(result).toHaveLength(0);
  });

  it('flattens nested arrays', () => {
    const node1: PixoraNode = { children: [], key: undefined, props: { text: 'a' }, type: 'text' };
    const node2: PixoraNode = { children: [], key: undefined, props: { text: 'b' }, type: 'text' };

    const result = normalizeChildren([[node1, [node2, 'c']]]);

    expect(result).toHaveLength(3);
    expect(result[0]).toBe(node1);
    expect(result[1]).toBe(node2);
    expect(result[2].type).toBe('text');
    expect(result[2].props).toEqual({ text: 'c' });
  });

  it('handles mixed children correctly', () => {
    const node: PixoraNode = { children: [], key: undefined, props: {}, type: 'container' };

    const result = normalizeChildren([node, 'text', 42, true, null, undefined, false]);

    expect(result).toHaveLength(3);
    expect(result[0]).toBe(node);
    expect(result[1].type).toBe('text');
    expect(result[1].props).toEqual({ text: 'text' });
    expect(result[2].type).toBe('text');
    expect(result[2].props).toEqual({ text: '42' });
  });

  it('returns an empty array for empty input', () => {
    const result = normalizeChildren([]);

    expect(result).toHaveLength(0);
  });

  it('handles deeply nested arrays', () => {
    const result = normalizeChildren([[['deep']]]);

    expect(result).toHaveLength(1);
    expect(result[0].type).toBe('text');
    expect(result[0].props).toEqual({ text: 'deep' });
  });

  it('silently drops objects that are not PixoraNodes', () => {
    const notANode = { type: 'text' };
    const result = normalizeChildren([notANode as any]);

    expect(result).toHaveLength(0);
  });

  it('silently drops objects missing children property', () => {
    const missingChildren = { type: 'text', props: {} };
    const result = normalizeChildren([missingChildren as any]);

    expect(result).toHaveLength(0);
  });
});

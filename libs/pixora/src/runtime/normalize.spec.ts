import { normalizeChildren } from './normalize';
import { text } from './create-node';

import type { PixoraNode } from './types';

describe('normalizeChildren', () => {
  it('wraps strings and numbers as text nodes', () => {
    const result = normalizeChildren(['hello', 42]);

    expect(result).toHaveLength(2);
    expect(result[0].props).toEqual({ content: 'hello' });
    expect(result[1].props).toEqual({ content: '42' });
  });

  it('flattens nested arrays and keeps pixora nodes', () => {
    const node1: PixoraNode = { children: [], key: undefined, props: { content: 'a' }, type: 'text' };
    const node2 = text({ content: 'b' });

    const result = normalizeChildren([[node1], node2, 'c']);

    expect(result).toHaveLength(3);
    expect(result[2].props).toEqual({ content: 'c' });
  });
});

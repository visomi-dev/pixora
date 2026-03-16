import { ContainerNode } from '../components/container-node';
import { TextNode } from '../components/text-node';

import { imperative } from './compat';
import { IMPERATIVE_MARKER } from './types';

describe('imperative', () => {
  it('wraps a BaseNode as a PixoraNode with the imperative marker', () => {
    const node = new ContainerNode();
    const result = imperative(node);

    expect(result.type).toBe(IMPERATIVE_MARKER);
    expect(result.children).toEqual([]);
  });

  it('stores the original node in props', () => {
    const node = new TextNode({ text: 'test' });
    const result = imperative(node);
    const props = result.props as { node: typeof node };

    expect(props.node).toBe(node);
  });

  it('supports an optional key', () => {
    const node = new ContainerNode();
    const result = imperative(node, 'my-key');

    expect(result.key).toBe('my-key');
  });

  it('supports numeric keys', () => {
    const node = new ContainerNode();
    const result = imperative(node, 42);

    expect(result.key).toBe(42);
  });

  it('produces a frozen object', () => {
    const node = new ContainerNode();
    const result = imperative(node);

    expect(Object.isFrozen(result)).toBe(true);
    expect(Object.isFrozen(result.children)).toBe(true);
  });
});

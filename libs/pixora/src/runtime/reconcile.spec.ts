import { Container } from 'pixi.js';

import { ContainerNode } from '../components/container-node';

import { imperative } from './compat';
import { container } from './create-node';
import { mountTree } from './renderer';
import { updateTree } from './reconcile';

import type { ApplicationContext } from '../app/types';
import type { PixoraNode } from './types';

function createMockContext(): ApplicationContext {
  return {} as ApplicationContext;
}

describe('updateTree', () => {
  it('patches container style props on an existing node', () => {
    const parent = new Container();
    const tree = mountTree(container({ style: { opacity: 0.5 } }), parent, createMockContext());
    const originalHostNode = tree.root.hostNode;

    updateTree(tree, container({ style: { opacity: 1 } }));

    expect(tree.root.hostNode).toBe(originalHostNode);
    expect(tree.root.hostNode.displayObject.alpha).toBe(1);
  });

  it('reorders keyed container children correctly', () => {
    const parent = new Container();
    const tree = mountTree(
      container({
        children: [container({ key: 'a', style: { width: 10 } }), container({ key: 'b', style: { width: 20 } })],
      }),
      parent,
      createMockContext(),
    );

    const first = tree.root.children[0].hostNode;
    const second = tree.root.children[1].hostNode;

    updateTree(
      tree,
      container({
        children: [container({ key: 'b', style: { width: 200 } }), container({ key: 'a', style: { width: 100 } })],
      }),
    );

    expect(tree.root.children[0].hostNode).toBe(second);
    expect(tree.root.children[1].hostNode).toBe(first);
  });

  it('updates deeply nested children', () => {
    const parent = new Container();
    const tree = mountTree(
      container({ children: [container({ children: [container({ key: 'nested' })] })] }),
      parent,
      createMockContext(),
    );

    updateTree(
      tree,
      container({ children: [container({ children: [container({ key: 'nested', style: { opacity: 0.25 } })] })] }),
    );

    expect(tree.root.children[0].children[0].definition.key).toBe('nested');
    expect(tree.root.children[0].children[0].hostNode.displayObject.alpha).toBe(0.25);
  });

  it('handles imperative replacements', () => {
    const parent = new Container();
    const existingNode = new ContainerNode();
    const tree = mountTree(container({ children: [imperative(existingNode)] }), parent, createMockContext());

    updateTree(tree, container({ children: [container({ key: 'replacement' })] }));

    expect(tree.root.children[0].hostNode).toBeInstanceOf(ContainerNode);
    expect(tree.root.children[0].isImperative).toBe(false);
  });

  it('adds many keyed children', () => {
    const parent = new Container();
    const tree = mountTree(container({}), parent, createMockContext());

    const children: PixoraNode<'container'>[] = [];

    for (let i = 0; i < 10; i++) {
      children.push(container({ key: `child-${i}` }));
    }

    updateTree(tree, container({ children }));

    expect(tree.root.children).toHaveLength(10);
  });
});

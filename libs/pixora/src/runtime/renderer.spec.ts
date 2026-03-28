import { Container, Text } from 'pixi.js';

import { ContainerNode } from '../components/container-node';
import { TextNode } from '../components/text-node';

import { imperative } from './compat';
import { container, text } from './create-node';
import { mountTree, unmountTree } from './renderer';

import type { ApplicationContext } from '../app/types';
import type { PixoraNode } from './types';

function createMockContext(): ApplicationContext {
  return {} as ApplicationContext;
}

describe('mountTree', () => {
  it('mounts a single container node', () => {
    const parent = new Container();
    const definition = container({ style: { opacity: 0.5 } });

    const tree = mountTree(definition, parent, createMockContext());

    expect(tree.root.hostNode).toBeInstanceOf(ContainerNode);
    expect(tree.root.hostNode.displayObject.alpha).toBe(0.5);
    expect(parent.children).toHaveLength(1);
  });

  it('mounts nested object-shaped children', () => {
    const parent = new Container();
    const definition = container({
      children: [text({ content: 'child 1' }), container({ children: [text({ content: 'grandchild' })] })],
    });

    const tree = mountTree(definition, parent, createMockContext());

    expect(tree.root.children).toHaveLength(2);
    expect(tree.root.children[0].hostNode).toBeInstanceOf(TextNode);
    expect(tree.root.children[1].children).toHaveLength(1);
  });

  it('normalizes string children as text nodes', () => {
    const parent = new Container();
    const definition: PixoraNode<'container'> = {
      children: ['hello', 'world'],
      key: undefined,
      props: {},
      type: 'container',
    };

    const tree = mountTree(definition, parent, createMockContext());

    expect((tree.root.children[0].hostNode.displayObject as Text).text).toBe('hello');
    expect((tree.root.children[1].hostNode.displayObject as Text).text).toBe('world');
  });

  it('mounts imperative children', () => {
    const parent = new Container();
    const existingNode = new ContainerNode();
    const definition = container({ children: [imperative(existingNode)] });

    const tree = mountTree(definition, parent, createMockContext());

    expect(tree.root.children[0].hostNode).toBe(existingNode);
    expect(tree.root.children[0].isImperative).toBe(true);
  });
});

describe('unmountTree', () => {
  it('removes the root display object from its parent', () => {
    const parent = new Container();
    const tree = mountTree(container({}), parent, createMockContext());

    unmountTree(tree);

    expect(parent.children).toHaveLength(0);
  });
});

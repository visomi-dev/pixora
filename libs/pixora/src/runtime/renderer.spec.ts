import { Container, Text } from 'pixi.js';

import type { ApplicationContext } from '../app/types';
import { ContainerNode } from '../components/container-node';
import { TextNode } from '../components/text-node';

import { imperative } from './compat';
import { box, button, container, text } from './create-node';
import { mountTree, unmountTree } from './renderer';
import type { PixoraNode } from './types';

function createMockContext(): ApplicationContext {
  return {} as ApplicationContext;
}

describe('mountTree', () => {
  it('mounts a single container node', () => {
    const parent = new Container();
    const definition = container({ x: 10, y: 20 });

    const tree = mountTree(definition, parent, createMockContext());

    expect(tree.root).toBeDefined();
    expect(tree.root.hostNode).toBeInstanceOf(ContainerNode);
    expect(tree.root.hostNode.displayObject.x).toBe(10);
    expect(tree.root.hostNode.displayObject.y).toBe(20);
    expect(parent.children).toHaveLength(1);
  });

  it('mounts a single text node', () => {
    const parent = new Container();
    const definition = text({ text: 'Hello' });

    const tree = mountTree(definition, parent, createMockContext());

    expect(tree.root.hostNode).toBeInstanceOf(TextNode);
    expect((tree.root.hostNode.displayObject as Text).text).toBe('Hello');
  });

  it('mounts a nested tree', () => {
    const parent = new Container();
    const definition = container(
      {},
      text({ text: 'child 1' }),
      container({ alpha: 0.5 }, text({ text: 'grandchild' })),
    );

    const tree = mountTree(definition, parent, createMockContext());

    expect(tree.root.children).toHaveLength(2);
    expect(tree.root.children[0].hostNode).toBeInstanceOf(TextNode);
    expect(tree.root.children[1].children).toHaveLength(1);
    expect(tree.root.children[1].hostNode.displayObject.alpha).toBe(0.5);
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

    expect(tree.root.children).toHaveLength(2);
    expect(tree.root.children[0].hostNode).toBeInstanceOf(TextNode);
    expect((tree.root.children[0].hostNode.displayObject as Text).text).toBe('hello');
    expect((tree.root.children[1].hostNode.displayObject as Text).text).toBe('world');
  });

  it('filters out falsy children', () => {
    const parent = new Container();
    const definition: PixoraNode<'container'> = {
      children: [null, undefined, false, text({ text: 'visible' })],
      key: undefined,
      props: {},
      type: 'container',
    };

    const tree = mountTree(definition, parent, createMockContext());

    expect(tree.root.children).toHaveLength(1);
  });

  it('sets parent references correctly', () => {
    const parent = new Container();
    const definition = container({}, text({ text: 'child' }));

    const tree = mountTree(definition, parent, createMockContext());

    expect(tree.root.parent).toBeNull();
    expect(tree.root.children[0].parent).toBe(tree.root);
  });

  it('mounts mixed host types', () => {
    const parent = new Container();
    const definition = container(
      {},
      box({ width: 100, height: 50 }),
      button({ label: 'Click' }),
      text({ text: 'label' }),
    );

    const tree = mountTree(definition, parent, createMockContext());

    expect(tree.root.children).toHaveLength(3);
  });

  it('applies common props to all node types', () => {
    const parent = new Container();
    const definition = text({ text: 'positioned', x: 50, y: 100, alpha: 0.8 });

    const tree = mountTree(definition, parent, createMockContext());

    expect(tree.root.hostNode.displayObject.x).toBe(50);
    expect(tree.root.hostNode.displayObject.y).toBe(100);
    expect(tree.root.hostNode.displayObject.alpha).toBeCloseTo(0.8);
  });

  it('stores the context in the mounted tree', () => {
    const parent = new Container();
    const ctx = createMockContext();
    const definition = container();

    const tree = mountTree(definition, parent, ctx);

    expect(tree.context).toBe(ctx);
  });
});

describe('unmountTree', () => {
  it('removes the root display object from its parent', () => {
    const parent = new Container();
    const definition = container();

    const tree = mountTree(definition, parent, createMockContext());

    expect(parent.children).toHaveLength(1);

    unmountTree(tree);

    expect(parent.children).toHaveLength(0);
  });

  it('clears all children from mounted nodes', () => {
    const parent = new Container();
    const definition = container({}, text({ text: 'a' }), text({ text: 'b' }));

    const tree = mountTree(definition, parent, createMockContext());

    expect(tree.root.children).toHaveLength(2);

    unmountTree(tree);

    expect(tree.root.children).toHaveLength(0);
  });
});

describe('imperative bridge in renderer', () => {
  it('mounts an imperative node without creating a new instance', () => {
    const parent = new Container();
    const existingNode = new ContainerNode();

    existingNode.displayObject.x = 42;

    const definition = container({}, imperative(existingNode));
    const tree = mountTree(definition, parent, createMockContext());

    expect(tree.root.children).toHaveLength(1);
    expect(tree.root.children[0].hostNode).toBe(existingNode);
    expect(tree.root.children[0].isImperative).toBe(true);
  });

  it('does not destroy imperative nodes on unmount', () => {
    const parent = new Container();
    const existingNode = new ContainerNode();
    const definition = container({}, imperative(existingNode));

    const tree = mountTree(definition, parent, createMockContext());

    unmountTree(tree);

    // The imperative node should still be functional (not destroyed).
    // We can verify by checking its displayObject is accessible.
    expect(existingNode.displayObject).toBeDefined();
  });
});

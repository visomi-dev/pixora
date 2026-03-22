import { Container, Text } from 'pixi.js';

import { Box } from '../components/box';
import { ContainerNode } from '../components/container-node';
import { TextNode } from '../components/text-node';

import { imperative } from './compat';
import { box, container, keyedBox, keyedText, text } from './create-node';
import { mountTree } from './renderer';
import { updateTree } from './reconcile';

import type { ApplicationContext } from '../app/types';
import type { PixoraNode } from './types';

function createMockContext(): ApplicationContext {
  return {} as ApplicationContext;
}

describe('updateTree', () => {
  it('patches props on an existing node without remounting', () => {
    const parent = new Container();
    const definition = container({ x: 10, y: 20 }, text({ text: 'Hello' }));

    const tree = mountTree(definition, parent, createMockContext());
    const originalTextNode = tree.root.children[0].hostNode;

    const newDefinition = container({ x: 100, y: 200 }, text({ text: 'Updated' }));

    updateTree(tree, newDefinition);

    expect(tree.root.hostNode.displayObject.x).toBe(100);
    expect(tree.root.hostNode.displayObject.y).toBe(200);
    expect((tree.root.children[0].hostNode.displayObject as Text).text).toBe('Updated');
    expect(tree.root.children[0].hostNode).toBe(originalTextNode);
  });

  it('adds new children that were not in the original tree', () => {
    const parent = new Container();
    const definition = container({}, text({ text: 'first' }));

    const tree = mountTree(definition, parent, createMockContext());

    expect(tree.root.children).toHaveLength(1);

    const newDefinition = container({}, text({ text: 'first' }), text({ text: 'second' }));

    updateTree(tree, newDefinition);

    expect(tree.root.children).toHaveLength(2);
    expect((tree.root.children[0].hostNode.displayObject as Text).text).toBe('first');
    expect((tree.root.children[1].hostNode.displayObject as Text).text).toBe('second');
  });

  it('removes children that are no longer in the new tree', () => {
    const parent = new Container();
    const definition = container({}, text({ text: 'first' }), text({ text: 'second' }));

    const tree = mountTree(definition, parent, createMockContext());

    expect(tree.root.children).toHaveLength(2);

    const newDefinition = container({}, text({ text: 'first' }));

    updateTree(tree, newDefinition);

    expect(tree.root.children).toHaveLength(1);
    expect((tree.root.children[0].hostNode.displayObject as Text).text).toBe('first');
  });

  it('reorders keyed children correctly', () => {
    const parent = new Container();
    const definition = container(
      {},
      keyedBox('a', { width: 10, height: 10 }),
      keyedBox('b', { width: 20, height: 20 }),
    );

    const tree = mountTree(definition, parent, createMockContext());

    const newDefinition = container(
      {},
      keyedBox('b', { width: 200, height: 200 }),
      keyedBox('a', { width: 100, height: 100 }),
    );

    updateTree(tree, newDefinition);

    expect(tree.root.children).toHaveLength(2);
    expect(tree.root.children[0].definition.key).toBe('b');
    expect(tree.root.children[1].definition.key).toBe('a');
  });

  it('replaces node when type changes', () => {
    const parent = new Container();
    const definition = container({}, text({ text: 'I am text' }));

    const tree = mountTree(definition, parent, createMockContext());

    const newDefinition = container({}, box({ width: 50, height: 50 }));

    updateTree(tree, newDefinition);

    expect(tree.root.children).toHaveLength(1);
    expect(tree.root.children[0].hostNode).toBeInstanceOf(Box);
  });

  it('preserves keyed nodes when order changes', () => {
    const parent = new Container();
    const definition = container(
      {},
      keyedBox('first', { width: 10, height: 10 }),
      keyedBox('second', { width: 20, height: 20 }),
    );

    const tree = mountTree(definition, parent, createMockContext());

    const firstOriginal = tree.root.children[0].hostNode;
    const secondOriginal = tree.root.children[1].hostNode;

    const newDefinition = container(
      {},
      keyedBox('second', { width: 20, height: 20 }),
      keyedBox('first', { width: 10, height: 10 }),
    );

    updateTree(tree, newDefinition);

    expect(tree.root.children[0].hostNode).toBe(secondOriginal);
    expect(tree.root.children[1].hostNode).toBe(firstOriginal);
  });

  it('updates deeply nested children', () => {
    const parent = new Container();
    const definition = container({}, container({}, text({ text: 'nested' })));

    const tree = mountTree(definition, parent, createMockContext());

    const newDefinition = container({}, container({}, text({ text: 'updated nested' })));

    updateTree(tree, newDefinition);

    const nestedContainer = tree.root.children[0];
    const nestedText = nestedContainer.children[0];

    expect((nestedText.hostNode.displayObject as Text).text).toBe('updated nested');
  });

  it('handles mixed keyed and position children', () => {
    const parent = new Container();
    const definition = container(
      {},
      keyedText('keyed', { text: 'keyed text' }),
      text({ text: 'positioned 1' }),
      text({ text: 'positioned 2' }),
    );

    const tree = mountTree(definition, parent, createMockContext());

    const newDefinition = container(
      {},
      keyedText('keyed', { text: 'updated keyed' }),
      text({ text: 'new positioned' }),
    );

    updateTree(tree, newDefinition);

    expect(tree.root.children).toHaveLength(2);
    expect((tree.root.children[0].hostNode.displayObject as Text).text).toBe('updated keyed');
    expect((tree.root.children[1].hostNode.displayObject as Text).text).toBe('new positioned');
  });

  it('does not destroy imperative nodes on update', () => {
    const parent = new Container();
    const existingNode = new ContainerNode();
    existingNode.displayObject.x = 42;

    const definition = container({}, imperative(existingNode));

    const tree = mountTree(definition, parent, createMockContext());

    const newDefinition = container({}, imperative(existingNode), text({ text: 'new' }));

    updateTree(tree, newDefinition);

    expect(existingNode.displayObject).toBeDefined();
    expect(existingNode.displayObject.x).toBe(42);
  });

  it('handles replacing imperative node with declarative node', () => {
    const parent = new Container();
    const existingNode = new ContainerNode();

    const definition = container({}, imperative(existingNode));

    const tree = mountTree(definition, parent, createMockContext());

    const newDefinition = container({}, text({ text: 'replaced' }));

    updateTree(tree, newDefinition);

    expect(tree.root.children).toHaveLength(1);
    expect(tree.root.children[0].hostNode).not.toBe(existingNode);
    expect(tree.root.children[0].hostNode).toBeInstanceOf(TextNode);
  });

  it('handles replacing declarative node with imperative node', () => {
    const parent = new Container();
    const existingNode = new ContainerNode();

    const definition = container({}, text({ text: 'original' }));

    const tree = mountTree(definition, parent, createMockContext());

    const newDefinition = container({}, imperative(existingNode));

    updateTree(tree, newDefinition);

    expect(tree.root.children).toHaveLength(1);
    expect(tree.root.children[0].hostNode).toBe(existingNode);
    expect(tree.root.children[0].isImperative).toBe(true);
  });

  it('handles adding many children', () => {
    const parent = new Container();
    const definition = container({});

    const tree = mountTree(definition, parent, createMockContext());

    const children: PixoraNode<'text'>[] = [];

    for (let i = 0; i < 10; i++) {
      children.push(keyedText(`child-${i}`, { text: `Item ${i}` }));
    }

    const newDefinition = container({}, ...children);

    updateTree(tree, newDefinition);

    expect(tree.root.children).toHaveLength(10);
  });

  it('handles removing many children', () => {
    const parent = new Container();

    const children: PixoraNode<'text'>[] = [];

    for (let i = 0; i < 10; i++) {
      children.push(keyedText(`child-${i}`, { text: `Item ${i}` }));
    }

    const definition = container({}, ...children);

    const tree = mountTree(definition, parent, createMockContext());

    expect(tree.root.children).toHaveLength(10);

    const newDefinition = container({});

    updateTree(tree, newDefinition);

    expect(tree.root.children).toHaveLength(0);
  });
});

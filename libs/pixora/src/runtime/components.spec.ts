import { Container } from 'pixi.js';

import type { ApplicationContext } from '../app/types';

import { container, text } from './create-node';
import { mountTree } from './renderer';
import { updateTree } from './reconcile';

function createMockContext(): ApplicationContext {
  return {} as ApplicationContext;
}

describe('functional components', () => {
  it('resolves functional components during mount', () => {
    const MyComponent = (props: { label: string }) => text({ text: props.label });

    const parent = new Container();
    const definition = container({}, MyComponent({ label: 'Hello' }));

    const tree = mountTree(definition, parent, createMockContext());

    expect(tree.root.children).toHaveLength(1);
  });

  it('resolves functional components during update', () => {
    const MyComponent = (props: { label: string }) => text({ text: props.label });

    const parent = new Container();
    const definition = container({}, MyComponent({ label: 'First' }));

    const tree = mountTree(definition, parent, createMockContext());

    const newDefinition = container({}, MyComponent({ label: 'Updated' }));

    updateTree(tree, newDefinition);

    expect(tree.root.children).toHaveLength(1);
  });

  it('handles nested functional components', () => {
    const Inner = () => text({ text: 'inner' });
    const Outer = () => container({}, Inner());

    const parent = new Container();
    const definition = container({}, Outer());

    const tree = mountTree(definition, parent, createMockContext());

    expect(tree.root.children).toHaveLength(1);
    expect(tree.root.children[0].children).toHaveLength(1);
  });
});

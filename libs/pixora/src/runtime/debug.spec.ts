import { Container } from 'pixi.js';

import { container, text } from './create-node';
import { inspectTree } from './debug';
import { mountTree } from './renderer';

import type { ApplicationContext } from '../app/types';

function createMockContext(): ApplicationContext {
  return {} as ApplicationContext;
}

describe('debug helpers', () => {
  it('inspects object-shaped trees', () => {
    const tree = mountTree(
      container({
        children: [
          text({ content: 'child1' }),
          container({ key: 'nested', children: [text({ content: 'grandchild' })] }),
          text({ content: 'child2' }),
        ],
      }),
      new Container(),
      createMockContext(),
    );

    const result = inspectTree(tree);

    expect(result.children).toHaveLength(3);
    expect(result.children[1]?.key).toBe('nested');
  });
});

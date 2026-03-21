import { Container } from 'pixi.js';

import { container, keyedContainer, text } from './create-node';
import { inspectNode, inspectTree, getTreeStats, formatTree, findNodeByKey, findNodesByType } from './debug';
import { mountTree } from './renderer';
import type { MountedTree } from './mounted-node';

function createMockContext() {
  return {} as Parameters<typeof mountTree>[2];
}

describe('debug', () => {
  let tree: MountedTree;

  beforeEach(() => {
    const parent = new Container();
    const definition = container(
      {},
      text({ text: 'child1' }),
      keyedContainer('nested', {}, text({ text: 'grandchild' })),
      text({ text: 'child2' }),
    );

    tree = mountTree(definition, parent, createMockContext());
  });

  describe('inspectNode', () => {
    it('returns debug info for a node', () => {
      const info = inspectNode(tree.root);

      expect(info.depth).toBe(0);
      expect(info.isComponent).toBe(false);
    });

    it('returns host type string for container nodes', () => {
      const info = inspectNode(tree.root);

      expect(info.hostType).toBe('container');
    });

    it('returns children info recursively', () => {
      const info = inspectNode(tree.root);

      expect(info.children).toHaveLength(3);
      expect(info.children[0].depth).toBe(1);
      expect(info.children[1].children[0].depth).toBe(2);
    });

    it('includes props in debug info', () => {
      const info = inspectNode(tree.root);

      expect(info.props).toBeDefined();
    });
  });

  describe('inspectTree', () => {
    it('returns debug tree starting from root', () => {
      const info = inspectTree(tree);

      expect(info.depth).toBe(0);
    });
  });

  describe('getTreeStats', () => {
    it('counts all nodes', () => {
      const stats = getTreeStats(tree);

      expect(stats.totalNodes).toBe(5);
    });

    it('counts host nodes', () => {
      const stats = getTreeStats(tree);

      expect(stats.hostNodes).toBe(5);
    });

    it('counts keyed nodes', () => {
      const stats = getTreeStats(tree);

      expect(stats.keyedNodes).toBe(1);
    });

    it('counts component nodes as 0 for this tree', () => {
      const stats = getTreeStats(tree);

      expect(stats.componentNodes).toBe(0);
    });

    it('counts imperative nodes as 0 for this tree', () => {
      const stats = getTreeStats(tree);

      expect(stats.imperativeNodes).toBe(0);
    });
  });

  describe('formatTree', () => {
    it('returns a formatted string representation', () => {
      const formatted = formatTree(tree);

      expect(typeof formatted).toBe('string');
      expect(formatted.length).toBeGreaterThan(0);
    });
  });

  describe('findNodeByKey', () => {
    it('finds a node by its key', () => {
      const found = findNodeByKey(tree, 'nested');

      expect(found).not.toBeNull();
      expect(found?.definition.key).toBe('nested');
    });

    it('returns null when key is not found', () => {
      const found = findNodeByKey(tree, 'nonexistent');

      expect(found).toBeNull();
    });

    it('finds nested nodes by key', () => {
      const found = findNodeByKey(tree, 'nested');

      expect(found).not.toBeNull();
    });
  });

  describe('findNodesByType', () => {
    it('finds all text nodes', () => {
      const found = findNodesByType(tree, 'text');

      expect(found.length).toBe(3);
    });

    it('finds all container nodes', () => {
      const found = findNodesByType(tree, 'container');

      expect(found.length).toBe(2);
    });

    it('returns empty array when no nodes match', () => {
      const found = findNodesByType(tree, 'button');

      expect(found).toHaveLength(0);
    });
  });
});

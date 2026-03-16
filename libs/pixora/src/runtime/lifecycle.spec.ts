/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  clearLayoutDirty,
  clearVisualDirty,
  hasDirtyDescendants,
  InvalidationFlag,
  isLayoutDirty,
  isVisuallyDirty,
  markLayoutDirty,
  markVisualDirty,
} from './lifecycle';

describe('lifecycle', () => {
  describe('invalidation flags', () => {
    it('starts with no invalidation', () => {
      const node = createMockLifecycleNode();

      expect(node.invalidation).toBe(InvalidationFlag.None);
    });

    it('marks visual dirty correctly', () => {
      const node = createMockLifecycleNode();

      markVisualDirty(node);

      expect(isVisuallyDirty(node)).toBe(true);
      expect(isLayoutDirty(node)).toBe(false);
    });

    it('marks layout dirty correctly', () => {
      const node = createMockLifecycleNode();

      markLayoutDirty(node);

      expect(isVisuallyDirty(node)).toBe(false);
      expect(isLayoutDirty(node)).toBe(true);
    });

    it('marks both dirty correctly', () => {
      const node = createMockLifecycleNode();

      markVisualDirty(node);
      markLayoutDirty(node);

      expect(isVisuallyDirty(node)).toBe(true);
      expect(isLayoutDirty(node)).toBe(true);
    });

    it('clears visual dirty correctly', () => {
      const node = createMockLifecycleNode();

      markVisualDirty(node);
      clearVisualDirty(node);

      expect(isVisuallyDirty(node)).toBe(false);
    });

    it('clears layout dirty correctly', () => {
      const node = createMockLifecycleNode();

      markLayoutDirty(node);
      clearLayoutDirty(node);

      expect(isLayoutDirty(node)).toBe(false);
    });

    it('clears visual dirty but keeps layout dirty', () => {
      const node = createMockLifecycleNode();

      markVisualDirty(node);
      markLayoutDirty(node);
      clearVisualDirty(node);

      expect(isVisuallyDirty(node)).toBe(false);
      expect(isLayoutDirty(node)).toBe(true);
    });

    it('clears layout dirty but keeps visual dirty', () => {
      const node = createMockLifecycleNode();

      markVisualDirty(node);
      markLayoutDirty(node);
      clearLayoutDirty(node);

      expect(isVisuallyDirty(node)).toBe(true);
      expect(isLayoutDirty(node)).toBe(false);
    });
  });

  describe('hasDirtyDescendants', () => {
    it('returns true when node is visually dirty', () => {
      const node = createMockLifecycleNode();
      markVisualDirty(node);

      expect(hasDirtyDescendants(node)).toBe(true);
    });

    it('returns true when node is layout dirty', () => {
      const node = createMockLifecycleNode();
      markLayoutDirty(node);

      expect(hasDirtyDescendants(node)).toBe(true);
    });

    it('returns true when child is dirty', () => {
      const parent = createMockLifecycleNode();
      const child = createMockLifecycleNode();
      parent.children = [child];
      markVisualDirty(child);

      expect(hasDirtyDescendants(parent)).toBe(true);
    });

    it('returns false when no descendants are dirty', () => {
      const parent = createMockLifecycleNode();
      const child = createMockLifecycleNode();
      parent.children = [child];

      expect(hasDirtyDescendants(parent)).toBe(false);
    });
  });
});

function createMockLifecycleNode(): any {
  return {
    definition: null,
    hostNode: null,
    invalidation: InvalidationFlag.None,
    parent: null,
    children: [] as any[],
  };
}

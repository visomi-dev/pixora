import type { BaseNode } from '../components/base-node';
import type { PixoraNode } from './types';

export const enum LifecyclePhase {
  Create = 'create',
  Mount = 'mount',
  Update = 'update',
  Layout = 'layout',
  Destroy = 'destroy',
}

export const enum InvalidationFlag {
  None = 0,
  Visual = 1 << 0,
  Layout = 1 << 1,
  Both = Visual | Layout,
}

export type LifecycleNode = {
  definition: PixoraNode | null;
  hostNode: BaseNode | null;
  invalidation: InvalidationFlag;
  parent: LifecycleNode | null;
  children?: readonly LifecycleNode[];
};

export function markVisualDirty(node: LifecycleNode): void {
  node.invalidation |= InvalidationFlag.Visual;
}

export function markLayoutDirty(node: LifecycleNode): void {
  node.invalidation |= InvalidationFlag.Layout;
}

export function clearVisualDirty(node: LifecycleNode): void {
  node.invalidation &= ~InvalidationFlag.Visual;
}

export function clearLayoutDirty(node: LifecycleNode): void {
  node.invalidation &= ~InvalidationFlag.Layout;
}

export function isVisuallyDirty(node: LifecycleNode): boolean {
  return (node.invalidation & InvalidationFlag.Visual) !== 0;
}

export function isLayoutDirty(node: LifecycleNode): boolean {
  return (node.invalidation & InvalidationFlag.Layout) !== 0;
}

export function hasDirtyDescendants(node: LifecycleNode): boolean {
  if (isVisuallyDirty(node) || isLayoutDirty(node)) {
    return true;
  }

  if (node.children) {
    for (const child of node.children) {
      if (hasDirtyDescendants(child)) {
        return true;
      }
    }
  }

  return false;
}

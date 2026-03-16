import type { Viewport } from '../app/types';
import type { BaseNode } from '../components/base-node';
import type { LayoutSpec } from '../layout/layout';
import { applyLayout } from '../layout/apply-layout';

export type LayoutNode = {
  hostNode: BaseNode;
  layoutSpec: LayoutSpec | null;
  measuredWidth: number;
  measuredHeight: number;
  needsLayout: boolean;
  parent: LayoutNode | null;
};

export type LayoutConfig = {
  autoSize: boolean;
  layoutSpec: LayoutSpec | null;
};

const layoutNodeCache = new WeakMap<BaseNode, LayoutNode>();

export function getOrCreateLayoutNode(hostNode: BaseNode, parent: LayoutNode | null): LayoutNode {
  let node = layoutNodeCache.get(hostNode);

  if (!node) {
    node = {
      hostNode,
      layoutSpec: null,
      measuredHeight: 0,
      measuredWidth: 0,
      needsLayout: true,
      parent,
    };

    layoutNodeCache.set(hostNode, node);
  }

  node.parent = parent;

  return node;
}

export function setLayoutSpec(hostNode: BaseNode, spec: LayoutSpec | null): void {
  const node = getOrCreateLayoutNode(hostNode, null);

  if (node.layoutSpec !== spec) {
    node.layoutSpec = spec;
    node.needsLayout = true;
  }
}

export function markNodeLayoutDirty(hostNode: BaseNode): void {
  const node = layoutNodeCache.get(hostNode);

  if (node) {
    node.needsLayout = true;
  }
}

export function markLayoutNodeDirty(hostNode: BaseNode): void {
  markNodeLayoutDirty(hostNode);
}

export function markSubtreeLayoutDirty(hostNode: BaseNode): void {
  markNodeLayoutDirty(hostNode);

  const node = layoutNodeCache.get(hostNode);

  if (node && node.hostNode.getChildren) {
    for (const child of node.hostNode.getChildren()) {
      markSubtreeLayoutDirty(child);
    }
  }
}

export function clearLayoutDirty(hostNode: BaseNode): void {
  const node = layoutNodeCache.get(hostNode);

  if (node) {
    node.needsLayout = false;
  }
}

export function isLayoutDirty(hostNode: BaseNode): boolean {
  const node = layoutNodeCache.get(hostNode);

  return node?.needsLayout ?? false;
}

export function measureNode(hostNode: BaseNode): { width: number; height: number } {
  const displayObject = hostNode.displayObject;
  const children = hostNode.getChildren?.() ?? [];

  let contentWidth = 0;
  let contentHeight = 0;

  for (const child of children) {
    if (!child.displayObject.visible) {
      continue;
    }

    const childBounds = getChildBounds(child);
    contentWidth = Math.max(contentWidth, childBounds.x + childBounds.width);
    contentHeight = Math.max(contentHeight, childBounds.y + childBounds.height);
  }

  return {
    width: Math.max(displayObject.width, contentWidth),
    height: Math.max(displayObject.height, contentHeight),
  };
}

function getChildBounds(child: BaseNode): { height: number; width: number; x: number; y: number } {
  const displayObject = child.displayObject;

  return {
    height: displayObject.height,
    width: displayObject.width,
    x: displayObject.x,
    y: displayObject.y,
  };
}

export function runLayout(
  rootNode: BaseNode,
  viewport: Viewport,
  parentBounds: { height: number; width: number; x: number; y: number } = {
    x: 0,
    y: 0,
    width: viewport.width,
    height: viewport.height,
  },
): void {
  const layoutRoot = getOrCreateLayoutNode(rootNode, null);
  layoutRoot.measuredWidth = parentBounds.width;
  layoutRoot.measuredHeight = parentBounds.height;

  applyLayoutRecursive(layoutRoot, parentBounds, viewport);
}

function applyLayoutRecursive(
  node: LayoutNode,
  parentBounds: { height: number; width: number; x: number; y: number },
  viewport: Viewport,
): void {
  if (!node.needsLayout && !hasDirtyChildren(node)) {
    return;
  }

  if (node.layoutSpec) {
    applyLayout(node.hostNode, node.layoutSpec, parentBounds, viewport);

    const displayObject = node.hostNode.displayObject;
    node.measuredWidth = displayObject.width;
    node.measuredHeight = displayObject.height;
  } else {
    const measured = measureNode(node.hostNode);
    node.measuredWidth = measured.width;
    node.measuredHeight = measured.height;
  }

  node.needsLayout = false;

  const children = node.hostNode.getChildren?.() ?? [];

  for (const child of children) {
    const childLayoutNode = layoutNodeCache.get(child);

    if (childLayoutNode) {
      const childBounds = {
        height: child.displayObject.height,
        width: child.displayObject.width,
        x: child.displayObject.x,
        y: child.displayObject.y,
      };

      applyLayoutRecursive(childLayoutNode, childBounds, viewport);
    }
  }
}

function hasDirtyChildren(node: LayoutNode): boolean {
  const children = node.hostNode.getChildren?.() ?? [];

  for (const child of children) {
    const childLayoutNode = layoutNodeCache.get(child);

    if (childLayoutNode?.needsLayout) {
      return true;
    }
  }

  return false;
}

export function removeLayoutNode(hostNode: BaseNode): void {
  layoutNodeCache.delete(hostNode);
}

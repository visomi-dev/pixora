import { applyLayout } from '../layout/apply-layout';

import type { Viewport } from '../app/types';
import type { BaseNode } from '../components/base-node';
import type { LayoutSpec } from '../layout/layout';
import type { LayoutStyles } from '../layout/layout-types';

export type LayoutNode = {
  hostNode: BaseNode;
  layoutSpec: LayoutSpec | null;
  layoutStyles: LayoutStyles | null;
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
      layoutStyles: null,
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

export function setLayoutStyles(hostNode: BaseNode, styles: LayoutStyles | null): void {
  const node = getOrCreateLayoutNode(hostNode, null);

  if (node.layoutStyles !== styles) {
    node.layoutStyles = styles;
    node.needsLayout = true;
  }
}

export function getLayoutStyles(hostNode: BaseNode): LayoutStyles | null {
  return layoutNodeCache.get(hostNode)?.layoutStyles ?? null;
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

  for (const child of hostNode.getChildren?.() ?? []) {
    markSubtreeLayoutDirty(child);
  }
}

export function clearLayoutDirty(hostNode: BaseNode): void {
  const node = layoutNodeCache.get(hostNode);

  if (node) {
    node.needsLayout = false;
  }
}

export function isLayoutDirty(hostNode: BaseNode): boolean {
  return layoutNodeCache.get(hostNode)?.needsLayout ?? false;
}

export function measureNode(hostNode: BaseNode): { height: number; width: number } {
  const children = hostNode.getChildren?.() ?? [];
  let width = hostNode.getLayoutWidth();
  let height = hostNode.getLayoutHeight();

  for (const child of children) {
    if (!child.displayObject.visible) {
      continue;
    }

    width = Math.max(width, child.displayObject.x + child.getLayoutWidth());
    height = Math.max(height, child.displayObject.y + child.getLayoutHeight());
  }

  return { height, width };
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
  if (node.layoutSpec) {
    applyLayout(node.hostNode, node.layoutSpec, parentBounds, viewport);

    node.measuredWidth = node.hostNode.getLayoutWidth();
    node.measuredHeight = node.hostNode.getLayoutHeight();
  } else {
    const measured = measureNode(node.hostNode);

    node.measuredWidth = node.parent ? measured.width : Math.max(parentBounds.width, measured.width);
    node.measuredHeight = node.parent ? measured.height : Math.max(parentBounds.height, measured.height);
  }

  node.needsLayout = false;

  const childBounds = {
    height: node.measuredHeight,
    width: node.measuredWidth,
    x: node.hostNode.displayObject.x,
    y: node.hostNode.displayObject.y,
  };

  for (const child of node.hostNode.getChildren?.() ?? []) {
    const childLayoutNode = layoutNodeCache.get(child);

    if (!childLayoutNode) {
      continue;
    }

    childLayoutNode.parent = node;
    applyLayoutRecursive(childLayoutNode, childBounds, viewport);
  }
}

export function removeLayoutNode(hostNode: BaseNode): void {
  layoutNodeCache.delete(hostNode);
}

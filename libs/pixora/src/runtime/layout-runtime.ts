import { applyLayout } from '../layout/apply-layout';

import type { Container } from 'pixi.js';
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
  const node = layoutNodeCache.get(hostNode);
  return node?.layoutStyles ?? null;
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
  } else if (node.layoutStyles) {
    applyNewLayout(node.hostNode, node.layoutStyles, parentBounds, viewport);

    const displayObject = node.hostNode.displayObject;
    node.measuredWidth = displayObject.width;
    node.measuredHeight = displayObject.height;
  } else {
    const measured = measureNode(node.hostNode);
    node.measuredWidth = node.parent ? measured.width : Math.max(parentBounds.width, measured.width);
    node.measuredHeight = node.parent ? measured.height : Math.max(parentBounds.height, measured.height);
  }

  node.needsLayout = false;

  const children = node.hostNode.getChildren?.() ?? [];

  for (const child of children) {
    const childLayoutNode = layoutNodeCache.get(child);

    if (childLayoutNode) {
      const childBounds = {
        height: node.measuredHeight,
        width: node.measuredWidth,
        x: 0,
        y: 0,
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

function applyNewLayout(
  hostNode: BaseNode,
  styles: LayoutStyles,
  parentBounds: { height: number; width: number; x: number; y: number },
  _viewport: Viewport,
): void {
  const displayObject = hostNode.displayObject;
  const children = hostNode.getChildren?.() ?? [];
  const isContainer = styles.display === 'flex';

  if (!isContainer) {
    return;
  }

  const isRow = styles.flexDirection === 'row' || styles.flexDirection === 'row-reverse';
  const justifyContent = styles.justifyContent ?? 'flex-start';
  const alignItems = styles.alignItems ?? 'stretch';
  const gap = styles.gap ?? 0;

  const paddingLeft = typeof styles.paddingLeft === 'number' ? styles.paddingLeft : 0;
  const paddingRight = typeof styles.paddingRight === 'number' ? styles.paddingRight : 0;
  const paddingTop = typeof styles.paddingTop === 'number' ? styles.paddingTop : 0;
  const paddingBottom = typeof styles.paddingBottom === 'number' ? styles.paddingBottom : 0;

  const paddingX = paddingLeft + paddingRight;
  const paddingY = paddingTop + paddingBottom;

  const availableWidth = resolveDimension(styles.width, parentBounds.width) ?? parentBounds.width - paddingX;
  const availableHeight = resolveDimension(styles.height, parentBounds.height) ?? parentBounds.height - paddingY;

  if (isRow) {
    displayObject.width = availableWidth;
    displayObject.height = availableHeight;
  } else {
    displayObject.width = availableWidth;
    displayObject.height = availableHeight;
  }

  let currentX = parentBounds.x + paddingLeft;
  let currentY = parentBounds.y + paddingTop;

  const visibleChildren = children.filter((child) => child.displayObject.visible);

  for (let i = 0; i < visibleChildren.length; i++) {
    const child = visibleChildren[i];
    const childDisplayObject = child.displayObject;

    const childStyle = getLayoutStyles(child);
    const flexGrow = childStyle?.flexGrow ?? 0;
    const flexShrink = childStyle?.flexShrink ?? 1;

    let childWidth = childDisplayObject.width;
    let childHeight = childDisplayObject.height;

    if (flexGrow > 0 || flexShrink > 0) {
      const availableSpace = isRow ? availableWidth : availableHeight;
      const totalChildSize = visibleChildren.reduce((sum, c) => {
        return sum + (isRow ? c.displayObject.width : c.displayObject.height);
      }, 0);
      const remainingSpace = availableSpace - paddingX - totalChildSize - gap * (visibleChildren.length - 1);

      if (remainingSpace > 0 && flexGrow > 0) {
        const growAmount =
          (remainingSpace * flexGrow) / visibleChildren.reduce((s, c) => s + (getLayoutStyles(c)?.flexGrow ?? 0), 0);
        if (isRow) {
          childWidth += growAmount;
        } else {
          childHeight += growAmount;
        }
      }
    }

    let xPos = currentX;
    let yPos = currentY;

    const alignSelf = childStyle?.alignSelf ?? alignItems;

    if (alignSelf === 'center') {
      if (isRow) {
        yPos += (availableHeight - paddingY - childHeight) / 2;
      } else {
        xPos += (availableWidth - paddingX - childWidth) / 2;
      }
    } else if (alignSelf === 'flex-end') {
      if (isRow) {
        yPos += availableHeight - paddingY - childHeight;
      } else {
        xPos += availableWidth - paddingX - childWidth;
      }
    }

    childDisplayObject.x = xPos;
    childDisplayObject.y = yPos;

    if (isRow) {
      currentX += childWidth + gap;
    } else {
      currentY += childHeight + gap;
    }
  }

  applyJustifyContent(
    displayObject,
    visibleChildren,
    justifyContent,
    isRow,
    availableWidth - paddingX,
    availableHeight - paddingY,
  );

  if (styles.position === 'absolute') {
    if (styles.left !== undefined) {
      displayObject.x = parentBounds.x + resolveNumberValue(styles.left, parentBounds.width);
    }
    if (styles.top !== undefined) {
      displayObject.y = parentBounds.y + resolveNumberValue(styles.top, parentBounds.height);
    }
    if (styles.right !== undefined) {
      displayObject.x =
        parentBounds.x +
        parentBounds.width -
        displayObject.width -
        resolveNumberValue(styles.right, parentBounds.width);
    }
    if (styles.bottom !== undefined) {
      displayObject.y =
        parentBounds.y +
        parentBounds.height -
        displayObject.height -
        resolveNumberValue(styles.bottom, parentBounds.height);
    }
  }
}

function resolveDimension(
  value: LayoutStyles['width'] | LayoutStyles['height'] | undefined,
  parentSize: number,
): number | null {
  if (value === undefined || value === 'auto' || value === 'intrinsic') {
    return null;
  }
  return resolveNumberValue(value as string | number, parentSize);
}

function resolveNumberValue(value: string | number | undefined, parentSize: number): number {
  if (value === undefined) return 0;
  if (typeof value === 'number') return value;
  if (typeof value === 'string' && value.endsWith('%')) {
    return (parseFloat(value) / 100) * parentSize;
  }
  return parseFloat(value) || 0;
}

function applyJustifyContent(
  _container: Container,
  children: BaseNode[],
  justifyContent: LayoutStyles['justifyContent'],
  isRow: boolean,
  availableWidth: number,
  availableHeight: number,
): void {
  if (!justifyContent || justifyContent === 'flex-start') {
    return;
  }

  const totalChildSize = children.reduce((sum, child) => {
    return isRow ? sum + child.displayObject.width : sum + child.displayObject.height;
  }, 0);

  const remainingSpace = (isRow ? availableWidth : availableHeight) - totalChildSize;

  if (remainingSpace <= 0) {
    return;
  }

  let offset = 0;

  switch (justifyContent) {
    case 'center':
      offset = remainingSpace / 2;
      break;
    case 'flex-end':
      offset = remainingSpace;
      break;
    case 'space-between':
      if (children.length > 1) {
        offset = 0;
      } else {
        offset = remainingSpace / 2;
      }
      break;
    case 'space-around':
      offset = remainingSpace / (children.length * 2);
      break;
    case 'space-evenly':
      offset = remainingSpace / (children.length + 1);
      break;
  }

  if (offset > 0) {
    for (const child of children) {
      if (isRow) {
        child.displayObject.x += offset;
      } else {
        child.displayObject.y += offset;
      }
    }
  }
}

export function removeLayoutNode(hostNode: BaseNode): void {
  layoutNodeCache.delete(hostNode);
}

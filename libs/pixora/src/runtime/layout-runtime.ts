import { applyLayout } from '../layout/apply-layout';
import { flexEngine, type FlexNode } from '../layout/flex-engine';

import type { ComputedLayout } from '../layout/computed-layout';
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
    width: Math.max(hostNode.getLayoutWidth(), contentWidth),
    height: Math.max(hostNode.getLayoutHeight(), contentHeight),
  };
}

function getChildBounds(child: BaseNode): { height: number; width: number; x: number; y: number } {
  const displayObject = child.displayObject;

  return {
    height: child.getLayoutHeight(),
    width: child.getLayoutWidth(),
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

    node.measuredWidth = node.hostNode.getLayoutWidth();
    node.measuredHeight = node.hostNode.getLayoutHeight();
  } else if (node.layoutStyles) {
    applyNewLayout(node.hostNode, node.layoutStyles, parentBounds, viewport);

    node.measuredWidth = node.hostNode.getLayoutWidth();
    node.measuredHeight = node.hostNode.getLayoutHeight();
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
        x: node.hostNode.displayObject.x,
        y: node.hostNode.displayObject.y,
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
  const children = hostNode.getChildren?.() ?? [];
  const isContainer = styles.display === 'flex';
  const resolvedWidth = resolveDimension(styles.width, parentBounds.width) ?? hostNode.getLayoutWidth();
  const resolvedHeight = resolveDimension(styles.height, parentBounds.height) ?? hostNode.getLayoutHeight();

  hostNode.setLayoutSize(resolvedWidth, resolvedHeight);

  let xPos = parentBounds.x;
  let yPos = parentBounds.y;

  if (styles.position === 'absolute') {
    if (styles.left !== undefined) {
      xPos = parentBounds.x + resolveNumberValue(styles.left, parentBounds.width);
    } else if (styles.right !== undefined) {
      xPos = parentBounds.x + parentBounds.width - resolvedWidth - resolveNumberValue(styles.right, parentBounds.width);
    }

    if (styles.top !== undefined) {
      yPos = parentBounds.y + resolveNumberValue(styles.top, parentBounds.height);
    } else if (styles.bottom !== undefined) {
      yPos =
        parentBounds.y + parentBounds.height - resolvedHeight - resolveNumberValue(styles.bottom, parentBounds.height);
    }
  }

  hostNode.setLayoutPosition(xPos, yPos);

  if (!isContainer) {
    return;
  }

  const visibleChildren = children.filter((child) => child.displayObject.visible);

  if (visibleChildren.length > 0) {
    applyFlexLayout(hostNode, styles, parentBounds, xPos, yPos, visibleChildren);
  }
}

function applyFlexLayout(
  hostNode: BaseNode,
  styles: LayoutStyles,
  parentBounds: { height: number; width: number; x: number; y: number },
  containerX: number,
  containerY: number,
  children: BaseNode[],
): void {
  const isRow = styles.flexDirection === 'row' || styles.flexDirection === 'row-reverse';
  const justifyContent = styles.justifyContent ?? 'flex-start';

  const paddingLeft = typeof styles.paddingLeft === 'number' ? styles.paddingLeft : 0;
  const paddingRight = typeof styles.paddingRight === 'number' ? styles.paddingRight : 0;
  const paddingTop = typeof styles.paddingTop === 'number' ? styles.paddingTop : 0;
  const paddingBottom = typeof styles.paddingBottom === 'number' ? styles.paddingBottom : 0;

  const paddingX = paddingLeft + paddingRight;
  const paddingY = paddingTop + paddingBottom;

  const resolvedWidth = resolveDimension(styles.width, parentBounds.width) ?? parentBounds.width;
  const resolvedHeight = resolveDimension(styles.height, parentBounds.height) ?? parentBounds.height;
  const availableWidth = resolvedWidth - paddingX;
  const availableHeight = resolvedHeight - paddingY;

  const flexNodes = buildFlexNodeTree(hostNode, children, styles);
  const flexRoot: FlexNode = {
    style: styles,
    computed: {
      left: containerX,
      right: 0,
      top: containerY,
      bottom: 0,
      width: resolvedWidth,
      height: resolvedHeight,
    },
    children: flexNodes,
    target: hostNode.displayObject,
    isDirty: true,
  };

  flexEngine.setRoot(flexRoot);
  flexEngine.setContext({
    width: resolvedWidth,
    height: resolvedHeight,
    x: containerX + paddingLeft,
    y: containerY + paddingTop,
  });

  const savedComputedWidth = flexRoot.computed.width;
  const savedComputedHeight = flexRoot.computed.height;

  flexEngine.calculateLayout();

  flexRoot.computed.width = savedComputedWidth;
  flexRoot.computed.height = savedComputedHeight;

  hostNode.setLayoutSize(resolvedWidth, resolvedHeight);

  for (const flexNode of flexNodes) {
    const targetNode = flexNode.target as unknown as BaseNode;
    targetNode.setLayoutPosition(flexNode.computed.left, flexNode.computed.top);
    targetNode.setLayoutSize(flexNode.computed.width, flexNode.computed.height);
  }

  if (justifyContent !== 'flex-start') {
    const totalChildSize = flexNodes.reduce((sum, fn) => {
      return sum + (isRow ? fn.computed.width : fn.computed.height);
    }, 0);
    const remainingSpace = (isRow ? availableWidth : availableHeight) - totalChildSize;

    if (remainingSpace > 0) {
      let offset = 0;
      switch (justifyContent) {
        case 'center':
          offset = remainingSpace / 2;
          break;
        case 'flex-end':
          offset = remainingSpace;
          break;
        case 'space-between':
          if (flexNodes.length > 1) {
            offset = 0;
          } else {
            offset = remainingSpace / 2;
          }
          break;
        case 'space-around':
          offset = remainingSpace / (flexNodes.length * 2);
          break;
        case 'space-evenly':
          offset = remainingSpace / (flexNodes.length + 1);
          break;
      }

      if (offset > 0) {
        for (const flexNode of flexNodes) {
          const targetNode = flexNode.target as unknown as BaseNode;
          if (isRow) {
            targetNode.setLayoutPosition(flexNode.computed.left + offset, flexNode.computed.top);
          } else {
            targetNode.setLayoutPosition(flexNode.computed.left, flexNode.computed.top + offset);
          }
        }
      }
    }
  }
}

function buildFlexNodeTree(parentNode: BaseNode, children: BaseNode[], containerStyles: LayoutStyles): FlexNode[] {
  const isRow = containerStyles.flexDirection === 'row' || containerStyles.flexDirection === 'row-reverse';
  const flexNodes: FlexNode[] = [];

  for (const child of children) {
    const childStyles = getLayoutStyles(child) ?? {};
    const computed: ComputedLayout = {
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
      width: child.getLayoutWidth() || 0,
      height: child.getLayoutHeight() || 0,
    };

    const childFlexBasis = childStyles.flexBasis;
    if (childFlexBasis !== undefined && childFlexBasis !== 'auto') {
      if (typeof childFlexBasis === 'number') {
        if (isRow) {
          computed.width = childFlexBasis;
        } else {
          computed.height = childFlexBasis;
        }
      }
    }

    const childWidth = childStyles.width;
    const childHeight = childStyles.height;
    if (childWidth !== undefined && childWidth !== 'auto' && childWidth !== 'intrinsic') {
      const resolved = resolveDimension(childWidth, parentNode.getLayoutWidth());
      if (resolved !== null) {
        computed.width = resolved;
      }
    }
    if (childHeight !== undefined && childHeight !== 'auto' && childHeight !== 'intrinsic') {
      const resolved = resolveDimension(childHeight, parentNode.getLayoutHeight());
      if (resolved !== null) {
        computed.height = resolved;
      }
    }

    const childFlexNode: FlexNode = {
      style: childStyles,
      computed,
      children: [],
      target: child.displayObject,
      isDirty: false,
    };

    flexNodes.push(childFlexNode);
  }

  return flexNodes;
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

export function removeLayoutNode(hostNode: BaseNode): void {
  layoutNodeCache.delete(hostNode);
}

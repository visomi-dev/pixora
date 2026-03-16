import type { Viewport } from '../app/types';
import type { BaseNode } from '../components/base-node';

import type { LayoutSpec } from './layout';

type Position = { x: number; y: number };
type Size = { height: number; width: number };
type Bounds = Position & Size;

export function applyLayout(node: BaseNode, spec: LayoutSpec, parentBounds: Bounds, viewport: Viewport): void {
  const activeSpec = resolveBreakpoints(spec, viewport);

  switch (activeSpec.type) {
    case 'fixed':
      applyFixed(node, activeSpec);
      break;
    case 'anchor':
      applyAnchor(node, activeSpec, parentBounds);
      break;
    case 'stack':
      applyStack(node, activeSpec);
      break;
    case 'auto':
      applyAuto(node, activeSpec, parentBounds);
      break;
    case 'percent':
      applyPercent(node, activeSpec, parentBounds);
      break;
  }
}

function resolveBreakpoints(spec: LayoutSpec, viewport: Viewport): LayoutSpec {
  if (!spec.breakpoints || spec.breakpoints.length === 0) {
    return spec;
  }

  let activeSpec = spec;

  for (const rule of spec.breakpoints) {
    const matchesMin = rule.minWidth === undefined || viewport.width >= rule.minWidth;
    const matchesMax = rule.maxWidth === undefined || viewport.width <= rule.maxWidth;

    if (matchesMin && matchesMax) {
      activeSpec = rule.override;
    }
  }

  return activeSpec;
}

function applyFixed(node: BaseNode, spec: Extract<LayoutSpec, { type: 'fixed' }>): void {
  if (spec.x !== undefined) {
    node.displayObject.x = spec.x;
  }

  if (spec.y !== undefined) {
    node.displayObject.y = spec.y;
  }

  if (spec.width !== undefined) {
    node.displayObject.width = spec.width;
  }

  if (spec.height !== undefined) {
    node.displayObject.height = spec.height;
  }

  if (spec.scale !== undefined) {
    node.displayObject.scale.set(spec.scale);
  }
}

function applyAnchor(node: BaseNode, spec: Extract<LayoutSpec, { type: 'anchor' }>, parentBounds: Bounds): void {
  const width = spec.relativeWidth !== undefined ? parentBounds.width * spec.relativeWidth : node.displayObject.width;
  const height =
    spec.relativeHeight !== undefined ? parentBounds.height * spec.relativeHeight : node.displayObject.height;

  let x = parentBounds.x;
  let y = parentBounds.y;

  if (spec.horizontal === 'center') {
    x += (parentBounds.width - width) / 2;
  } else if (spec.horizontal === 'end') {
    x += parentBounds.width - width;
  }

  if (spec.vertical === 'center') {
    y += (parentBounds.height - height) / 2;
  } else if (spec.vertical === 'end') {
    y += parentBounds.height - height;
  }

  x += spec.offsetX ?? 0;
  y += spec.offsetY ?? 0;

  node.displayObject.x = x;
  node.displayObject.y = y;

  if (spec.relativeWidth !== undefined) {
    node.displayObject.width = width;
  }

  if (spec.relativeHeight !== undefined) {
    node.displayObject.height = height;
  }
}

function applyStack(node: BaseNode, spec: Extract<LayoutSpec, { type: 'stack' }>): void {
  const gap = spec.gap ?? 0;
  const padding = spec.padding ?? 0;
  const isVertical = spec.direction === 'vertical';

  let currentPosition = padding;
  let maxCrossSize = 0;

  for (const child of node.getChildren()) {
    if (!child.displayObject.visible) {
      continue;
    }

    if (isVertical) {
      child.displayObject.y = currentPosition;
      currentPosition += child.displayObject.height + gap;
      maxCrossSize = Math.max(maxCrossSize, child.displayObject.width);
    } else {
      child.displayObject.x = currentPosition;
      currentPosition += child.displayObject.width + gap;
      maxCrossSize = Math.max(maxCrossSize, child.displayObject.height);
    }
  }

  currentPosition = Math.max(0, currentPosition - gap) + padding;

  if (spec.fitContent) {
    if (isVertical) {
      node.displayObject.width = maxCrossSize + padding * 2;
      node.displayObject.height = currentPosition;
    } else {
      node.displayObject.width = currentPosition;
      node.displayObject.height = maxCrossSize + padding * 2;
    }
  }

  const containerWidth = node.displayObject.width;
  const containerHeight = node.displayObject.height;

  for (const child of node.getChildren()) {
    if (!child.displayObject.visible) {
      continue;
    }

    if (isVertical) {
      if (spec.align === 'center') {
        child.displayObject.x = (containerWidth - child.displayObject.width) / 2;
      } else if (spec.align === 'end') {
        child.displayObject.x = containerWidth - child.displayObject.width - padding;
      } else {
        child.displayObject.x = padding;
      }
    } else {
      if (spec.align === 'center') {
        child.displayObject.y = (containerHeight - child.displayObject.height) / 2;
      } else if (spec.align === 'end') {
        child.displayObject.y = containerHeight - child.displayObject.height - padding;
      } else {
        child.displayObject.y = padding;
      }
    }
  }
}

function applyAuto(node: BaseNode, spec: Extract<LayoutSpec, { type: 'auto' }>, _parentBounds: Bounds): void {
  if (spec.width === 'content' || spec.width === 'auto') {
    let contentWidth = 0;

    for (const child of node.getChildren()) {
      if (child.displayObject.visible) {
        contentWidth = Math.max(contentWidth, child.displayObject.x + child.displayObject.width);
      }
    }

    node.displayObject.width = contentWidth;
  } else if (spec.width === 'fill') {
    node.displayObject.width = _parentBounds.width;
  }

  if (spec.height === 'content' || spec.height === 'auto') {
    let contentHeight = 0;

    for (const child of node.getChildren()) {
      if (child.displayObject.visible) {
        contentHeight = Math.max(contentHeight, child.displayObject.y + child.displayObject.height);
      }
    }

    node.displayObject.height = contentHeight;
  } else if (spec.height === 'fill') {
    node.displayObject.height = _parentBounds.height;
  }
}

function applyPercent(node: BaseNode, spec: Extract<LayoutSpec, { type: 'percent' }>, parentBounds: Bounds): void {
  if (spec.width !== undefined) {
    node.displayObject.width = parentBounds.width * spec.width;
  }

  if (spec.height !== undefined) {
    node.displayObject.height = parentBounds.height * spec.height;
  }

  let x = parentBounds.x;
  let y = parentBounds.y;

  if (spec.horizontal === 'center') {
    x += (parentBounds.width - node.displayObject.width) / 2;
  } else if (spec.horizontal === 'end') {
    x += parentBounds.width - node.displayObject.width;
  }

  if (spec.vertical === 'center') {
    y += (parentBounds.height - node.displayObject.height) / 2;
  } else if (spec.vertical === 'end') {
    y += parentBounds.height - node.displayObject.height;
  }

  x += spec.offsetX ?? 0;
  y += spec.offsetY ?? 0;

  node.displayObject.x = x;
  node.displayObject.y = y;
}

import type { Container } from 'pixi.js';

import type { ApplicationContext } from '../app/types';
import type { BaseNode } from '../components/base-node';

import { createHostTypeRegistry, type HostTypeRegistry } from './host-types';
import type { MountedNode, MountedTree } from './mounted-node';
import { normalizeChildren } from './normalize';
import { IMPERATIVE_MARKER, type HostType, type ImperativeNodeProps, type PixoraNode } from './types';

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Mounts a declarative `PixoraNode` tree into a pixi `Container`, producing
 * a `MountedTree` that tracks the relationship between definitions and
 * live display objects.
 *
 * This performs **initial mount only**. Reconciliation is handled separately
 * in Phase 11.
 */
export function mountTree(definition: PixoraNode, parent: Container, context: ApplicationContext): MountedTree {
  const registry = createHostTypeRegistry();
  const root = mountNode(definition, null, registry);

  parent.addChild(root.hostNode.displayObject);

  return { context, root };
}

/**
 * Tears down a previously mounted tree. Removes the root display object from
 * its parent container and destroys all managed host nodes.
 *
 * Imperative bridge nodes are detached but **not** destroyed — the consumer
 * owns their lifecycle.
 */
export function unmountTree(tree: MountedTree): void {
  const { root } = tree;
  const parentContainer = root.hostNode.displayObject.parent;

  if (parentContainer) {
    parentContainer.removeChild(root.hostNode.displayObject);
  }

  unmountNode(root);
}

// ---------------------------------------------------------------------------
// Internal
// ---------------------------------------------------------------------------

function mountNode(definition: PixoraNode, parentMounted: MountedNode | null, registry: HostTypeRegistry): MountedNode {
  if (definition.type === IMPERATIVE_MARKER) {
    return mountImperativeNode(definition, parentMounted);
  }

  const hostType = definition.type as HostType;
  const descriptor = registry[hostType];

  if (!descriptor) {
    throw new Error(
      `Unknown host type: "${String(definition.type)}". Valid types: container, text, sprite, box, button.`,
    );
  }

  // The type is guaranteed correct by the HostType ↔ HostPropsMap relationship,
  // but TS cannot narrow a mapped-type lookup through a runtime variable.
  const hostNode = (descriptor.create as (props: unknown) => BaseNode)(definition.props);
  const normalizedChildren = normalizeChildren(definition.children);

  const mounted: MountedNode = {
    children: [],
    definition,
    hostNode,
    isImperative: false,
    parent: parentMounted,
  };

  for (const child of normalizedChildren) {
    const mountedChild = mountNode(child, mounted, registry);

    hostNode.addChild(mountedChild.hostNode);
    mounted.children.push(mountedChild);
  }

  return mounted;
}

function mountImperativeNode(definition: PixoraNode, parentMounted: MountedNode | null): MountedNode {
  const props = definition.props as ImperativeNodeProps;

  return {
    children: [],
    definition,
    hostNode: props.node,
    isImperative: true,
    parent: parentMounted,
  };
}

function unmountNode(mounted: MountedNode): void {
  for (const child of mounted.children) {
    unmountNode(child);
  }

  mounted.children.length = 0;

  if (mounted.isImperative) {
    // Detach from parent but do NOT destroy — consumer owns the lifecycle.
    const parentDisplay = mounted.hostNode.displayObject.parent;

    if (parentDisplay) {
      parentDisplay.removeChild(mounted.hostNode.displayObject);
    }
  } else {
    mounted.hostNode.destroy();
  }
}

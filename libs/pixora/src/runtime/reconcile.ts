import type { BaseNode } from '../components/base-node';

import { createHostTypeRegistry, type HostTypeRegistry } from './host-types';
import type { MountedNode, MountedTree } from './mounted-node';
import { normalizeChildren } from './normalize';
import { IMPERATIVE_MARKER, type HostType, type PixoraNode } from './types';

export type ReconcileResult = {
  mounted: MountedNode;
  action: 'patch' | 'replace' | 'mount' | 'none';
};

function isImperativeType(type: unknown): boolean {
  return type === IMPERATIVE_MARKER;
}

function reconcileNode(oldNode: MountedNode, newDefinition: PixoraNode, registry: HostTypeRegistry): ReconcileResult {
  if (oldNode.isImperative) {
    return reconcileImperativeNode(oldNode, newDefinition, registry);
  }

  const oldDefinition = oldNode.definition;

  if (isImperativeType(oldDefinition.type) !== isImperativeType(newDefinition.type)) {
    return replaceNode(oldNode, newDefinition, registry);
  }

  if (isImperativeType(newDefinition.type)) {
    return reconcileImperativeNode(oldNode, newDefinition, registry);
  }

  patchNode(oldNode, oldDefinition, newDefinition, registry);

  const oldChildren = oldNode.children;
  const newChildren = normalizeChildren(newDefinition.children);
  validateChildKeys(newDefinition, newChildren);

  reconcileChildren(oldNode, oldChildren, newChildren, registry);

  oldNode.definition = newDefinition;

  return { mounted: oldNode, action: 'patch' };
}

function patchNode(
  oldNode: MountedNode,
  oldDefinition: PixoraNode,
  newDefinition: PixoraNode,
  registry: HostTypeRegistry,
): void {
  const hostType = oldDefinition.type as HostType;

  if (isImperativeType(hostType)) {
    return;
  }

  const descriptor = registry[hostType];

  if (descriptor && oldNode.hostNode.displayObject) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (descriptor.patch as any)(oldNode.hostNode, oldDefinition.props, newDefinition.props);
  }
}

function reconcileImperativeNode(
  oldNode: MountedNode,
  newDefinition: PixoraNode,
  registry: HostTypeRegistry,
): ReconcileResult {
  if (!isImperativeType(newDefinition.type)) {
    return replaceNode(oldNode, newDefinition, registry);
  }

  const newProps = newDefinition.props as { readonly [IMPERATIVE_MARKER]: true; readonly node: BaseNode };

  if (oldNode.hostNode !== newProps.node) {
    return replaceNode(oldNode, newDefinition, registry);
  }

  oldNode.definition = newDefinition;

  return { mounted: oldNode, action: 'patch' };
}

function replaceNode(oldNode: MountedNode, newDefinition: PixoraNode, registry: HostTypeRegistry): ReconcileResult {
  const parent = oldNode.parent;
  const displayParent = oldNode.hostNode.displayObject.parent;

  unmountNode(oldNode);

  let newMounted: MountedNode;

  if (isImperativeType(newDefinition.type)) {
    newMounted = mountImperativeNode(newDefinition, parent);
  } else {
    newMounted = mountNode(newDefinition, parent, registry);
  }

  if (displayParent && parent) {
    const parentBaseNode = parent.hostNode;
    const oldDisplayObject = oldNode.hostNode.displayObject;
    const newDisplayObject = newMounted.hostNode.displayObject;

    const oldIndex = parentBaseNode.displayObject.getChildIndex(oldDisplayObject);

    if (oldIndex !== -1) {
      parentBaseNode.displayObject.removeChildAt(oldIndex);
      parentBaseNode.displayObject.addChildAt(newDisplayObject, oldIndex);
    } else {
      parentBaseNode.displayObject.addChild(newDisplayObject);
    }
  }

  if (parent) {
    const childArray = parent.children;
    const childIndex = childArray.indexOf(oldNode);

    if (childIndex !== -1) {
      parent.children[childIndex] = newMounted;
    }
  }

  return { mounted: newMounted, action: 'replace' };
}

function reconcileChildren(
  parent: MountedNode,
  oldChildren: readonly MountedNode[],
  newChildrenDefinitions: readonly PixoraNode[],
  registry: HostTypeRegistry,
): void {
  const oldKeys = new Map<string | number, MountedNode>();
  const oldKeyedChildren: MountedNode[] = [];
  const oldPositionedChildren: MountedNode[] = [];

  for (const child of oldChildren) {
    if (child.definition.key !== undefined) {
      oldKeys.set(child.definition.key, child);
      oldKeyedChildren.push(child);
    } else {
      oldPositionedChildren.push(child);
    }
  }

  const newKeyedDefinitions: { key: string | number; definition: PixoraNode }[] = [];
  const newPositionedDefinitions: PixoraNode[] = [];

  for (let i = 0; i < newChildrenDefinitions.length; i++) {
    const def = newChildrenDefinitions[i];

    if (def.key !== undefined) {
      newKeyedDefinitions.push({ key: def.key, definition: def });
    } else {
      newPositionedDefinitions.push(def);
    }
  }

  const resultChildren: MountedNode[] = [];
  let oldPositionedIndex = 0;
  let newKeyedIndex = 0;
  let newPositionedIndex = 0;

  while (newKeyedIndex < newKeyedDefinitions.length || newPositionedIndex < newPositionedDefinitions.length) {
    const newKeyed = newKeyedDefinitions[newKeyedIndex];
    const newPositioned = newPositionedDefinitions[newPositionedIndex];

    if (newKeyed && oldKeys.has(newKeyed.key)) {
      const oldMatched = oldKeys.get(newKeyed.key)!;
      oldKeys.delete(newKeyed.key);

      const result = reconcileNode(oldMatched, newKeyed.definition, registry);
      resultChildren.push(result.mounted);

      newKeyedIndex++;

      continue;
    }

    if (newKeyed && newPositioned && oldPositionedIndex < oldPositionedChildren.length) {
      const oldPositioned = oldPositionedChildren[oldPositionedIndex];

      if (shouldReuseByType(oldPositioned.definition, newPositioned)) {
        const result = reconcileNode(oldPositioned, newPositioned, registry);
        resultChildren.push(result.mounted);

        oldPositionedIndex++;
        newPositionedIndex++;

        continue;
      }
    }

    if (newPositioned && oldPositionedIndex < oldPositionedChildren.length) {
      const oldPositioned = oldPositionedChildren[oldPositionedIndex];

      if (shouldReuseByType(oldPositioned.definition, newPositioned)) {
        const result = reconcileNode(oldPositioned, newPositioned, registry);
        resultChildren.push(result.mounted);

        oldPositionedIndex++;
        newPositionedIndex++;

        continue;
      }
    }

    if (newKeyed && oldKeys.has(newKeyed.key)) {
      const oldMatched = oldKeys.get(newKeyed.key)!;
      oldKeys.delete(newKeyed.key);

      const result = reconcileNode(oldMatched, newKeyed.definition, registry);
      resultChildren.push(result.mounted);

      newKeyedIndex++;

      continue;
    }

    if (newPositioned) {
      const newMounted = mountNode(newPositioned, parent, registry);
      parent.hostNode.addChild(newMounted.hostNode);
      resultChildren.push(newMounted);

      newPositionedIndex++;

      continue;
    }

    if (newKeyed) {
      const newMounted = mountNode(newKeyed.definition, parent, registry);
      parent.hostNode.addChild(newMounted.hostNode);
      resultChildren.push(newMounted);

      newKeyedIndex++;

      continue;
    }
  }

  for (const [, oldUnmatched] of oldKeys) {
    unmountNode(oldUnmatched);
  }

  for (let i = oldPositionedIndex; i < oldPositionedChildren.length; i++) {
    unmountNode(oldPositionedChildren[i]);
  }

  parent.children.length = 0;

  for (const child of resultChildren) {
    parent.children.push(child);
  }
}

function shouldReuseByType(oldDef: PixoraNode, newDef: PixoraNode): boolean {
  const oldIsImperative = isImperativeType(oldDef.type);
  const newIsImperative = isImperativeType(newDef.type);

  if (oldIsImperative || newIsImperative) {
    return oldIsImperative === newIsImperative;
  }

  return oldDef.type === newDef.type;
}

function mountNode(definition: PixoraNode, parentMounted: MountedNode | null, registry: HostTypeRegistry): MountedNode {
  if (isImperativeType(definition.type)) {
    return mountImperativeNode(definition, parentMounted);
  }

  const hostType = definition.type as HostType;
  const descriptor = registry[hostType];

  if (!descriptor) {
    throw new Error(
      `Unknown host type: "${String(definition.type)}". Valid types: container, text, sprite, box, button.`,
    );
  }

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
  const props = definition.props as { readonly [IMPERATIVE_MARKER]: true; readonly node: BaseNode };

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
    const imperativeProps = mounted.definition.props as {
      readonly [IMPERATIVE_MARKER]: true;
      readonly managed?: boolean;
    };
    const parentDisplay = mounted.hostNode.displayObject.parent;

    if (parentDisplay) {
      parentDisplay.removeChild(mounted.hostNode.displayObject);
    }

    if (imperativeProps.managed) {
      mounted.hostNode.destroy();
    }
  } else {
    mounted.hostNode.destroy();
  }
}

let registryInstance: HostTypeRegistry | null = null;

function getRegistry(): HostTypeRegistry {
  if (!registryInstance) {
    registryInstance = createHostTypeRegistry();
  }

  return registryInstance;
}

export function updateTree(tree: MountedTree, newDefinition: PixoraNode): void {
  const reg = getRegistry();
  reconcileNode(tree.root, newDefinition, reg);
}

function validateChildKeys(parent: PixoraNode, children: readonly PixoraNode[]): void {
  const seenKeys = new Set<string | number>();

  for (const child of children) {
    if (child.key === undefined) {
      continue;
    }

    if (seenKeys.has(child.key)) {
      throw new Error(`Duplicate child key "${child.key}" found under "${String(parent.type)}".`);
    }

    seenKeys.add(child.key);
  }
}

import type { MountedNode, MountedTree } from './mounted-node';

export type DebugNodeInfo = {
  children: DebugNodeInfo[];
  depth: number;
  hasKey: boolean;
  hostType: string | null;
  id: string;
  isComponent: boolean;
  key: string | number | undefined;
  props: Record<string, unknown>;
};

export type DebugTreeStats = {
  componentNodes: number;
  hostNodes: number;
  imperativeNodes: number;
  keyedNodes: number;
  totalNodes: number;
};

const nodeIdCounter = new WeakMap<MountedNode, string>();

function getOrCreateNodeId(node: MountedNode): string {
  let id = nodeIdCounter.get(node);

  if (!id) {
    id = `node_${Math.random().toString(36).substring(2, 9)}`;
    nodeIdCounter.set(node, id);
  }

  return id;
}

export function inspectNode(node: MountedNode, depth = 0): DebugNodeInfo {
  const def = node.definition;
  const isComponent = typeof def.type === 'function';
  const isImperative = node.isImperative;
  const hostType = isImperative ? 'imperative' : typeof def.type === 'string' ? def.type : null;

  return {
    children: node.children.map((child) => inspectNode(child, depth + 1)),
    depth,
    hasKey: def.key !== undefined,
    hostType,
    id: getOrCreateNodeId(node),
    isComponent,
    key: def.key,
    props: { ...def.props } as Record<string, unknown>,
  };
}

export function inspectTree(tree: MountedTree): DebugNodeInfo {
  return inspectNode(tree.root);
}

export function getTreeStats(tree: MountedTree): DebugTreeStats {
  let totalNodes = 0;
  let componentNodes = 0;
  let hostNodes = 0;
  let imperativeNodes = 0;
  let keyedNodes = 0;

  function traverse(node: MountedNode): void {
    totalNodes++;

    if (node.isImperative) {
      imperativeNodes++;
    } else if (typeof node.definition.type === 'function') {
      componentNodes++;
    } else if (typeof node.definition.type === 'string') {
      hostNodes++;
    }

    if (node.definition.key !== undefined) {
      keyedNodes++;
    }

    for (const child of node.children) {
      traverse(child);
    }
  }

  traverse(tree.root);

  return {
    componentNodes,
    hostNodes,
    imperativeNodes,
    keyedNodes,
    totalNodes,
  };
}

export function formatTree(tree: MountedTree): string {
  const info = inspectTree(tree);
  return formatNodeInfo(info);
}

function formatNodeInfo(info: DebugNodeInfo, lines: string[] = []): string {
  const indent = '  '.repeat(info.depth);
  const keyPart = info.key !== undefined ? ` [key: ${info.key}]` : '';
  const typePart = info.isComponent ? `<Component>` : (info.hostType ?? '<unknown>');
  const idPart = `[${info.id}]`;

  lines.push(`${indent}${idPart} ${typePart}${keyPart}`);

  for (const child of info.children) {
    formatNodeInfo(child, lines);
  }

  return lines.join('\n');
}

export function findNodeByKey(tree: MountedTree, key: string | number): MountedNode | null {
  function search(node: MountedNode): MountedNode | null {
    if (node.definition.key === key) {
      return node;
    }

    for (const child of node.children) {
      const found = search(child);

      if (found) {
        return found;
      }
    }

    return null;
  }

  return search(tree.root);
}

export function findNodesByType(tree: MountedTree, type: string): MountedNode[] {
  const results: MountedNode[] = [];

  function search(node: MountedNode): void {
    if (node.definition.type === type) {
      results.push(node);
    }

    for (const child of node.children) {
      search(child);
    }
  }

  search(tree.root);

  return results;
}

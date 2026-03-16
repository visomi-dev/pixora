import type { BaseNode } from '../components/base-node';

import { IMPERATIVE_MARKER, type ImperativeNodeProps, type PixoraNode } from './types';

/**
 * Wraps an existing imperative `BaseNode` instance as a leaf in a declarative
 * tree. The renderer will mount it directly without creating a new instance.
 *
 * **Lifecycle ownership:** The node is NOT managed by the declarative runtime.
 * On unmount the renderer detaches the display object from its parent but does
 * NOT call `destroy()` — the consumer retains full ownership.
 *
 * Children of an imperative node are not managed by the declarative runtime.
 */
export function imperative(node: BaseNode, key?: string | number): PixoraNode {
  const props: ImperativeNodeProps = {
    [IMPERATIVE_MARKER]: true,
    node,
  };

  return Object.freeze({
    children: Object.freeze([]),
    key,
    props,
    type: IMPERATIVE_MARKER,
  }) as unknown as PixoraNode;
}

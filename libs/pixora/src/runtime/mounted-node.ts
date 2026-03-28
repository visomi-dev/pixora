import type { ApplicationContext } from '../app/types';
import type { BaseNode } from '../components/base-node';
import type { PixoraNode } from './types';
import type { ReactiveContext } from './reactive';

// ---------------------------------------------------------------------------
// Mounted instance
// ---------------------------------------------------------------------------

/**
 * Represents a mounted instance in the host tree. Links the declarative
 * `PixoraNode` definition to the imperative `BaseNode` it produced.
 *
 * - `definition` is mutable — reconciliation (Phase 11) swaps it after patching.
 * - `hostNode` is readonly — created once and reused across updates.
 * - `children` is mutable — reconciliation splices into it.
 * - `parent` enables upward traversal for layout invalidation (Phase 12+).
 * - `isImperative` marks nodes created via the `imperative()` bridge. The
 *   renderer will NOT call `destroy()` on these nodes during unmount.
 */
export type MountedNode = {
  /** Mounted children in order. */
  readonly children: MountedNode[];
  /** The declarative definition that produced this mount. */
  definition: PixoraNode;
  /** The imperative host node instance. */
  readonly hostNode: BaseNode;
  /** Whether this node was created via the `imperative()` bridge. */
  readonly isImperative: boolean;
  /** The parent MountedNode, or null for the root. */
  parent: MountedNode | null;
  /** Reactive context for functional components with signal dependencies. */
  reactiveContext?: ReactiveContext;
};

// ---------------------------------------------------------------------------
// Mounted tree
// ---------------------------------------------------------------------------

/**
 * The root anchor for a mounted declarative tree. Holds the root `MountedNode`
 * and the `ApplicationContext` it belongs to.
 */
export type MountedTree = {
  /** The ApplicationContext for this tree. */
  readonly context: ApplicationContext;
  /** The root MountedNode. */
  readonly root: MountedNode;
};

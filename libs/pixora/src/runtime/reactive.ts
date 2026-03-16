import { effect, type ReadonlySignal } from '../state/signal';

import type { MountedNode, MountedTree } from './mounted-node';
import { updateTree } from './reconcile';
import type { AnyPixoraComponent } from './types';

export type ReactiveContext = {
  dispose: () => void;
};

export function createReactiveEffect(
  component: AnyPixoraComponent,
  props: Record<string, unknown>,
  mountedNode: MountedNode,
): ReactiveContext {
  const renderAndReconcile = (): void => {
    const newDefinition = component(props);

    updateTree({ context: null as never, root: mountedNode }, newDefinition);
  };

  const trackedEffect = effect(renderAndReconcile);

  const dispose = (): void => {
    trackedEffect.dispose();
  };

  return { dispose };
}

export function createReactiveSubtreeEffect(
  component: AnyPixoraComponent,
  props: Record<string, unknown>,
  mountedNode: MountedNode,
  tree: MountedTree,
): ReactiveContext {
  const renderAndReconcile = (): void => {
    const newDefinition = component(props);

    updateTree({ context: tree.context, root: mountedNode }, newDefinition);
  };

  const trackedEffect = effect(renderAndReconcile);

  const dispose = (): void => {
    trackedEffect.dispose();
  };

  return { dispose };
}

export function isSignal(value: unknown): value is ReadonlySignal<unknown> {
  return typeof value === 'object' && value !== null && 'get' in value && 'subscribe' in value;
}

export function unwrapSignal<T>(value: T): T {
  if (isSignal(value)) {
    return value.get() as T;
  }

  return value;
}

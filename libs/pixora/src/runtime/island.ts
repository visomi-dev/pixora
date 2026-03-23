import { ContainerNode } from '../components/container-node';

import { IMPERATIVE_MARKER } from './types';

import type { ApplicationContext } from '../app/types';
import type { Disposable } from '../utils/disposable';
import type { PixoraNode } from './types';

type Cleanup = Disposable | (() => void) | void;

export type IslandSetupContext = {
  context: ApplicationContext;
  root: ContainerNode;
};

export type IslandOptions = {
  context: ApplicationContext;
  key?: string | number;
  setup: (context: IslandSetupContext) => Cleanup;
};

class IslandNode extends ContainerNode {
  constructor(options: IslandOptions) {
    super();
    this.displayObject.layout = null;

    const cleanup = options.setup({ context: options.context, root: this });

    if (typeof cleanup === 'function') {
      this.addDisposable({ dispose: cleanup });
    } else if (cleanup) {
      this.addDisposable(cleanup);
    }
  }
}

export function island(options: IslandOptions): PixoraNode {
  const node = new IslandNode(options);

  return Object.freeze({
    children: Object.freeze([]),
    key: options.key,
    props: {
      [IMPERATIVE_MARKER]: true,
      managed: true,
      node,
    },
    type: IMPERATIVE_MARKER,
  }) as PixoraNode;
}

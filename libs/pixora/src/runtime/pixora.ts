import type { AssetManifest } from '../assets/create-asset-registry';
import { createpixoraApp } from '../app/create-pixyn-app';
import type { ApplicationContext, pixoraApp, Viewport } from '../app/types';
import { Scene } from '../scenes/types';
import type { SceneDefinition, SceneKey } from '../scenes/types';
import type { ServiceDescriptor } from '../services/create-service-registry';

import { createScheduler, type Scheduler } from './scheduler';
import type { MountedTree } from './mounted-node';
import { mountTree, unmountTree } from './renderer';
import type { PixoraNode } from './types';

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

export type DeclarativeScene = {
  cache?: boolean;
  key: string;
  kind?: 'overlay' | 'scene';
  render: (context: ApplicationContext) => PixoraNode;
};

export type ImperativeSceneDefinition = {
  cache?: boolean;
  key: string;
  kind?: 'overlay' | 'scene';
  create: () => Scene;
};

export type PixoraScene = DeclarativeScene | ImperativeSceneDefinition;

export type PixoraAppOptions = {
  assets?: AssetManifest;
  autoStart?: boolean;
  backgroundColor?: number;
  devtools?: boolean;
  height?: number;
  initialScene: string;
  mount: HTMLElement;
  scenes: readonly PixoraScene[];
  services?: readonly ServiceDescriptor[];
  width?: number;
};

export type PixoraRuntime = pixoraApp & {
  /** The mounted trees, keyed by scene key. Populated as scenes mount. */
  readonly mountedTrees: ReadonlyMap<string, MountedTree>;
  /** Mark a scene as dirty, triggering a re-render on the next update tick. */
  markSceneDirty(sceneKey: string): void;
};

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------

/**
 * Creates a pixora application using a declarative scene model.
 *
 * Each scene is described as a `render` function that returns a `PixoraNode`
 * tree. The runtime mounts these trees into the pixi stage via the existing
 * scene manager.
 *
 * Internally delegates to `createpixoraApp` — the full imperative subsystem
 * (ticker, viewport, services, events, assets) remains unchanged.
 */
export async function pixora(options: PixoraAppOptions): Promise<PixoraRuntime> {
  const mountedTrees = new Map<string, MountedTree>();
  const adapters = new Map<string, DeclarativeSceneAdapter>();

  const imperativeScenes = options.scenes.filter((s): s is ImperativeSceneDefinition => 'create' in s);
  const declarativeScenes = options.scenes.filter((s): s is DeclarativeScene => 'render' in s);

  const imperativeSceneDefinitions: SceneDefinition[] = imperativeScenes.map((scene) => ({
    cache: scene.cache,
    create: scene.create,
    key: scene.key,
    kind: scene.kind,
  }));

  const declarativeSceneDefinitions: SceneDefinition[] = declarativeScenes.map((scene) => ({
    cache: scene.cache,
    create: () => {
      const adapter = new DeclarativeSceneAdapter(scene.key, scene.render, mountedTrees, scheduler);
      adapters.set(scene.key, adapter);

      return adapter;
    },
    key: scene.key,
    kind: scene.kind,
  }));

  const scheduler = createScheduler();

  const app = await createpixoraApp({
    assets: options.assets,
    autoStart: options.autoStart,
    backgroundColor: options.backgroundColor,
    devtools: options.devtools,
    height: options.height,
    initialScene: options.initialScene as SceneKey,
    mount: options.mount,
    scenes: [...imperativeSceneDefinitions, ...declarativeSceneDefinitions],
    services: options.services,
    width: options.width,
  });

  return {
    ...app,
    mountedTrees,
    markSceneDirty(sceneKey: string): void {
      const adapter = adapters.get(sceneKey);

      if (adapter) {
        adapter.markDirty();
      }
    },
  };
}

// ---------------------------------------------------------------------------
// Internal adapter
// ---------------------------------------------------------------------------

/**
 * Bridges a declarative scene definition to the imperative `Scene` class.
 * The scene manager sees this as a regular scene.
 */
class DeclarativeSceneAdapter extends Scene {
  override readonly key: SceneKey;
  private mountedTree: MountedTree | null = null;
  private previousDefinition: PixoraNode | null = null;
  private isScheduled = false;

  constructor(
    key: string,
    private readonly renderFn: (context: ApplicationContext) => PixoraNode,
    private readonly mountedTrees: Map<string, MountedTree>,
    private readonly scheduler: Scheduler,
  ) {
    super();
    this.key = key;
  }

  override mount(): void {
    const context = this.getContext();
    const tree = this.renderFn(context);

    this.mountedTree = mountTree(tree, this.root, context);
    this.mountedTrees.set(this.key, this.mountedTree);
    this.previousDefinition = tree;
  }

  override update(_deltaMs: number): void {
    if (!this.mountedTree || this.isScheduled) {
      return;
    }

    this.isScheduled = true;
    const context = this.getContext();

    this.scheduler.scheduleUpdate(this.key, this.mountedTree, this.renderFn, context, 1);

    this.scheduler.schedulePostUpdate(() => {
      this.isScheduled = false;
    });
  }

  override resize(_viewport: Viewport): void {
    if (!this.mountedTree || this.isScheduled) {
      return;
    }

    this.isScheduled = true;
    const context = this.getContext();

    this.scheduler.scheduleUpdate(this.key, this.mountedTree, this.renderFn, context, 2);

    this.scheduler.schedulePostUpdate(() => {
      this.isScheduled = false;
    });
  }

  override activate(): void {
    if (!this.mountedTree || this.isScheduled) {
      return;
    }

    this.isScheduled = true;
    const context = this.getContext();

    this.scheduler.scheduleUpdate(this.key, this.mountedTree, this.renderFn, context, 1);

    this.scheduler.schedulePostUpdate(() => {
      this.isScheduled = false;
    });
  }

  override destroy(): void {
    if (this.mountedTree) {
      unmountTree(this.mountedTree);
      this.mountedTrees.delete(this.key);
      this.mountedTree = null;
      this.previousDefinition = null;
    }
  }

  /**
   * Marks the scene as needing re-render on the next update tick.
   * Call this after making changes that should trigger a declarative update.
   */
  markDirty(): void {
    if (!this.mountedTree || this.isScheduled) {
      return;
    }

    this.isScheduled = true;
    const context = this.getContext();

    this.scheduler.scheduleUpdate(this.key, this.mountedTree, this.renderFn, context, 1);

    this.scheduler.schedulePostUpdate(() => {
      this.isScheduled = false;
    });
  }
}

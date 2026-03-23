import { Texture } from 'pixi.js';

import { createPixoraApp } from '../app/create-pixora-app';
import { Scene } from '../scenes/types';
import { effect } from '../state/signal';

import { createScheduler, type Scheduler } from './scheduler';
import { button } from './button';
import { withApplicationContext } from './current-context';
import { island } from './island';
import { mountTree, unmountTree } from './renderer';
import { updateTree } from './reconcile';
import { container, sprite, text } from './create-node';

import type { PixoraComponent, PixoraComponentProps, PixoraNode } from './types';
import type { MountedTree } from './mounted-node';
import type { Disposable } from '../utils/disposable';
import type { ServiceDescriptor } from '../services/create-service-registry';
import type { SceneDefinition, SceneKey } from '../scenes/types';
import type { ApplicationContext, pixoraApp, Viewport } from '../app/types';
import type { AssetManifest } from '../assets/create-asset-registry';

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

export type DeclarativeScene = {
  cache?: boolean;
  key: string;
  kind?: 'overlay' | 'scene';
  render: (context: ApplicationContext) => PixoraNode;
  updateMode?: 'frame' | 'reactive';
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
  loadingScreen?: {
    backgroundColor?: number;
    text?: string;
    textColor?: number;
  };
  mount: HTMLElement;
  preload?: readonly { key: string; src: string }[];
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
// Component API
// ---------------------------------------------------------------------------

export type PixoraComponentAPI = {
  /** Creates a composed button node */
  button: typeof button;
  /** Creates a container node */
  container: typeof container;
  /** Creates a managed island node */
  island: typeof island;
  /** Creates a scene definition */
  scene: (
    sceneDef:
      | { key: string; render: (context: ApplicationContext) => PixoraNode; updateMode?: 'frame' | 'reactive' }
      | ((context: ApplicationContext) => PixoraNode),
  ) => { key: string; render: (context: ApplicationContext) => PixoraNode; updateMode?: 'frame' | 'reactive' };
  /** Creates a sprite node */
  sprite: typeof sprite;
  /** Creates a text node */
  text: typeof text;
};

export type PixoraFn = {
  (options: PixoraAppOptions): Promise<PixoraRuntime>;
  button: typeof button;
  component<Props extends PixoraComponentProps>(renderFn: PixoraComponent<Props>): PixoraComponent<Props>;
  container: typeof container;
  island: typeof island;
  scene: PixoraComponentAPI['scene'];
  sprite: typeof sprite;
  text: typeof text;
  texture: (src: string) => Texture;
};

const componentAPI: PixoraComponentAPI = {
  button,
  container,
  island,
  scene(
    sceneDef:
      | { key: string; render: (context: ApplicationContext) => PixoraNode; updateMode?: 'frame' | 'reactive' }
      | ((context: ApplicationContext) => PixoraNode),
  ): { key: string; render: (context: ApplicationContext) => PixoraNode; updateMode?: 'frame' | 'reactive' } {
    if (typeof sceneDef === 'function') {
      return { key: `scene_${Math.random().toString(36).substring(2, 9)}`, render: sceneDef };
    }
    return sceneDef;
  },
  sprite,
  text,
};

// ---------------------------------------------------------------------------
// Imperative App Factory
// ---------------------------------------------------------------------------

async function createPixoraAppInstance(options: PixoraAppOptions): Promise<PixoraRuntime> {
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
      const adapter = new DeclarativeSceneAdapter(
        scene.key,
        scene.render,
        mountedTrees,
        scheduler,
        scene.updateMode ?? 'reactive',
      );
      adapters.set(scene.key, adapter);

      return adapter;
    },
    key: scene.key,
    kind: scene.kind,
  }));

  const scheduler = createScheduler();

  const app = await createPixoraApp({
    assets: options.assets,
    autoStart: options.autoStart,
    backgroundColor: options.backgroundColor,
    devtools: options.devtools,
    height: options.height,
    initialScene: options.initialScene as SceneKey,
    loadingScreen: options.loadingScreen,
    mount: options.mount,
    preload: options.preload,
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
// Callable Function with Properties
// ---------------------------------------------------------------------------

/**
 * Creates a pixora application using a declarative scene model.
 *
 * Each scene is described as a `render` function that returns a `PixoraNode`
 * tree. The runtime mounts these trees into the pixi stage via the existing
 * scene manager.
 *
 * Internally delegates to `createPixoraApp` — the full imperative subsystem
 * (ticker, viewport, services, events, assets) remains unchanged.
 *
 * @example
 * ```ts
 * const app = pixora({
 *   mount: document.getElementById('app')!,
 *   initialScene: 'main',
 *   scenes: [{ key: 'main', render: () => pixora.container({}) }]
 * });
 * ```
 *
 * @example
 * ```ts
 * const myContainer = pixora.container({ style: { width: 100 }, children: [pixora.text({ content: 'Hello' })] });
 * const myButton = pixora.button({
 *   label: 'PrimaryButton',
 *   onPointerTap: () => {},
 *   text: { content: 'Play' },
 *   textures: { idle: pixora.texture('button-idle') },
 * });
 * const myScene = pixora.scene({ key: 'main', render: () => ... });
 * ```
 *
 * @example
 * ```ts
 * // Create a component/render function
 * const MyComponent = pixora.component((ctx) => {
 *   return pixora.container({ children: [pixora.text({ content: 'Hello' })] });
 * });
 *
 * // Use in scene
 * scenes: [{ key: 'main', render: MyComponent }]
 * ```
 */
const pixora: PixoraFn = async function (options: PixoraAppOptions): Promise<PixoraRuntime> {
  return createPixoraAppInstance(options);
};

pixora.component = function <Props extends PixoraComponentProps>(
  renderFn: PixoraComponent<Props>,
): PixoraComponent<Props> {
  return renderFn;
};
pixora.button = button;
pixora.container = container;
pixora.island = island;
pixora.scene = componentAPI.scene;
pixora.sprite = sprite;
pixora.text = text;
pixora.texture = (src: string) => Texture.from(src);

export { pixora };

// ---------------------------------------------------------------------------
// Internal adapter
// ---------------------------------------------------------------------------

/**
 * Bridges a declarative scene definition to the imperative `Scene` class.
 * The scene manager sees this as a regular scene.
 */
class DeclarativeSceneAdapter extends Scene {
  override readonly key: SceneKey;
  private effectSubscription: Disposable | null = null;
  private mountedTree: MountedTree | null = null;
  private isScheduled = false;

  constructor(
    key: string,
    private readonly renderFn: (context: ApplicationContext) => PixoraNode,
    private readonly mountedTrees: Map<string, MountedTree>,
    private readonly scheduler: Scheduler,
    private readonly updateMode: 'frame' | 'reactive',
  ) {
    super();
    this.key = key;
  }

  override mount(): void {
    const context = this.getContext();
    const tree = withApplicationContext(context, () => this.renderFn(context));

    this.mountedTree = mountTree(tree, this.root, context);
    this.mountedTrees.set(this.key, this.mountedTree);

    if (this.updateMode === 'reactive') {
      this.effectSubscription = effect(() => {
        if (!this.mountedTree) {
          return;
        }

        updateTree(
          this.mountedTree,
          withApplicationContext(context, () => this.renderFn(context)),
        );
      });
    }
  }

  override update(_deltaMs: number): void {
    if (!this.mountedTree || this.isScheduled || this.updateMode === 'reactive') {
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
    this.effectSubscription?.dispose();
    this.effectSubscription = null;

    if (this.mountedTree) {
      this.scheduler.unscheduleUpdate(this.key);
      unmountTree(this.mountedTree);
      this.mountedTrees.delete(this.key);
      this.mountedTree = null;
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

import type { ApplicationContext, Viewport } from '../app/types';

import type { Scene, SceneDefinition, SceneKey, ScenePayload } from './types';

export type SceneManager = {
  destroy(): Promise<void>;
  getActiveScene(): Scene | null;
  getActiveSceneKey(): SceneKey | null;
  getOverlayStack(): readonly Scene[];
  getRegisteredSceneKeys(): readonly SceneKey[];
  goTo(key: SceneKey, payload?: ScenePayload): Promise<Scene>;
  hideOverlay(key?: SceneKey): void;
  isPaused(): boolean;
  resize(viewport: Viewport): void;
  showOverlay(key: SceneKey, payload?: ScenePayload): Promise<Scene>;
  update(deltaMs: number): void;
};

export function createSceneManager(context: ApplicationContext, definitions: readonly SceneDefinition[]): SceneManager {
  const definitionMap = new Map(definitions.map((definition) => [definition.key, definition]));
  const instances = new Map<SceneKey, Scene>();
  const initializedScenes = new WeakSet<Scene>();
  const mountedScenes = new WeakSet<Scene>();
  const overlayStack: Scene[] = [];
  let activeSceneKey: SceneKey | null = null;
  let activeScene: Scene | null = null;

  return {
    async destroy() {
      for (const overlay of overlayStack.reverse()) {
        overlay.deactivate();
        overlay.root.removeFromParent();
      }

      overlayStack.length = 0;

      if (activeScene) {
        activeScene.deactivate();
      }

      for (const [key, scene] of Array.from(instances.entries()).reverse()) {
        destroyScene(key, scene);
      }

      activeScene = null;
      activeSceneKey = null;
    },
    getActiveScene() {
      return activeScene;
    },
    getActiveSceneKey() {
      return activeSceneKey;
    },
    getOverlayStack() {
      return [...overlayStack];
    },
    getRegisteredSceneKeys() {
      return definitions.map((definition) => definition.key);
    },
    isPaused() {
      return overlayStack.length > 0;
    },
    async goTo(key, payload) {
      const definition = definitionMap.get(key);

      if (!definition) {
        throw new Error(`Scene "${key}" is not registered.`);
      }

      if (definition.kind === 'overlay') {
        throw new Error(`Cannot use goTo() for overlay "${key}". Use showOverlay() instead.`);
      }

      for (const overlay of overlayStack.reverse()) {
        overlay.deactivate();
        overlay.root.removeFromParent();

        if (!definitionMap.get(overlay.key)?.cache) {
          destroyScene(overlay.key, overlay);
        }
      }

      overlayStack.length = 0;

      if (activeSceneKey === key && activeScene) {
        activeScene.activate(payload);
        activeScene.resize(context.viewport.get());

        return activeScene;
      }

      const nextScene = getOrCreateScene(definition);
      const previousScene = activeScene;
      const previousSceneKey = activeSceneKey;

      nextScene.attachContext(context);
      await initScene(nextScene, payload);

      if (previousScene && previousSceneKey) {
        previousScene.deactivate();
        previousScene.root.removeFromParent();

        if (!definitionMap.get(previousSceneKey)?.cache) {
          destroyScene(previousSceneKey, previousScene);
        }
      }

      mountScene(nextScene);
      context.app.stage.addChild(nextScene.root);
      nextScene.activate(payload);
      nextScene.resize(context.viewport.get());

      activeScene = nextScene;
      activeSceneKey = key;

      context.events.emit('scene.changed', {
        nextScene: key,
        previousScene: previousSceneKey,
      });

      return nextScene;
    },
    hideOverlay(key) {
      if (overlayStack.length === 0) {
        return;
      }

      const targetIndex = key ? overlayStack.findIndex((overlay) => overlay.key === key) : overlayStack.length - 1;

      if (targetIndex === -1) {
        return;
      }

      const removedOverlays = overlayStack.splice(targetIndex);

      for (const overlay of removedOverlays.reverse()) {
        overlay.deactivate();
        overlay.root.removeFromParent();

        if (!definitionMap.get(overlay.key)?.cache) {
          destroyScene(overlay.key, overlay);
        }
      }
    },
    resize(viewport) {
      activeScene?.resize(viewport);

      for (const overlay of overlayStack) {
        overlay.resize(viewport);
      }
    },
    async showOverlay(key, payload) {
      const definition = definitionMap.get(key);

      if (!definition) {
        throw new Error(`Overlay "${key}" is not registered.`);
      }

      if (definition.kind !== 'overlay') {
        throw new Error(`Cannot use showOverlay() for standard scene "${key}". Use goTo() instead.`);
      }

      const existingIndex = overlayStack.findIndex((overlay) => overlay.key === key);

      if (existingIndex !== -1) {
        const overlay = overlayStack[existingIndex];

        overlay.activate(payload);
        overlay.resize(context.viewport.get());

        return overlay;
      }

      const overlay = getOrCreateScene(definition);

      overlay.attachContext(context);
      await initScene(overlay, payload);
      mountScene(overlay);
      context.app.stage.addChild(overlay.root);
      overlay.activate(payload);
      overlay.resize(context.viewport.get());

      overlayStack.push(overlay);

      return overlay;
    },
    update(deltaMs) {
      activeScene?.update(deltaMs);

      for (const overlay of overlayStack) {
        overlay.update(deltaMs);
      }
    },
  };

  function destroyScene(key: SceneKey, scene: Scene): void {
    scene.root.removeFromParent();
    scene.destroy();
    scene.root.destroy({ children: true });
    instances.delete(key);
  }

  function getOrCreateScene(definition: SceneDefinition): Scene {
    const existing = instances.get(definition.key);

    if (existing) {
      return existing;
    }

    const scene = definition.create();

    if (scene.key !== definition.key) {
      throw new Error(`Scene key mismatch. Definition "${definition.key}" created "${scene.key}".`);
    }

    instances.set(definition.key, scene);

    return scene;
  }

  async function initScene(scene: Scene, payload?: ScenePayload): Promise<void> {
    if (initializedScenes.has(scene)) {
      return;
    }

    initializedScenes.add(scene);
    await scene.init(context, payload);
  }

  function mountScene(scene: Scene): void {
    if (mountedScenes.has(scene)) {
      return;
    }

    mountedScenes.add(scene);
    scene.mount();
  }
}

import { Application } from 'pixi.js';

import { createAssetRegistry } from '../assets/create-asset-registry';
import { createEventBus } from '../events/create-event-bus';
import { createSceneManager, type SceneManager } from '../scenes/scene-manager';
import { createServiceRegistry, type ServiceRegistry } from '../services/create-service-registry';

import { createViewportManager } from './create-viewport-manager';
import type { ApplicationContext, pixoraApp, pixoraAppOptions } from './types';

type ServiceRegistryWithContext = ServiceRegistry & {
  setContext(context: ApplicationContext): void;
};

export async function createpixoraApp(options: pixoraAppOptions): Promise<pixoraApp> {
  validateOptions(options);

  const app = new Application();
  const viewportManager = createViewportManager({
    height: options.height,
    mount: options.mount,
    width: options.width,
  });
  const viewport = viewportManager.viewport.get();

  await app.init({
    autoStart: false,
    background: options.backgroundColor ?? 0x0f172a,
    height: viewport.height,
    width: viewport.width,
  });

  options.mount.replaceChildren(app.canvas);

  const assets = createAssetRegistry();
  const events = createEventBus<Record<string, unknown>>();
  const services = createServiceRegistry() as ServiceRegistryWithContext;
  let started = false;
  let destroyed = false;

  if (options.assets) {
    assets.register(options.assets);
  }

  const context: ApplicationContext = {
    app,
    assets,
    events,
    mount: options.mount,
    scenes: null as unknown as SceneManager,
    services,
    viewport: viewportManager.viewport.asReadonly(),
  };
  const sceneManager = createSceneManager(context, options.scenes);

  context.scenes = sceneManager;

  services.setContext(context);

  for (const descriptor of options.services ?? []) {
    services.register(descriptor);
  }

  const viewportSubscription = viewportManager.viewport.subscribe((nextViewport) => {
    app.renderer.resize(nextViewport.width, nextViewport.height);
    sceneManager.resize(nextViewport);
  });
  const handleTick = () => {
    sceneManager.update(app.ticker.deltaMS);
  };

  app.ticker.add(handleTick);

  const pixoraApp: pixoraApp = {
    app,
    context,
    async destroy() {
      if (destroyed) {
        return;
      }

      destroyed = true;

      viewportSubscription.dispose();
      viewportManager.destroy();
      app.ticker.remove(handleTick);
      await sceneManager.destroy();
      await services.destroy();
      app.destroy();
    },
    async start() {
      if (destroyed) {
        throw new Error('pixora app has already been destroyed.');
      }

      if (started) {
        return;
      }

      started = true;

      viewportManager.refresh();
      await sceneManager.goTo(options.initialScene);
      app.start();
    },
  };

  if (options.autoStart !== false) {
    await pixoraApp.start();
  }

  return pixoraApp;
}

function validateOptions(options: pixoraAppOptions): void {
  if (!options.mount) {
    throw new Error('pixora requires a mount element.');
  }

  if (options.scenes.length === 0) {
    throw new Error('pixora requires at least one scene definition.');
  }

  const sceneKeys = new Set<string>();

  for (const definition of options.scenes) {
    if (sceneKeys.has(definition.key)) {
      throw new Error(`Duplicate scene key: ${definition.key}`);
    }

    sceneKeys.add(definition.key);
  }

  if (!sceneKeys.has(options.initialScene)) {
    throw new Error(`Initial scene "${options.initialScene}" is not registered.`);
  }
}

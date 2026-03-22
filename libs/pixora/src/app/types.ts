import type { Application } from 'pixi.js';
import type { AssetManifest, AssetRegistry } from '../components/create-asset-registry';
import type { EventBus } from '../events/create-event-bus';
import type { SceneManager } from '../scenes/scene-manager';
import type { ReadonlySignal } from '../state/signal';
import type { SceneDefinition, SceneKey } from '../scenes/types';
import type { ServiceDescriptor, ServiceRegistry } from '../services/create-service-registry';

export type Viewport = {
  width: number;
  height: number;
  aspectRatio: number;
  orientation: 'portrait' | 'landscape';
};

export type ApplicationContext = {
  app: Application;
  assets: AssetRegistry;
  events: EventBus<Record<string, unknown>>;
  mount: HTMLElement;
  scenes: SceneManager;
  services: ServiceRegistry;
  viewport: ReadonlySignal<Viewport>;
};

export type pixoraAppOptions = {
  mount: HTMLElement;
  width?: number;
  height?: number;
  backgroundColor?: number;
  autoStart?: boolean;
  scenes: readonly SceneDefinition[];
  initialScene: SceneKey;
  services?: readonly ServiceDescriptor[];
  assets?: AssetManifest;
  devtools?: boolean;
};

export type pixoraApp = {
  app: Application;
  context: ApplicationContext;
  start(): Promise<void>;
  destroy(): Promise<void>;
};

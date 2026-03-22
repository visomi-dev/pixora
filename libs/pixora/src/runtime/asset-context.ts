import { signal } from '../state/signal';

import type { ReadonlySignal, Signal } from '../state/signal';
import type { FontAsset } from '../assets/create-asset-registry';

export enum AssetState {
  Idle = 'idle',
  Loading = 'loading',
  Loaded = 'loaded',
  Error = 'error',
}

export type AssetStatus = {
  key: string;
  state: AssetState;
  progress: number;
  error?: Error;
};

export type AssetContextOptions = {
  sharedCache?: boolean;
};

export type AssetContext = {
  getState(key: string): AssetState;
  getProgress(key: string): number;
  getTexture(key: string): unknown;
  has(key: string): boolean;
  isLoaded(key: string): boolean;
  isLoading(key: string): boolean;
  load(key: string): Promise<void>;
  loadBundle(name: string): Promise<void>;
  preload(keys: string[]): Promise<void>;
  register(manifest: AssetManifest): void;
  state(key: string): ReadonlySignal<AssetState>;
};

export type AssetManifest = {
  bundles?: Record<string, readonly string[]>;
  fonts?: readonly FontAsset[];
  spritesheets?: Record<string, string>;
  textures?: Record<string, string>;
};

const globalSharedCache = new Map<string, unknown>();

export function createAssetContext(options: AssetContextOptions = {}): AssetContext {
  const { sharedCache = false } = options;

  const cache = sharedCache ? globalSharedCache : new Map<string, unknown>();
  const manifestTextures = new Map<string, string>();
  const manifestSpritesheets = new Map<string, string>();
  const bundles = new Map<string, string[]>();

  const assetStates = new Map<string, Signal<AssetState>>();
  const assetProgress = new Map<string, Signal<number>>();
  const loadingPromises = new Map<string, Promise<void>>();

  function getOrCreateState(key: string): Signal<AssetState> {
    let state = assetStates.get(key);

    if (!state) {
      state = signal(AssetState.Idle);
      assetStates.set(key, state);
    }

    return state;
  }

  function getOrCreateProgress(key: string): Signal<number> {
    let progress = assetProgress.get(key);

    if (!progress) {
      progress = signal(0);
      assetProgress.set(key, progress);
    }

    return progress;
  }

  return {
    getState(key: string): AssetState {
      return assetStates.get(key)?.get() ?? AssetState.Idle;
    },

    getProgress(key: string): number {
      return assetProgress.get(key)?.get() ?? 0;
    },

    getTexture(key: string): unknown {
      return cache.get(key);
    },

    has(key: string): boolean {
      return manifestTextures.has(key) || manifestSpritesheets.has(key);
    },

    isLoaded(key: string): boolean {
      return this.getState(key) === AssetState.Loaded;
    },

    isLoading(key: string): boolean {
      return this.getState(key) === AssetState.Loading;
    },

    async load(key: string): Promise<void> {
      const existing = loadingPromises.get(key);

      if (existing) {
        return existing;
      }

      const source = manifestTextures.get(key) ?? manifestSpritesheets.get(key);

      if (!source) {
        throw new Error(`Unknown asset key: ${key}`);
      }

      const promise = (async () => {
        const state = getOrCreateState(key);
        const progress = getOrCreateProgress(key);

        state.set(AssetState.Loading);
        progress.set(0);

        try {
          progress.set(0.5);

          const texture = await loadTexture(source);

          cache.set(key, texture);

          progress.set(1);
          state.set(AssetState.Loaded);
        } catch (error) {
          state.set(AssetState.Error);

          throw error;
        } finally {
          loadingPromises.delete(key);
        }
      })();

      loadingPromises.set(key, promise);

      return promise;
    },

    async loadBundle(name: string): Promise<void> {
      const bundle = bundles.get(name);

      if (!bundle) {
        throw new Error(`Unknown asset bundle: ${name}`);
      }

      await Promise.all(bundle.map((key) => this.load(key)));
    },

    async preload(keys: string[]): Promise<void> {
      const unloaded = keys.filter((key) => !this.isLoaded(key) && !this.isLoading(key));

      await Promise.all(unloaded.map((key) => this.load(key)));
    },

    register(manifest: AssetManifest): void {
      for (const [key, source] of Object.entries(manifest.textures ?? {})) {
        manifestTextures.set(key, source);
      }

      for (const [key, source] of Object.entries(manifest.spritesheets ?? {})) {
        manifestSpritesheets.set(key, source);
      }

      for (const [name, assetKeys] of Object.entries(manifest.bundles ?? {})) {
        bundles.set(name, [...assetKeys]);
      }
    },

    state(key: string): ReadonlySignal<AssetState> {
      return getOrCreateState(key).asReadonly();
    },
  };
}

async function loadTexture(source: string): Promise<unknown> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ source, loaded: true });
    }, 10);
  });
}

export function clearSharedCache(): void {
  globalSharedCache.clear();
}

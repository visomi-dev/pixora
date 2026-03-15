import { Texture } from 'pixi.js';

export type AssetKey = string;

export type AssetManifest = {
  bundles?: Record<string, readonly AssetKey[]>;
  spritesheets?: Record<AssetKey, string>;
  textures?: Record<AssetKey, string>;
};

export type AssetRegistry = {
  getTexture(key: AssetKey): Texture;
  has(key: AssetKey): boolean;
  isLoaded(key: AssetKey): boolean;
  load(key: AssetKey): Promise<void>;
  loadBundle(name: string): Promise<void>;
  register(manifest: AssetManifest): void;
};

export function createAssetRegistry(): AssetRegistry {
  const textureSources = new Map<AssetKey, string>();
  const spritesheetSources = new Map<AssetKey, string>();
  const bundles = new Map<string, readonly AssetKey[]>();
  const loaded = new Set<AssetKey>();

  return {
    getTexture(key) {
      if (!this.has(key)) {
        throw new Error(`Unknown asset key: ${key}`);
      }

      if (!loaded.has(key)) {
        throw new Error(`Asset key "${key}" has not been loaded yet.`);
      }

      return Texture.EMPTY;
    },
    has(key) {
      return textureSources.has(key) || spritesheetSources.has(key);
    },
    isLoaded(key) {
      return loaded.has(key);
    },
    async load(key) {
      if (!this.has(key)) {
        throw new Error(`Unknown asset key: ${key}`);
      }

      loaded.add(key);
    },
    async loadBundle(name) {
      const bundle = bundles.get(name);

      if (!bundle) {
        throw new Error(`Unknown asset bundle: ${name}`);
      }

      await Promise.all(bundle.map((key) => this.load(key)));
    },
    register(manifest) {
      for (const [key, source] of Object.entries(manifest.textures ?? {})) {
        textureSources.set(key, source);
      }

      for (const [key, source] of Object.entries(manifest.spritesheets ?? {})) {
        spritesheetSources.set(key, source);
      }

      for (const [name, assetKeys] of Object.entries(manifest.bundles ?? {})) {
        bundles.set(name, assetKeys);
      }
    },
  };
}

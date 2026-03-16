# Assets Spec

## Goal

Provide centralized, typed, key-based access to textures and related visual assets.

## Asset model

```ts
type AssetKey = string;

type AssetManifest = {
  textures?: Record<AssetKey, string>;
  spritesheets?: Record<AssetKey, string>;
  bundles?: Record<string, AssetKey[]>;
};
```

## Registry responsibilities

- register manifest entries;
- load an asset by key;
- load a bundle by name;
- expose current load status;
- return resolved textures and spritesheet data;
- fail clearly for missing required keys.

## API direction

```ts
type AssetRegistry = {
  register(manifest: AssetManifest): void;
  load(key: AssetKey): Promise<void>;
  loadBundle(name: string): Promise<void>;
  has(key: AssetKey): boolean;
  getTexture(key: AssetKey): Texture;
};

declare function createAssetRegistry(): AssetRegistry;
```

## Usage guidance

- app-level assets may be preloaded during startup;
- scene-specific assets should be loaded during scene init or before activation;
- UI code should reference keys, not raw file paths.

## MVP deliverables

- texture loading;
- key-based lookup;
- simple bundle loading;
- usable error messages for missing assets.

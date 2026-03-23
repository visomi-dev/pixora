import { Assets, Texture } from 'pixi.js';

type SpritesheetLike = {
  textures?: Record<string, unknown>;
};

export async function loadTextureAsset(source: string): Promise<Texture> {
  const loadedAsset = await Assets.load(source);

  if (loadedAsset instanceof Texture) {
    return loadedAsset;
  }

  const spritesheetTexture = getSpritesheetTexture(loadedAsset);
  if (spritesheetTexture) {
    return spritesheetTexture;
  }

  return Texture.from(source);
}

function getSpritesheetTexture(asset: unknown): Texture | null {
  if (!asset || typeof asset !== 'object' || !('textures' in asset)) {
    return null;
  }

  const { textures } = asset as SpritesheetLike;
  if (!textures) {
    return null;
  }

  for (const texture of Object.values(textures)) {
    if (texture instanceof Texture) {
      return texture;
    }
  }

  return null;
}

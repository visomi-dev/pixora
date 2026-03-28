import { Assets, Texture } from 'pixi.js';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { createAssetRegistry } from './create-asset-registry';

describe('createAssetRegistry', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('registers and reports presence', () => {
    const registry = createAssetRegistry();

    expect(registry.has('hero')).toBe(false);

    registry.register({
      textures: {
        hero: 'hero.png',
      },
    });

    expect(registry.has('hero')).toBe(true);
    expect(registry.isLoaded('hero')).toBe(false);
  });

  it('marks assets as loaded when explicitly loaded', async () => {
    const registry = createAssetRegistry();
    const texture = Texture.EMPTY;

    vi.spyOn(Assets, 'load').mockResolvedValue(texture as never);

    registry.register({ textures: { hero: 'hero.png' } });
    await registry.load('hero');

    expect(registry.isLoaded('hero')).toBe(true);
    expect(Assets.load).toHaveBeenCalledWith('hero.png');
    expect(registry.getTexture('hero')).toBe(texture);
  });

  it('throws on missing assets', () => {
    const registry = createAssetRegistry();

    expect(() => registry.getTexture('unknown')).toThrow(/Unknown asset/);
  });
});

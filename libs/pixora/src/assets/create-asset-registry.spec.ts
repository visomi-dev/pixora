import { createAssetRegistry } from './create-asset-registry';

describe('createAssetRegistry', () => {
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

    registry.register({ textures: { hero: 'hero.png' } });
    await registry.load('hero');

    expect(registry.isLoaded('hero')).toBe(true);
    expect(registry.getTexture('hero')).toBeDefined();
  });

  it('throws on missing assets', () => {
    const registry = createAssetRegistry();

    expect(() => registry.getTexture('unknown')).toThrow(/Unknown asset/);
  });
});

import { Assets, Texture } from 'pixi.js';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { AssetState, createAssetContext, clearSharedCache } from './asset-context';

describe('asset-context', () => {
  afterEach(() => {
    clearSharedCache();
    vi.restoreAllMocks();
  });

  describe('createAssetContext', () => {
    it('creates an asset context with default options', () => {
      const context = createAssetContext();

      expect(context).toBeDefined();
      expect(typeof context.has).toBe('function');
      expect(typeof context.load).toBe('function');
      expect(typeof context.register).toBe('function');
    });

    it('registers assets from manifest', () => {
      const context = createAssetContext();

      context.register({
        textures: {
          player: '/assets/player.png',
          enemy: '/assets/enemy.png',
        },
        bundles: {
          gameplay: ['player', 'enemy'],
        },
      });

      expect(context.has('player')).toBe(true);
      expect(context.has('enemy')).toBe(true);
      expect(context.has('unknown')).toBe(false);
    });

    it('tracks asset states', () => {
      const context = createAssetContext();

      context.register({
        textures: {
          test: '/assets/test.png',
        },
      });

      expect(context.getState('test')).toBe(AssetState.Idle);
      expect(context.isLoaded('test')).toBe(false);
      expect(context.isLoading('test')).toBe(false);
    });

    it('returns state as signal', () => {
      const context = createAssetContext();

      context.register({
        textures: {
          test: '/assets/test.png',
        },
      });

      const stateSignal = context.state('test');

      expect(stateSignal.get()).toBe(AssetState.Idle);
    });

    it('supports shared cache option', async () => {
      const context1 = createAssetContext({ sharedCache: true });
      const context2 = createAssetContext({ sharedCache: true });
      const texture = Texture.EMPTY;

      vi.spyOn(Assets, 'load').mockResolvedValue(texture as never);

      const manifest = {
        textures: {
          shared: '/assets/shared.png',
        },
      };

      context1.register(manifest);
      context2.register(manifest);

      await context1.load('shared');

      expect(context1.isLoaded('shared')).toBe(true);
      expect(Assets.load).toHaveBeenCalledWith('/assets/shared.png');
      expect(context1.getTexture('shared')).toBe(context2.getTexture('shared'));
    });

    it('isolates non-shared cache', () => {
      const context1 = createAssetContext({ sharedCache: false });
      const context2 = createAssetContext({ sharedCache: false });

      context1.register({
        textures: {
          isolated: '/assets/isolated.png',
        },
      });

      expect(context1.has('isolated')).toBe(true);
      expect(context2.has('isolated')).toBe(false);
    });
  });

  describe('AssetState', () => {
    it('has correct enum values', () => {
      expect(AssetState.Idle).toBe('idle');
      expect(AssetState.Loading).toBe('loading');
      expect(AssetState.Loaded).toBe('loaded');
      expect(AssetState.Error).toBe('error');
    });
  });
});

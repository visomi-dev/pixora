import { Container } from 'pixi.js';

import { createAssetRegistry } from '../assets/create-asset-registry';
import { createEventBus } from '../events/create-event-bus';
import { signal } from '../state/signal';
import { createServiceRegistry } from '../services/create-service-registry';

import { createSceneManager } from './scene-manager';
import { Scene } from './scene';

import type { ApplicationContext, Viewport } from '../app/types';

class TestScene extends Scene {
  readonly key: 'alpha' | 'beta';
  readonly calls: string[] = [];

  constructor(key: 'alpha' | 'beta') {
    super();
    this.key = key;
  }

  override activate(): void {
    this.calls.push(`activate:${this.key}`);
  }

  override deactivate(): void {
    this.calls.push(`deactivate:${this.key}`);
  }

  override destroy(): void {
    this.calls.push(`destroy:${this.key}`);
  }

  override init(): void {
    this.calls.push(`init:${this.key}`);
  }

  override mount(): void {
    this.calls.push(`mount:${this.key}`);
  }

  override resize(viewport: Viewport): void {
    this.calls.push(`resize:${this.key}:${viewport.width}x${viewport.height}`);
  }

  override update(deltaMs: number): void {
    this.calls.push(`update:${this.key}:${Math.round(deltaMs)}`);
  }
}

describe('createSceneManager', () => {
  it('initializes, mounts, activates, and updates the active scene', async () => {
    const alpha = new TestScene('alpha');
    const beta = new TestScene('beta');
    const viewport = signal<Viewport>({
      aspectRatio: 16 / 9,
      height: 720,
      orientation: 'landscape',
      width: 1280,
    });
    const context = {
      app: {
        stage: new Container(),
      },
      assets: createAssetRegistry(),
      events: createEventBus<Record<string, unknown>>(),
      mount: {} as HTMLElement,
      scenes: null as unknown as ApplicationContext['scenes'],
      services: createServiceRegistry(),
      viewport: viewport.asReadonly(),
    } as unknown as ApplicationContext;
    const manager = createSceneManager(context, [
      {
        create: () => alpha,
        key: 'alpha',
      },
      {
        create: () => beta,
        key: 'beta',
      },
    ]);

    context.scenes = manager;

    await manager.goTo('alpha');
    manager.update(16.4);
    await manager.goTo('beta');

    expect(alpha.calls).toEqual([
      'init:alpha',
      'mount:alpha',
      'activate:alpha',
      'resize:alpha:1280x720',
      'update:alpha:16',
      'deactivate:alpha',
      'destroy:alpha',
    ]);
    expect(beta.calls).toEqual(['init:beta', 'mount:beta', 'activate:beta', 'resize:beta:1280x720']);
    expect(manager.getActiveSceneKey()).toBe('beta');
  });
});

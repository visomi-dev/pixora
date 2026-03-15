import { Container } from 'pixi.js';

import type { ApplicationContext, Viewport } from '../app/types';

export type SceneKey = string;

export type ScenePayload = unknown;

export type SceneDefinition = {
  key: SceneKey;
  create: () => Scene;
  cache?: boolean;
  kind?: 'overlay' | 'scene';
};

export abstract class Scene {
  abstract readonly key: SceneKey;
  readonly root = new Container();
  private context?: ApplicationContext;

  attachContext(context: ApplicationContext): void {
    this.context = context;
  }

  init(_context: ApplicationContext, _payload?: ScenePayload): Promise<void> | void {
    return;
  }

  mount(): void {
    return;
  }

  activate(_payload?: ScenePayload): void {
    return;
  }

  deactivate(): void {
    return;
  }

  update(_deltaMs: number): void {
    return;
  }

  resize(_viewport: Viewport): void {
    return;
  }

  destroy(): void {
    return;
  }

  protected getContext(): ApplicationContext {
    if (!this.context) {
      throw new Error(`Scene "${this.key}" is not attached to an application context.`);
    }

    return this.context;
  }

  protected getViewport(): Viewport {
    return this.getContext().viewport.get();
  }
}

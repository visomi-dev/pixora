import { Assets } from 'pixi.js';


import orbiton from '../assets/Orbitron[wght].ttf';
import jetBrainsMono from '../assets/JetBrainsMono[wght].ttf';

import { GameScene } from './scenes/game/game.scene';
import { GameOverScene } from './scenes/game-over/game-over.scene';
import { InstructionsScene } from './scenes/instructions/instructions.scene';
import { MainMenuScene } from './scenes/main-menu/main-menu.scene';
import { VictoryScene } from './scenes/victory/victory.scene';

import { createpixoraApp } from 'pixora';
import type { Disposable, pixoraApp, Viewport } from 'pixora';

import './space-invaders.css';

type SceneChangePayload = {
  nextScene: string;
  previousScene: string | null;
};

type GameScorePayload = {
  score: number;
  level: number;
};

export class SpaceInvaders extends HTMLElement {
  private readonly sceneSubscriptions = new Set<Disposable>();
  private runtime?: pixoraApp;

  connectedCallback() {
    if (!this.hasChildNodes()) {
      this.renderShell();
    }

    void this.bootstrap();
  }

  disconnectedCallback() {
    for (const subscription of this.sceneSubscriptions) {
      subscription.dispose();
    }

    this.sceneSubscriptions.clear();

    if (this.runtime) {
      void this.runtime.destroy();
      this.runtime = undefined;
    }
  }

  private async bootstrap(): Promise<void> {
    if (this.runtime) {
      return;
    }

    const stageHost = this.querySelector<HTMLElement>('[data-stage-host]');
    const sceneName = this.querySelector<HTMLElement>('[data-scene-name]');
    const scoreLabel = this.querySelector<HTMLElement>('[data-score]');
    const levelLabel = this.querySelector<HTMLElement>('[data-level]');
    const viewportLabel = this.querySelector<HTMLElement>('[data-viewport]');

    if (!stageHost || !sceneName || !scoreLabel || !levelLabel || !viewportLabel) {
      return;
    }

    await this.loadFonts();

    this.runtime = await createpixoraApp({
      autoStart: false,
      backgroundColor: 0x0a0a1a,
      devtools: import.meta.env?.DEV ?? import.meta.env?.MODE === 'development',
      initialScene: 'main-menu',
      mount: stageHost,
      scenes: [
        {
          create: () => new MainMenuScene(),
          key: 'main-menu',
        },
        {
          create: () => new InstructionsScene(),
          key: 'instructions',
        },
        {
          create: () => new GameScene(),
          key: 'game',
        },
        {
          create: () => new GameOverScene(),
          key: 'game-over',
        },
        {
          create: () => new VictoryScene(),
          key: 'victory',
        },
      ],
    });

    this.sceneSubscriptions.add(
      this.runtime.context.events.on('scene.changed', (payload) => {
        const change = payload as SceneChangePayload;
        sceneName.textContent = change.nextScene;
      }),
    );

    this.sceneSubscriptions.add(
      this.runtime.context.events.on('game.score', (payload) => {
        const gameScore = payload as GameScorePayload;
        scoreLabel.textContent = `Score: ${gameScore.score.toLocaleString()}`;
        levelLabel.textContent = `Level: ${gameScore.level}`;
      }),
    );

    this.sceneSubscriptions.add(
      this.runtime.context.viewport.subscribe((viewport) => {
        viewportLabel.textContent = `${viewport.width} x ${viewport.height}`;
      }),
    );

    viewportLabel.textContent = this.formatViewport(this.runtime.context.viewport.get());
    sceneName.textContent = this.runtime.context.scenes.getActiveSceneKey() ?? 'booting';

    await this.runtime.start();
    sceneName.textContent = this.runtime.context.scenes.getActiveSceneKey() ?? 'main-menu';
  }

  private formatViewport(viewport: Viewport): string {
    return `${viewport.width} x ${viewport.height}`;
  }

  private async loadFonts(): Promise<void> {
    await Promise.all([
      Assets.load({
        src: orbiton,
        parser: 'web-font',
        data: {
          family: 'Orbitron',
          weights: ['700', '900'],
        },
      }),
      Assets.load({
        src: jetBrainsMono,
        parser: 'web-font',
        data: {
          family: 'JetBrains Mono',
          weights: ['400', '700'],
        },
      }),
    ]);
  }

  private renderShell(): void {
    this.innerHTML = `
      <main class="game-shell">
        <div class="game-header">
          <div class="status-item">
            <span class="status-label">Scene</span>
            <strong data-scene-name>loading</strong>
          </div>
          <div class="status-item">
            <span class="status-label">Score</span>
            <strong data-score>0</strong>
          </div>
          <div class="status-item">
            <span class="status-label">Level</span>
            <strong data-level>1</strong>
          </div>
          <div class="status-item">
            <span class="status-label">Viewport</span>
            <strong data-viewport>--</strong>
          </div>
        </div>
        <div class="stage-host" data-stage-host></div>
      </main>
    `;
  }
}

if (!customElements.get('space-invaders-root')) {
  customElements.define('space-invaders-root', SpaceInvaders);
}

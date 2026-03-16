import { Assets } from 'pixi.js';

import orbiton from '../assets/Orbitron[wght].ttf';
import jetBrainsMono from '../assets/JetBrainsMono[wght].ttf';

import { gameScene } from './scenes/game/game.scene';

import { api as pixora, pixora as createPixoraApp } from 'pixora';
import type { ApplicationContext, TextNodeProps } from 'pixora';

type SceneChangePayload = {
  nextScene: string;
  previousScene: string | null;
};

type GameScorePayload = {
  score: number;
  level: number;
};

const createTextStyle = (color: string, fontSize: number, weight = 'bold'): Partial<TextNodeProps> => ({
  style: {
    fill: color,
    fontFamily: 'Orbitron, sans-serif',
    fontSize,
    fontWeight: weight as 'bold' | 'normal' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900',
  },
});

const createMonoTextStyle = (color: string, fontSize: number): Partial<TextNodeProps> => ({
  style: {
    fill: color,
    fontFamily: 'JetBrains Mono, monospace',
    fontSize,
  },
});

const mainMenu = pixora.component((context: ApplicationContext) => {
  const centerX = context.viewport.get().width / 2;
  const centerY = context.viewport.get().height / 2;
  const titleY = context.viewport.get().height * 0.12;

  let highScoreText = 'GALACTIC DEFENSE v2.0';
  try {
    const saved = localStorage.getItem('spaceInvadersHighScore');
    if (saved) {
      const highScore = parseInt(saved, 10);
      highScoreText = `GALACTIC DEFENSE v2.0 | HIGH SCORE: ${highScore.toLocaleString()}`;
    }
  } catch {
    // localStorage not available
  }

  return pixora.container(
    { x: 0, y: 0 },
    pixora.box({
      backgroundColor: 0x0a0a1a,
      height: context.viewport.get().height,
      width: context.viewport.get().width,
      x: 0,
      y: 0,
    }),
    pixora.text({
      ...createTextStyle('#00ffaa', 72, '900'),
      text: 'SPACE',
      x: centerX,
      y: titleY,
    }),
    pixora.text({
      ...createTextStyle('#ff00aa', 48, '700'),
      text: 'INVADERS',
      x: centerX,
      y: titleY + 62,
    }),
    pixora.text({
      ...createMonoTextStyle('#666688', 14),
      text: highScoreText,
      x: centerX,
      y: context.viewport.get().height - 40,
    }),
    pixora.container(
      { x: centerX - 140, y: centerY + 60 },
      pixora.button({
        backgroundColor: 0x00ffaa,
        height: 56,
        label: 'START GAME',
        onPointerTap: () => {
          void context.scenes.goTo('game');
        },
        width: 280,
      }),
      pixora.button({
        backgroundColor: 0x333366,
        height: 48,
        label: 'INSTRUCTIONS',
        onPointerTap: () => {
          void context.scenes.goTo('instructions');
        },
        width: 280,
        y: 70,
      }),
    ),
  );
}, 'mainMenu');

const instructions = pixora.component((context: ApplicationContext) => {
  const height = context.viewport.get().height;
  const width = context.viewport.get().width;

  return pixora.container(
    { x: 0, y: 0 },
    pixora.box({
      backgroundColor: 0x0a0a1a,
      height,
      width,
      x: 0,
      y: 0,
    }),
    pixora.container(
      { x: 0, y: 0 },
      pixora.text({
        ...createTextStyle('#00ffaa', 48, '900'),
        text: 'INSTRUCTIONS',
        x: width / 2,
        y: 60,
      }),
      pixora.text({
        ...createTextStyle('#ff00aa', 24, 'bold'),
        text: 'CONTROLS',
        x: width / 2,
        y: 160,
      }),
      pixora.text({
        ...createMonoTextStyle('#ffffff', 16),
        text: '← → or A/D - Move Ship\nSPACE - Fire\nP - Pause\nESC - Pause',
        x: width / 2,
        y: 210,
      }),
      pixora.text({
        ...createTextStyle('#ff00aa', 24, 'bold'),
        text: 'POWER-UPS',
        x: width / 2,
        y: 330,
      }),
      pixora.text({
        ...createMonoTextStyle('#ffffff', 16),
        text: '⚡ Speed Boost - Move faster\n🛡️ Shield - Invincibility\n🔥 Triple Shot - Fire 3 bullets\n💣 Smart Bomb - Clear row',
        x: width / 2,
        y: 380,
      }),
      pixora.text({
        ...createTextStyle('#ff00aa', 24, 'bold'),
        text: 'TIPS',
        x: width / 2,
        y: 520,
      }),
      pixora.text({
        ...createMonoTextStyle('#ffffff', 16),
        text: '• Combo kills for score multipliers\n• Destroy enemies quickly for bonus points\n• Watch for falling power-ups\n• Each level gets harder!',
        x: width / 2,
        y: 570,
      }),
      pixora.button({
        backgroundColor: 0x00ffaa,
        height: 56,
        label: 'BACK',
        onPointerTap: () => {
          void context.scenes.goTo('main-menu');
        },
        width: 200,
        x: width / 2 - 100,
        y: height - 120,
      }),
    ),
  );
}, 'instructions');

const gameOver = pixora.component((context: ApplicationContext) => {
  const height = context.viewport.get().height;
  const width = context.viewport.get().width;

  let highScoreText = 'HIGH SCORE: 0';
  const isNewHighScore = false;
  try {
    const saved = localStorage.getItem('spaceInvadersHighScore');
    const currentHigh = saved ? parseInt(saved, 10) : 0;
    highScoreText = `HIGH SCORE: ${currentHigh.toLocaleString()}`;
  } catch {
    // localStorage not available
  }

  return pixora.container(
    { x: 0, y: 0 },
    pixora.box({
      backgroundColor: 0x0a0a1a,
      height,
      width,
      x: 0,
      y: 0,
    }),
    pixora.container(
      { x: 0, y: 0 },
      pixora.text({
        ...createTextStyle('#ff4444', 72, '900'),
        text: 'GAME OVER',
        x: width / 2,
        y: height / 2 - 150,
      }),
      pixora.text({
        ...createTextStyle('#ffffff', 32),
        text: `SCORE: ${(0).toLocaleString()}`,
        x: width / 2,
        y: height / 2 - 50,
      }),
      pixora.text({
        ...createTextStyle('#ffff00', 24),
        text: highScoreText,
        x: width / 2,
        y: height / 2 + 10,
      }),
      isNewHighScore
        ? pixora.text({
            ...createTextStyle('#00ffaa', 28, 'bold'),
            text: 'NEW HIGH SCORE!',
            x: width / 2,
            y: height / 2 + 60,
          })
        : pixora.box({ x: 0, y: 0, width: 0, height: 0, visible: false }),
      pixora.button({
        backgroundColor: 0x00ffaa,
        height: 56,
        label: 'PLAY AGAIN',
        onPointerTap: () => {
          void context.scenes.goTo('game');
        },
        width: 280,
        x: width / 2 - 140,
        y: height / 2 + 120,
      }),
      pixora.button({
        backgroundColor: 0x666688,
        height: 48,
        label: 'MAIN MENU',
        onPointerTap: () => {
          void context.scenes.goTo('main-menu');
        },
        width: 280,
        x: width / 2 - 140,
        y: height / 2 + 190,
      }),
    ),
  );
}, 'gameOver');

const victory = pixora.component((context: ApplicationContext) => {
  const height = context.viewport.get().height;
  const width = context.viewport.get().width;

  return pixora.container(
    { x: 0, y: 0 },
    pixora.box({
      backgroundColor: 0x0a0a1a,
      height,
      width,
      x: 0,
      y: 0,
    }),
    pixora.container(
      { x: 0, y: 0 },
      pixora.text({
        ...createTextStyle('#00ffaa', 72, '900'),
        text: 'VICTORY!',
        x: width / 2,
        y: height / 2 - 120,
      }),
      pixora.text({
        ...createTextStyle('#ff00aa', 28),
        text: 'GALAXY DEFENDED!',
        x: width / 2,
        y: height / 2 - 30,
      }),
      pixora.text({
        ...createTextStyle('#ffffff', 32),
        text: 'FINAL SCORE: 0',
        x: width / 2,
        y: height / 2 + 40,
      }),
      pixora.button({
        backgroundColor: 0x00ffaa,
        height: 56,
        label: 'PLAY AGAIN',
        onPointerTap: () => {
          void context.scenes.goTo('game');
        },
        width: 280,
        x: width / 2 - 140,
        y: height / 2 + 120,
      }),
      pixora.button({
        backgroundColor: 0x666688,
        height: 48,
        label: 'MAIN MENU',
        onPointerTap: () => {
          void context.scenes.goTo('main-menu');
        },
        width: 280,
        x: width / 2 - 140,
        y: height / 2 + 190,
      }),
    ),
  );
}, 'victory');

export class SpaceInvaders {
  private readonly sceneSubscriptions: Array<{ dispose: () => void }> = [];
  private runtime?: Awaited<ReturnType<typeof createPixoraApp>>;

  connectedCallback(): void {
    void this.bootstrap();
  }

  disconnectedCallback(): void {
    for (const subscription of this.sceneSubscriptions) {
      subscription.dispose();
    }

    this.sceneSubscriptions.length = 0;

    if (this.runtime) {
      void this.runtime.destroy();
      this.runtime = undefined;
    }
  }

  private async bootstrap(): Promise<void> {
    if (this.runtime) {
      return;
    }

    const stageHost = document.querySelector<HTMLElement>('[data-stage-host]');
    const sceneName = document.querySelector<HTMLElement>('[data-scene-name]');
    const scoreLabel = document.querySelector<HTMLElement>('[data-score]');
    const levelLabel = document.querySelector<HTMLElement>('[data-level]');
    const viewportLabel = document.querySelector<HTMLElement>('[data-viewport]');

    if (!stageHost || !sceneName || !scoreLabel || !levelLabel || !viewportLabel) {
      return;
    }

    await this.loadFonts();

    this.runtime = await createPixoraApp({
      autoStart: false,
      backgroundColor: 0x0a0a1a,
      devtools: import.meta.env?.DEV ?? import.meta.env?.MODE === 'development',
      initialScene: 'main-menu',
      mount: stageHost,
      scenes: [
        pixora.scene(mainMenu),
        pixora.scene(instructions),
        pixora.scene(gameScene),
        pixora.scene(gameOver),
        pixora.scene(victory),
      ],
    });

    this.sceneSubscriptions.push(
      this.runtime.context.events.on('scene.changed', (payload) => {
        const change = payload as SceneChangePayload;
        sceneName.textContent = change.nextScene;
      }),
    );

    this.sceneSubscriptions.push(
      this.runtime.context.events.on('game.score', (payload) => {
        const gameScore = payload as GameScorePayload;
        scoreLabel.textContent = `Score: ${gameScore.score.toLocaleString()}`;
        levelLabel.textContent = `Level: ${gameScore.level}`;
      }),
    );

    this.sceneSubscriptions.push(
      this.runtime.context.viewport.subscribe((viewport) => {
        viewportLabel.textContent = `${viewport.width} x ${viewport.height}`;
      }),
    );

    viewportLabel.textContent = this.formatViewport(this.runtime.context.viewport.get());
    sceneName.textContent = this.runtime.context.scenes.getActiveSceneKey() ?? 'booting';

    await this.runtime.start();
    sceneName.textContent = this.runtime.context.scenes.getActiveSceneKey() ?? 'main-menu';
  }

  private formatViewport(viewport: { width: number; height: number }): string {
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
}

import { pixora } from 'pixora';

import orbiton from '../assets/Orbitron[wght].ttf';
import jetBrainsMono from '../assets/JetBrainsMono[wght].ttf';

import '../styles.css';
import { mainMenuScene } from './scenes/main-menu/main-menu.scene';
import { instructionsScene } from './scenes/instructions/instructions.scene';
import { gameOverScene } from './scenes/game-over/game-over.scene';
import { victoryScene } from './scenes/victory/victory.scene';
import { gameScene } from './scenes/game/game.scene';

async function mount(root: HTMLElement): Promise<void> {
  const stageHost = root.querySelector<HTMLElement>('[data-stage-host]');
  const sceneName = root.querySelector<HTMLElement>('[data-scene-name]');
  const scoreLabel = root.querySelector<HTMLElement>('[data-score]');
  const levelLabel = root.querySelector<HTMLElement>('[data-level]');
  const viewportLabel = root.querySelector<HTMLElement>('[data-viewport]');

  if (!stageHost || !sceneName || !scoreLabel || !levelLabel || !viewportLabel) {
    return;
  }

  const runtime = await pixora({
    assets: {
      fonts: [
        { family: 'Orbitron', src: orbiton, weights: ['700', '900'] },
        { family: 'JetBrains Mono', src: jetBrainsMono, weights: ['400', '700'] },
      ],
    },
    autoStart: false,
    backgroundColor: 0x0a0a1a,
    devtools: import.meta.env?.DEV ?? import.meta.env?.MODE === 'development',
    initialScene: 'main-menu',
    mount: stageHost,
    scenes: [mainMenuScene, instructionsScene, gameScene, gameOverScene, victoryScene],
  });

  runtime.context.events.on('scene.changed', (payload) => {
    const change = payload as { nextScene: string };
    sceneName.textContent = change.nextScene;
  });

  runtime.context.events.on('game.score', (payload) => {
    const gameScore = payload as { score: number; level: number };
    scoreLabel.textContent = `Score: ${gameScore.score.toLocaleString()}`;
    levelLabel.textContent = `Level: ${gameScore.level}`;
  });

  runtime.context.viewport.subscribe((viewport) => {
    viewportLabel.textContent = `${viewport.width} x ${viewport.height}`;
  });

  viewportLabel.textContent = `${runtime.context.viewport.get().width} x ${runtime.context.viewport.get().height}`;
  sceneName.textContent = runtime.context.scenes.getActiveSceneKey() ?? 'booting';

  await runtime.start();

  sceneName.textContent = runtime.context.scenes.getActiveSceneKey() ?? 'main-menu';
}

const root = document.querySelector<HTMLElement>('.game-shell');

if (root) {
  mount(root);
}

import { createKeyboardInput, pixora } from 'pixora';

import { rightAlignedTextX } from '../scene-positioning';

import {
  comboSignal,
  emitScore,
  gameOverSignal,
  initGame,
  initializedSignal,
  levelSignal,
  livesSignal,
  pausedSignal,
  resetGame,
  scoreSignal,
  syncViewport,
  updateGame,
} from './game-state';
import { inPlay } from './in-play';

import type { KeyboardState } from 'pixora';

let keyboard: KeyboardState | null = null;

export { resetGame } from './game-state';

export const gameScene = pixora.scene({
  key: 'game',
  render: (context) => {
    const viewport = context.viewport.get();

    const viewportWidth = viewport.width;
    const viewportHeight = viewport.height;

    syncViewport(viewportWidth, viewportHeight);

    if (!initializedSignal.get()) {
      keyboard = createKeyboardInput();
      initGame();
      initializedSignal.set(true);

      context.app.ticker.add((() => updateGame(context.app.ticker.deltaMS, context, keyboard)) as never);
    }

    emitScore(context);

    const score = scoreSignal.get();
    const level = levelSignal.get();
    const lives = livesSignal.get();
    const combo = comboSignal.get();
    const paused = pausedSignal.get();
    const gameOver = gameOverSignal.get();
    const scoreText = `SCORE: ${score.toLocaleString()}`;
    const levelText = `LEVEL: ${level}`;
    const livesText = 'LIVES:' + ' ♥'.repeat(lives);
    const comboText = combo > 1 ? `COMBO x${Math.min(Math.floor(combo / 5) + 1, 5)} (${combo})` : '';
    const livesX = rightAlignedTextX(viewportWidth, livesText, 18, 20, 0.58);

    return pixora.container(
      { x: 0, y: 0 },
      pixora.box({ backgroundColor: 0x0a0a1a, height: viewportHeight, width: viewportWidth, x: 0, y: 0 }),
      pixora.container(
        { x: 0, y: 0 },
        pixora.text({
          style: { fill: '#00ffaa', fontFamily: 'Orbitron, monospace', fontSize: 20, fontWeight: 'bold' },
          text: scoreText,
          x: 20,
          y: 16,
        }),
        pixora.text({
          anchor: { x: 0.5, y: 0 },
          style: { fill: '#ff00aa', fontFamily: 'Orbitron, monospace', fontSize: 20, fontWeight: 'bold' },
          text: levelText,
          x: viewportWidth / 2,
          y: 16,
        }),
        pixora.text({
          anchor: { x: 0.5, y: 0 },
          style: { fill: '#ffff00', fontFamily: 'Orbitron, monospace', fontSize: 16, fontWeight: 'bold' },
          text: comboText,
          x: viewportWidth / 2,
          y: 40,
        }),
        pixora.text({
          style: { fill: '#ff6644', fontFamily: 'Orbitron, monospace', fontSize: 18 },
          text: livesText,
          x: livesX,
          y: 18,
        }),
      ),
      inPlay(context),
      paused
        ? pixora.keyedContainer(
            'pause-overlay',
            { x: 0, y: 0 },
            pixora.text({
              anchor: { x: 0.5, y: 0 },
              style: { fill: '#ffffff', fontFamily: 'Orbitron, monospace', fontSize: 48, fontWeight: 'bold' },
              text: 'PAUSED',
              x: viewportWidth / 2,
              y: viewportHeight / 2 - 40,
            }),
            pixora.button({
              backgroundColor: 0x00ffaa,
              height: 48,
              label: 'CONTINUE',
              onPointerTap: () => pausedSignal.set(false),
              width: 200,
              x: viewportWidth / 2 - 100,
              y: viewportHeight / 2 + 40,
            }),
            pixora.button({
              backgroundColor: 0xff6644,
              height: 48,
              label: 'RESTART',
              onPointerTap: () => resetGame(),
              width: 200,
              x: viewportWidth / 2 - 100,
              y: viewportHeight / 2 + 100,
            }),
          )
        : null,
      gameOver
        ? pixora.keyedContainer(
            'game-over-overlay',
            { x: 0, y: 0 },
            pixora.text({
              anchor: { x: 0.5, y: 0 },
              style: { fill: '#ff4444', fontFamily: 'Orbitron, sans-serif', fontSize: 72, fontWeight: '900' },
              text: 'GAME OVER',
              x: viewportWidth / 2,
              y: viewportHeight / 2 - 100,
            }),
            pixora.button({
              backgroundColor: 0x00ffaa,
              height: 56,
              label: 'PLAY AGAIN',
              onPointerTap: () => resetGame(),
              width: 280,
              x: viewportWidth / 2 - 140,
              y: viewportHeight / 2 + 50,
            }),
            pixora.button({
              backgroundColor: 0x666688,
              height: 48,
              label: 'MAIN MENU',
              onPointerTap: () => {
                resetGame();
                void context.scenes.goTo('main-menu');
              },
              width: 280,
              x: viewportWidth / 2 - 140,
              y: viewportHeight / 2 + 120,
            }),
          )
        : null,
    );
  },
});

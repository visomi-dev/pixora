import { createKeyboardInput, pixora } from 'pixora';

import { createCenteredTextStyle, createMonoTextStyle, createTextStyle } from '../../shared/styles';
import { createBackground, createMenuButton } from '../../shared/ui';
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

    return pixora.container({
      style: {
        height: viewportHeight,
        position: 'relative',
        width: viewportWidth,
      },
      children: [
        createBackground(viewportWidth, viewportHeight),
        pixora.container({
          style: {
            height: viewportHeight,
            position: 'relative',
            width: viewportWidth,
          },
          children: [
            pixora.text({
              content: scoreText,
              style: {
                ...createTextStyle('#00ffaa', 20).style,
                left: 20,
                position: 'absolute',
                top: 16,
              },
            }),
            pixora.text({
              ...createCenteredTextStyle('#ff00aa', 20),
              content: levelText,
              style: {
                ...createCenteredTextStyle('#ff00aa', 20).style,
                left: viewportWidth / 2,
                position: 'absolute',
                top: 16,
              },
            }),
            pixora.text({
              ...createCenteredTextStyle('#ffff00', 16),
              content: comboText,
              style: {
                ...createCenteredTextStyle('#ffff00', 16).style,
                left: viewportWidth / 2,
                position: 'absolute',
                top: 40,
              },
            }),
            pixora.text({
              content: livesText,
              style: {
                ...createMonoTextStyle('#ff6644', 18).style,
                left: livesX,
                position: 'absolute',
                top: 18,
              },
            }),
          ],
        }),
        inPlay(context),
        paused
          ? pixora.container({
              key: 'pause-overlay',
              style: {
                height: viewportHeight,
                position: 'relative',
                width: viewportWidth,
              },
              children: [
                pixora.text({
                  ...createCenteredTextStyle('#ffffff', 48),
                  content: 'PAUSED',
                  style: {
                    ...createCenteredTextStyle('#ffffff', 48).style,
                    left: viewportWidth / 2,
                    position: 'absolute',
                    top: viewportHeight / 2 - 40,
                  },
                }),
                createMenuButton({
                  backgroundColor: 0x00ffaa,
                  height: 48,
                  key: 'continue',
                  label: 'CONTINUE',
                  left: viewportWidth / 2 - 100,
                  onPointerTap: () => pausedSignal.set(false),
                  top: viewportHeight / 2 + 40,
                  width: 200,
                }),
                createMenuButton({
                  backgroundColor: 0xff6644,
                  height: 48,
                  key: 'restart',
                  label: 'RESTART',
                  left: viewportWidth / 2 - 100,
                  onPointerTap: () => resetGame(),
                  top: viewportHeight / 2 + 100,
                  width: 200,
                }),
              ],
            })
          : null,
        gameOver
          ? pixora.container({
              key: 'game-over-overlay',
              style: {
                height: viewportHeight,
                position: 'relative',
                width: viewportWidth,
              },
              children: [
                pixora.text({
                  ...createCenteredTextStyle('#ff4444', 72, '900'),
                  content: 'GAME OVER',
                  style: {
                    ...createCenteredTextStyle('#ff4444', 72, '900').style,
                    left: viewportWidth / 2,
                    position: 'absolute',
                    top: viewportHeight / 2 - 100,
                  },
                }),
                createMenuButton({
                  backgroundColor: 0x00ffaa,
                  height: 56,
                  key: 'play-again',
                  label: 'PLAY AGAIN',
                  left: viewportWidth / 2 - 140,
                  onPointerTap: () => resetGame(),
                  top: viewportHeight / 2 + 50,
                  width: 280,
                }),
                createMenuButton({
                  backgroundColor: 0x666688,
                  height: 48,
                  key: 'main-menu',
                  label: 'MAIN MENU',
                  left: viewportWidth / 2 - 140,
                  onPointerTap: () => {
                    resetGame();
                    void context.scenes.goTo('main-menu');
                  },
                  top: viewportHeight / 2 + 120,
                  width: 280,
                }),
              ],
            })
          : null,
      ],
    });
  },
});

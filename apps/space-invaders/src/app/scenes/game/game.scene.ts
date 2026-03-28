import { createKeyboardInput, pixora } from 'pixora';

import { getSceneMetrics, shouldUseTouchControls } from '../../shared/layout';
import { createMenuButtonProps } from '../../shared/ui';

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
  touchControlsActiveSignal,
  updateGame,
} from './game-state';
import { inPlay } from './in-play';
import { touchControls } from './touch-controls';

import type { KeyboardState, PixoraNode } from 'pixora';

let keyboard: KeyboardState | null = null;

export { resetGame } from './game-state';

export const gameScene = pixora.scene({
  key: 'game',
  render: (context) => {
    const viewport = context.viewport.get();
    const metrics = getSceneMetrics(viewport);
    const useTouchControls = shouldUseTouchControls(viewport);

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
    const touchActive = touchControlsActiveSignal.get() || useTouchControls;
    const scoreText = `SCORE: ${score.toLocaleString()}`;
    const levelText = `LEVEL: ${level}`;
    const livesText = 'LIVES:' + ' ♥'.repeat(lives);
    const comboText = combo > 1 ? `COMBO x${Math.min(Math.floor(combo / 5) + 1, 5)} (${combo})` : '';

    return pixora.container({
      style: {
        backgroundColor: 0x0a0a1a,
        height: viewportHeight,
        position: 'relative',
        width: viewportWidth,
      },
      children: [
        inPlay(context),
        pixora.container({
          key: 'hud',
          style: {
            alignItems: metrics.hudCompact ? 'stretch' : 'center',
            display: 'flex',
            flexDirection: 'column',
            gap: Math.max(8, metrics.gap / 2),
            left: 0,
            padding: metrics.padding,
            position: 'absolute',
            top: 0,
            width: '100%',
          },
          children: [
            pixora.container({
              style: {
                alignItems: 'center',
                columnGap: Math.max(10, metrics.gap / 2),
                display: 'flex',
                flexDirection: metrics.hudCompact ? 'column' : 'row',
                flexWrap: 'wrap',
                justifyContent: 'space-between',
                rowGap: Math.max(8, metrics.gap / 2),
                width: '100%',
              },
              children: [
                pixora.container({
                  style: {
                    alignItems: 'center',
                    backgroundColor: 0x12172a,
                    borderRadius: 16,
                    columnGap: Math.max(10, metrics.gap / 2),
                    display: 'flex',
                    flexGrow: 1,
                    flexDirection: metrics.hudCompact ? 'column' : 'row',
                    flexWrap: 'wrap',
                    justifyContent: metrics.hudCompact ? 'center' : 'flex-start',
                    padding: Math.max(10, metrics.panelPadding - 8),
                    rowGap: Math.max(8, metrics.gap / 2),
                  },
                  children: [
                    createHudLabel(scoreText, '#00ffaa', 20),
                    createHudLabel(levelText, '#ff00aa', 20),
                    createHudLabel(livesText, '#ff6644', 18, true),
                    comboText
                      ? createHudLabel(comboText, '#ffff00', 16)
                      : pixora.container({ key: 'combo-placeholder', style: { display: 'none', width: 0 } }),
                  ],
                }),
                pixora.button(
                  createMenuButtonProps({
                    backgroundColor: 0x20263a,
                    height: Math.max(42, metrics.buttonHeight - 10),
                    key: 'pause',
                    label: paused ? 'RESUME' : 'PAUSE',
                    labelColor: '#f4f7fb',
                    labelSize: metrics.bodySize,
                    onPointerTap: () => pausedSignal.set(!pausedSignal.get()),
                    width: metrics.hudCompact
                      ? Math.min(metrics.buttonWidth, viewportWidth - metrics.padding * 2)
                      : 120,
                  }),
                ),
              ],
            }),
            touchActive
              ? pixora.text({
                  anchor: { x: 0.5, y: 0 },
                  content: 'DRAG LEFT PAD TO MOVE  •  HOLD FIRE TO SHOOT',
                  style: {
                    align: 'center',
                    ...monoTextStyle('#7f92b5', Math.max(12, metrics.bodySize - 2)),
                  },
                })
              : null,
          ],
        }),
        useTouchControls ? touchControls(context) : null,
        paused
          ? createOverlay({
              actions: [
                pixora.button(
                  createMenuButtonProps({
                    backgroundColor: 0x00ffaa,
                    height: Math.max(46, metrics.buttonHeight - 6),
                    key: 'continue',
                    label: 'CONTINUE',
                    labelSize: metrics.bodySize + 1,
                    onPointerTap: () => pausedSignal.set(false),
                    style: { maxWidth: metrics.buttonWidth, width: '100%' },
                    width: metrics.buttonWidth,
                  }),
                ),
                pixora.button(
                  createMenuButtonProps({
                    backgroundColor: 0xff6644,
                    height: Math.max(46, metrics.buttonHeight - 6),
                    key: 'restart',
                    label: 'RESTART',
                    labelSize: metrics.bodySize + 1,
                    onPointerTap: () => resetGame(),
                    style: { maxWidth: metrics.buttonWidth, width: '100%' },
                    width: metrics.buttonWidth,
                  }),
                ),
              ],
              description: touchActive
                ? 'Touch controls stay active while the battle is paused.'
                : 'Press P, ESC, or tap resume.',
              key: 'pause-overlay',
              metrics,
              title: 'PAUSED',
              titleColor: '#ffffff',
              viewportHeight,
              viewportWidth,
            })
          : null,
        gameOver
          ? createOverlay({
              actions: [
                pixora.button(
                  createMenuButtonProps({
                    backgroundColor: 0x00ffaa,
                    height: metrics.buttonHeight,
                    key: 'play-again',
                    label: 'PLAY AGAIN',
                    labelSize: metrics.bodySize + 2,
                    onPointerTap: () => resetGame(),
                    style: { maxWidth: metrics.buttonWidth, width: '100%' },
                    width: metrics.buttonWidth,
                  }),
                ),
                pixora.button(
                  createMenuButtonProps({
                    backgroundColor: 0x666688,
                    height: Math.max(46, metrics.buttonHeight - 6),
                    key: 'main-menu',
                    label: 'MAIN MENU',
                    labelColor: '#f4f7fb',
                    labelSize: metrics.bodySize + 1,
                    onPointerTap: () => {
                      resetGame();
                      void context.scenes.goTo('main-menu');
                    },
                    style: { maxWidth: metrics.buttonWidth, width: '100%' },
                    width: metrics.buttonWidth,
                  }),
                ),
              ],
              description: `FINAL SCORE ${score.toLocaleString()}`,
              key: 'game-over-overlay',
              metrics,
              title: 'GAME OVER',
              titleColor: '#ff4444',
              viewportHeight,
              viewportWidth,
            })
          : null,
      ],
    });
  },
});

function createHudLabel(
  content: string,
  color: string,
  fontSize: number,
  mono = false,
): ReturnType<typeof pixora.text> {
  const base = mono ? monoTextStyle(color, fontSize) : textStyle(color, fontSize);

  return pixora.text({
    content,
    style: {
      ...base,
      align: 'center',
    },
  });
}

type OverlayOptions = {
  actions: PixoraNode[];
  description: string;
  key: string;
  metrics: ReturnType<typeof getSceneMetrics>;
  title: string;
  titleColor: string;
  viewportHeight: number;
  viewportWidth: number;
};

function createOverlay(options: OverlayOptions): ReturnType<typeof pixora.container> {
  return pixora.container({
    key: options.key,
    style: {
      alignItems: 'center',
      display: 'flex',
      flexDirection: 'column',
      height: options.viewportHeight,
      justifyContent: 'center',
      left: 0,
      padding: options.metrics.padding,
      position: 'absolute',
      top: 0,
      width: options.viewportWidth,
    },
    children: [
      pixora.container({
        key: `${options.key}-scrim`,
        style: {
          backgroundColor: 0x03050b,
          height: options.viewportHeight,
          left: 0,
          opacity: 0.82,
          position: 'absolute',
          top: 0,
          width: options.viewportWidth,
        },
      }),
      pixora.container({
        key: `${options.key}-panel`,
        style: {
          alignItems: 'center',
          backgroundColor: 0x12172a,
          borderRadius: 20,
          display: 'flex',
          flexDirection: 'column',
          gap: Math.max(10, options.metrics.gap - 4),
          maxWidth: options.metrics.contentWidth,
          padding: options.metrics.panelPadding,
          width: '100%',
        },
        children: [
          pixora.text({
            anchor: { x: 0.5, y: 0 },
            content: options.title,
            style: {
              align: 'center',
              ...textStyle(options.titleColor, options.metrics.titleSize, '900'),
            },
          }),
          pixora.text({
            anchor: { x: 0.5, y: 0 },
            content: options.description,
            style: {
              align: 'center',
              ...textStyle('#ffffff', Math.max(18, options.metrics.bodySize + 2), '700'),
            },
          }),
          pixora.container({
            style: {
              alignItems: 'center',
              display: 'flex',
              flexDirection: 'column',
              gap: Math.max(10, options.metrics.gap - 6),
              width: '100%',
            },
            children: options.actions,
          }),
        ],
      }),
    ],
  });
}

function textStyle(color: string, fontSize: number, fontWeight = '700') {
  return {
    color,
    fontFamily: 'Orbitron, sans-serif',
    fontSize,
    fontWeight,
  };
}

function monoTextStyle(color: string, fontSize: number) {
  return {
    color,
    fontFamily: 'JetBrains Mono, monospace',
    fontSize,
  };
}

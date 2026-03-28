import { pixora } from 'pixora';

import { getSceneMetrics } from '../../shared/layout';
import { createMenuButtonProps } from '../../shared/ui';
import { scoreSignal } from '../game/game-state';

export const gameOverScene = pixora.scene({
  key: 'game-over',
  render: (context) => {
    const viewport = context.viewport.get();
    const metrics = getSceneMetrics(viewport);
    const scoreText = `SCORE: ${scoreSignal.get().toLocaleString()}`;

    let highScoreText = 'HIGH SCORE: 0';
    try {
      const saved = localStorage.getItem('spaceInvadersHighScore');
      if (saved) {
        highScoreText = `HIGH SCORE: ${parseInt(saved, 10).toLocaleString()}`;
      }
    } catch {
      // localStorage not available
    }

    return pixora.container({
      style: {
        alignItems: 'center',
        backgroundColor: 0x0a0a1a,
        display: 'flex',
        flexDirection: 'column',
        height: viewport.height,
        justifyContent: 'center',
        padding: metrics.padding,
        position: 'relative',
        rowGap: metrics.gap,
        width: viewport.width,
      },
      children: [
        pixora.container({
          style: {
            alignItems: 'center',
            backgroundColor: 0x12172a,
            borderRadius: 20,
            display: 'flex',
            flexDirection: 'column',
            gap: Math.max(10, metrics.gap - 4),
            maxWidth: metrics.contentWidth,
            padding: metrics.panelPadding,
            width: '100%',
          },
          children: [
            pixora.text({
              content: 'GAME OVER',
              anchor: { x: 0.5, y: 0 },
              style: textStyle('#ff4444', metrics.titleSize, '900'),
            }),
            pixora.text({
              anchor: { x: 0.5, y: 0 },
              content: scoreText,
              style: {
                align: 'center',
                ...textStyle('#ffffff', Math.max(24, metrics.subtitleSize + 4)),
              },
            }),
            pixora.text({
              anchor: { x: 0.5, y: 0 },
              content: highScoreText,
              style: {
                align: 'center',
                ...monoTextStyle('#ffff00', metrics.bodySize + 4),
              },
            }),
            pixora.container({
              style: {
                alignItems: 'center',
                display: 'flex',
                flexDirection: 'column',
                gap: Math.max(10, metrics.gap - 6),
                width: '100%',
              },
              children: [
                pixora.button(
                  createMenuButtonProps({
                    backgroundColor: 0x00ffaa,
                    height: metrics.buttonHeight,
                    key: 'play-again',
                    label: 'PLAY AGAIN',
                    labelSize: metrics.bodySize + 3,
                    onPointerTap: () => void context.scenes.goTo('game'),
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
                    onPointerTap: () => void context.scenes.goTo('main-menu'),
                    style: { maxWidth: metrics.buttonWidth, width: '100%' },
                    width: metrics.buttonWidth,
                  }),
                ),
              ],
            }),
          ],
        }),
      ],
    });
  },
});

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

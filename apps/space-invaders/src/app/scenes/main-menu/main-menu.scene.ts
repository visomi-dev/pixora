import { pixora } from 'pixora';

import { getSceneMetrics } from '../../shared/layout';
import { createMenuButtonProps } from '../../shared/ui';

export const mainMenuScene = pixora.scene({
  key: 'main-menu',
  render: (context) => {
    const viewport = context.viewport.get();
    const metrics = getSceneMetrics(viewport);

    let highScoreText = 'GALACTIC DEFENSE v2.0';

    try {
      const saved = localStorage.getItem('spaceInvadersHighScore');

      if (saved) {
        highScoreText = `GALACTIC DEFENSE v2.0 | HIGH SCORE: ${parseInt(saved, 10).toLocaleString()}`;
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
        padding: metrics.padding,
        position: 'absolute',
        rowGap: metrics.gap,
        top: 0,
        left: 0,
        width: viewport.width,
      },
      children: [
        pixora.container({
          style: {
            alignItems: 'center',
            display: 'flex',
            flexDirection: 'column',
            flexGrow: 1,
            gap: metrics.gap,
            justifyContent: 'center',
            width: metrics.contentWidth,
          },
          children: [
            pixora.container({
              style: {
                alignItems: 'center',
                display: 'flex',
                flexDirection: 'column',
                gap: Math.max(6, metrics.gap / 2),
                width: metrics.contentWidth,
              },
              children: [
                pixora.text({
                  content: 'SPACE',
                  style: {
                    align: 'center',
                    color: '#00ffaa',
                    fontFamily: 'Orbitron, sans-serif',
                    fontSize: metrics.titleSize,
                    fontWeight: '900',
                  },
                }),
                pixora.text({
                  content: 'INVADERS',
                  style: {
                    align: 'center',
                    color: '#ff00aa',
                    fontFamily: 'Orbitron, sans-serif',
                    fontSize: Math.max(28, Math.round(metrics.titleSize * 0.65)),
                    fontWeight: '700',
                  },
                }),
                pixora.text({
                  content: metrics.isCompact
                    ? 'Swipe into formation. Tap the controls to survive the next wave.'
                    : 'Pilot the last defense wing. Use keyboard or touch controls to repel the invasion.',
                  style: {
                    align: 'center',
                    color: '#8ea5c6',
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: metrics.bodySize,
                  },
                }),
              ],
            }),
            pixora.container({
              style: {
                alignItems: 'center',
                display: 'flex',
                flexDirection: 'column',
                gap: Math.max(10, metrics.gap - 4),
                width: metrics.buttonWidth,
              },
              children: [
                pixora.button(
                  createMenuButtonProps({
                    backgroundColor: 0x00ffaa,
                    height: metrics.buttonHeight,
                    key: 'start-game',
                    label: 'START GAME',
                    labelSize: metrics.bodySize + 4,
                    onPointerTap: () => void context.scenes.goTo('game'),
                    width: metrics.buttonWidth,
                  }),
                ),
                pixora.button(
                  createMenuButtonProps({
                    backgroundColor: 0x333366,
                    height: Math.max(46, metrics.buttonHeight - 6),
                    key: 'instructions',
                    label: 'INSTRUCTIONS',
                    labelColor: '#f4f7fb',
                    labelSize: metrics.bodySize + 1,
                    onPointerTap: () => void context.scenes.goTo('instructions'),
                    width: metrics.buttonWidth,
                  }),
                ),
              ],
            }),
          ],
        }),
        pixora.container({
          style: {
            alignItems: 'center',
            display: 'flex',
            justifyContent: 'center',
            marginTop: 'auto',
            width: viewport.width - metrics.padding * 2,
          },
          children: [
            pixora.text({
              content: highScoreText,
              style: {
                align: 'center',
                color: '#666688',
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: Math.max(14, metrics.bodySize - 2),
              },
            }),
          ],
        }),
      ],
    });
  },
});

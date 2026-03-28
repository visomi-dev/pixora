import { pixora } from 'pixora';

import { getSceneMetrics } from '../../shared/layout';
import { createMenuButtonProps } from '../../shared/ui';

export const instructionsScene = pixora.scene({
  key: 'instructions',
  render: (context) => {
    const viewport = context.viewport.get();
    const metrics = getSceneMetrics(viewport);
    const isCompactMobile = metrics.isCompact && metrics.isPortrait;
    const sectionTitleSize = isCompactMobile ? Math.max(18, metrics.subtitleSize - 4) : metrics.subtitleSize;
    const sectionBodySize = isCompactMobile ? Math.max(11, metrics.bodySize - 3) : metrics.bodySize;
    const introBodySize = isCompactMobile ? Math.max(12, metrics.bodySize - 2) : metrics.bodySize;
    const controlsLines = isCompactMobile
      ? ['LEFT / RIGHT OR A / D', 'MOVE SHIP', 'SPACE - FIRE', 'P OR ESC - PAUSE', 'MOBILE - DRAG AND HOLD FIRE']
      : [
          'LEFT / RIGHT OR A / D - MOVE SHIP',
          'SPACE - FIRE',
          'P OR ESC - PAUSE',
          'MOBILE - DRAG MOVE PAD AND HOLD FIRE',
        ];
    const powerUpLines = isCompactMobile
      ? [
          'SPEED BOOST - FASTER MOVE',
          'SHIELD - TEMPORARY COVER',
          'TRIPLE SHOT - THREE BULLETS',
          'SMART BOMB - CLEAR A ROW',
        ]
      : [
          'SPEED BOOST - MOVE FASTER',
          'SHIELD - TEMPORARY PROTECTION',
          'TRIPLE SHOT - FIRE THREE BULLETS',
          'SMART BOMB - CLEAR A ROW',
        ];
    const tipLines = isCompactMobile
      ? [
          'CHAIN HITS FOR SCORE BOOSTS.',
          'CLEAR WAVES QUICKLY FOR BONUS.',
          'CATCH FALLING POWER-UPS.',
          'EVERY LEVEL GETS HARDER.',
        ]
      : [
          'CHAIN ELIMINATIONS FOR SCORE MULTIPLIERS.',
          'DESTROY WAVES QUICKLY FOR BONUS POINTS.',
          'WATCH FOR FALLING POWER-UPS.',
          'EACH LEVEL RAMPS UP THE PRESSURE.',
        ];

    return pixora.container({
      style: {
        alignItems: 'center',
        backgroundColor: 0x0a0a1a,
        display: 'flex',
        flexDirection: 'column',
        height: viewport.height,
        padding: isCompactMobile ? Math.max(12, metrics.padding - 4) : metrics.padding,
        position: 'relative',
        rowGap: isCompactMobile ? Math.max(10, metrics.gap - 4) : metrics.gap,
        width: viewport.width,
      },
      children: [
        pixora.container({
          style: {
            alignItems: 'center',
            display: 'flex',
            flexDirection: 'column',
            gap: isCompactMobile ? 8 : Math.max(8, metrics.gap / 2),
            width: metrics.contentWidth,
          },
          children: [
            pixora.text({
              content: 'INSTRUCTIONS',
              anchor: { x: 0.5, y: 0 },
              style: {
                color: '#00ffaa',
                fontFamily: 'Orbitron, sans-serif',
                fontSize: Math.max(34, metrics.titleSize - 8),
                fontWeight: '900',
              },
            }),
            pixora.text({
              anchor: { x: 0.5, y: 0 },
              content: metrics.isPortrait
                ? 'Use keyboard on desktop or the on-screen controls on mobile.'
                : 'Desktop players use keyboard controls. Mobile pilots can drag the left pad and hold fire.',
              style: {
                align: 'center',
                color: '#8ea5c6',
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: introBodySize,
              },
            }),
          ],
        }),
        pixora.container({
          style: {
            backgroundColor: 0x12172a,
            borderRadius: 18,
            display: 'flex',
            flexDirection: 'column',
            flexGrow: 1,
            gap: isCompactMobile ? Math.max(10, metrics.gap - 6) : metrics.gap,
            padding: isCompactMobile ? Math.max(12, metrics.panelPadding - 6) : metrics.panelPadding,
            width: metrics.contentWidth,
          },
          children: [
            createSection('CONTROLS', controlsLines, sectionTitleSize, sectionBodySize),
            createSection('POWER-UPS', powerUpLines, sectionTitleSize, sectionBodySize),
            createSection('TIPS', tipLines, sectionTitleSize, sectionBodySize),
          ],
        }),
        pixora.button(
          createMenuButtonProps({
            backgroundColor: 0x00ffaa,
            height: metrics.buttonHeight,
            key: 'back',
            label: 'BACK',
            labelSize: metrics.bodySize + 2,
            onPointerTap: () => void context.scenes.goTo('main-menu'),
            style: { marginTop: isCompactMobile ? 0 : 'auto' },
            width: Math.min(metrics.buttonWidth, 220),
          }),
        ),
      ],
    });
  },
});

function createSection(
  title: string,
  lines: string[],
  titleSize: number,
  bodySize: number,
): ReturnType<typeof pixora.container> {
  return pixora.container({
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: Math.max(4, Math.round(bodySize / 2)),
      width: '100%',
    },
    children: [
      pixora.text({
        anchor: { x: 0.5, y: 0 },
        content: title,
        style: {
          align: 'center',
          ...textStyle('#ff00aa', titleSize, '700'),
        },
      }),
      ...lines.map((line) =>
        pixora.text({
          anchor: { x: 0.5, y: 0 },
          content: line,
          style: {
            align: 'center',
            ...monoTextStyle('#ffffff', bodySize),
          },
        }),
      ),
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

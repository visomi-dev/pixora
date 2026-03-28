import { pixora } from 'pixora';

import { getMenuMetrics } from '../layout';

export const mainMenuScene = pixora.scene({
  key: 'main-menu',
  render(context) {
    const viewport = context.viewport.get();
    const metrics = getMenuMetrics(viewport);

    return pixora.container({
      label: 'MainMenu',
      style: {
        alignItems: 'center',
        backgroundColor: 0xffb6c1,
        display: 'flex',
        flexDirection: 'column',
        height: viewport.height,
        justifyContent: 'center',
        padding: metrics.padding,
        rowGap: metrics.gap,
        width: viewport.width,
      },
      children: [
        pixora.container({
          style: {
            alignItems: 'center',
            backgroundColor: 0xffeef4,
            borderRadius: 28,
            display: 'flex',
            flexDirection: 'column',
            gap: Math.max(8, metrics.gap / 2),
            maxWidth: metrics.contentWidth,
            padding: metrics.padding,
            width: '100%',
          },
          children: [
            pixora.text({
              content: 'Catfe Express',
              label: 'MainMenuTitle',
              style: {
                align: 'center',
                color: '#4a3728',
                fontFamily: 'Baloo2, sans-serif',
                fontSize: metrics.titleSize,
                fontWeight: '700',
              },
            }),
            pixora.text({
              content: 'A cozy train ride full of cats, coffee, and tiny decisions.',
              label: 'MainMenuSubtitle',
              style: {
                align: 'center',
                color: '#7a5a4a',
                fontFamily: 'Nunito, sans-serif',
                fontSize: metrics.bodySize,
                fontWeight: '700',
              },
            }),
            pixora.text({
              content: metrics.isPortrait
                ? 'Play comfortably on phone, tablet, or desktop.'
                : 'Designed to feel playful and readable on any screen size.',
              label: 'MainMenuDescription',
              style: {
                align: 'center',
                color: '#9c7560',
                fontFamily: 'Nunito, sans-serif',
                fontSize: Math.max(14, metrics.bodySize - 2),
                fontWeight: '600',
              },
            }),
          ],
        }),
        pixora.button({
          animation: { durationMs: 100, pressedScale: 1, hoverScale: 1 },
          key: 'play-button',
          label: 'PlayButton',
          text: {
            content: 'Play',
            offset: {
              y: -4,
            },
            style: {
              color: '#4a3728',
              fontFamily: 'Fredoka, sans-serif',
              fontSize: metrics.isCompact ? 24 : 28,
              fontWeight: '700',
            },
          },
          onPointerTap: () => console.log('Play pressed'),
          style: {
            height: metrics.buttonHeight,
            width: metrics.buttonWidth,
          },
          textures: {
            hovered: pixora.texture('buttonPressed'),
            idle: pixora.texture('buttonDefault'),
            pressed: pixora.texture('buttonPressed'),
          },
        }),
      ],
    });
  },
});

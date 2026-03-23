import { pixora } from 'pixora';

export const mainMenuScene = pixora.scene({
  key: 'main-menu',
  render(context) {
    const viewport = context.viewport.get();

    return pixora.container({
      label: 'MainMenu',
      style: {
        backgroundColor: 0xffb6c1,
        height: viewport.height,
        width: viewport.width,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      },
      children: [
        pixora.text({
          content: 'Catfé Express',
          label: 'MainMenuTitle',
          style: {
            color: '#4a3728',
            fontFamily: 'Baloo2, sans-serif',
            fontSize: 32,
            fontWeight: '700',
          },
        }),
        pixora.button({
          animation: { durationMs: 100, pressedScale: 1, hoverScale: 1 },
          key: 'play-button',
          label: 'PlayButton',
          text: {
            content: 'Play',
            offset: {
              y: -6,
            },
            style: {
              color: '#4a3728',
              fontFamily: 'Fredoka, sans-serif',
              fontSize: 28,
              fontWeight: '700',
            },
          },
          onPointerTap: () => console.log('Play pressed'),
          style: {
            height: 72,
            width: 280,
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

import { pixora } from 'pixora';

export const mainMenuScene = pixora.scene({
  key: 'main-menu',
  render(context) {
    const viewport = context.viewport.get();

    return pixora.container({
      label: 'MainMenu',
      style: {
        height: viewport.height,
        width: viewport.width,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      },
      children: [
        pixora.text({
          content: 'Catfe Express',
          label: 'MainMenuTitle',
          style: {
            color: '#4a3728',
            fontFamily: 'Baloo2, sans-serif',
            fontSize: 32,
            fontWeight: '700',
          },
        }),
        pixora.button({
          animation: { durationMs: 100 },
          key: 'play-button',
          label: 'PlayButton',
          text: {
            content: 'Play',
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
            idle: pixora.texture('buttonIdle'),
            pressed: pixora.texture('buttonPressed'),
          },
        }),
      ],
    });
  },
});

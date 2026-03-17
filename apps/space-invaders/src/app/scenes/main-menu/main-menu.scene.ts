import { layout, pixora } from 'pixora';

export const mainMenuScene = pixora.scene({
  key: 'main-menu',
  render: (context) => {
    const vp = context.viewport.get();

    let highScoreText = 'GALACTIC DEFENSE v2.0';
    try {
      const saved = localStorage.getItem('spaceInvadersHighScore');
      if (saved) {
        highScoreText = `GALACTIC DEFENSE v2.0 | HIGH SCORE: ${parseInt(saved, 10).toLocaleString()}`;
      }
    } catch {
      // localStorage not available
    }

    return pixora.container(
      { x: 0, y: 0 },
      pixora.box({ backgroundColor: 0x0a0a1a, height: vp.height, width: vp.width, x: 0, y: 0 }),
      pixora.container(
        {
          layout: layout.percent({
            horizontal: 'center',
            vertical: 'start',
            width: 1,
          }),
        },
        pixora.container(
          {
            layout: layout.flex({
              direction: 'vertical',
              justify: 'center',
              align: 'center',
              gap: 8,
            }),
            y: vp.height * 0.15,
          },
          pixora.text({ text: 'SPACE', color: '#00ffaa', size: 72, weight: '900', font: 'Orbitron, sans-serif' }),
          pixora.text({ text: 'INVADERS', color: '#ff00aa', size: 48, weight: '700', font: 'Orbitron, sans-serif' }),
        ),
      ),
      pixora.container(
        {
          layout: layout.percent({
            horizontal: 'center',
            vertical: 'center',
            width: 1,
          }),
        },
        pixora.container(
          {
            layout: layout.flex({
              direction: 'vertical',
              justify: 'space-between',
              align: 'center',
              gap: 16,
            }),
          },
          pixora.button({
            backgroundColor: 0x00ffaa,
            height: 56,
            label: 'START GAME',
            onPointerTap: () => void context.scenes.goTo('game'),
            width: 280,
          }),
          pixora.button({
            backgroundColor: 0x333366,
            height: 48,
            label: 'INSTRUCTIONS',
            onPointerTap: () => void context.scenes.goTo('instructions'),
            width: 280,
          }),
        ),
      ),
      pixora.text({
        text: highScoreText,
        color: '#666688',
        size: 14,
        font: 'JetBrains Mono, monospace',
        layout: layout.percent({
          horizontal: 'center',
          vertical: 'end',
        }),
      }),
    );
  },
});

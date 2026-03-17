import { layout, pixora } from 'pixora';

export const gameOverScene = pixora.scene({
  key: 'game-over',
  render: (context) => {
    const vp = context.viewport.get();

    let highScoreText = 'HIGH SCORE: 0';
    try {
      const saved = localStorage.getItem('spaceInvadersHighScore');
      if (saved) {
        highScoreText = `HIGH SCORE: ${parseInt(saved, 10).toLocaleString()}`;
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
            vertical: 'center',
            width: 1,
          }),
        },
        pixora.container(
          {
            layout: layout.flex({
              direction: 'vertical',
              justify: 'center',
              align: 'center',
              gap: 16,
            }),
          },
          pixora.text({ text: 'GAME OVER', color: '#ff4444', size: 72, weight: '900', font: 'Orbitron, sans-serif' }),
          pixora.text({ text: 'SCORE: 0', color: '#ffffff', size: 32, font: 'Orbitron, sans-serif' }),
          pixora.text({ text: highScoreText, color: '#ffff00', size: 24, font: 'Orbitron, sans-serif' }),
          pixora.button({
            backgroundColor: 0x00ffaa,
            height: 56,
            label: 'PLAY AGAIN',
            onPointerTap: () => void context.scenes.goTo('game'),
            width: 280,
          }),
          pixora.button({
            backgroundColor: 0x666688,
            height: 48,
            label: 'MAIN MENU',
            onPointerTap: () => void context.scenes.goTo('main-menu'),
            width: 280,
          }),
        ),
      ),
    );
  },
});

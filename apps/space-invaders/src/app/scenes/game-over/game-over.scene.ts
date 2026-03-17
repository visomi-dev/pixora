import { createTextStyle } from '../../shared/styles';

import { pixora } from 'pixora';

export const gameOverScene = pixora.scene({
  key: 'game-over',
  render: (context) => {
    const vp = context.viewport.get();
    const w = vp.width;
    const h = vp.height;

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
      pixora.box({ backgroundColor: 0x0a0a1a, height: h, width: w, x: 0, y: 0 }),
      pixora.container(
        { x: 0, y: 0 },
        pixora.text({ ...createTextStyle('#ff4444', 72, '900'), text: 'GAME OVER', x: w / 2, y: h / 2 - 150 }),
        pixora.text({ ...createTextStyle('#ffffff', 32), text: 'SCORE: 0', x: w / 2, y: h / 2 - 50 }),
        pixora.text({ ...createTextStyle('#ffff00', 24), text: highScoreText, x: w / 2, y: h / 2 + 10 }),
        pixora.button({
          backgroundColor: 0x00ffaa,
          height: 56,
          label: 'PLAY AGAIN',
          onPointerTap: () => void context.scenes.goTo('game'),
          width: 280,
          x: w / 2 - 140,
          y: h / 2 + 120,
        }),
        pixora.button({
          backgroundColor: 0x666688,
          height: 48,
          label: 'MAIN MENU',
          onPointerTap: () => void context.scenes.goTo('main-menu'),
          width: 280,
          x: w / 2 - 140,
          y: h / 2 + 190,
        }),
      ),
    );
  },
});

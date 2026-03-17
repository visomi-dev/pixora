import { createMonoTextStyle, createTextStyle } from '../../shared/styles';

import { pixora } from 'pixora';

export const mainMenuScene = pixora.scene({
  key: 'main-menu',
  render: (context) => {
    const vp = context.viewport.get();
    const centerX = vp.width / 2;
    const centerY = vp.height / 2;
    const titleY = vp.height * 0.12;

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
      pixora.text({ ...createTextStyle('#00ffaa', 72, '900'), text: 'SPACE', x: centerX, y: titleY }),
      pixora.text({ ...createTextStyle('#ff00aa', 48, '700'), text: 'INVADERS', x: centerX, y: titleY + 62 }),
      pixora.text({ ...createMonoTextStyle('#666688', 14), text: highScoreText, x: centerX, y: vp.height - 40 }),
      pixora.container(
        { x: centerX - 140, y: centerY + 60 },
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
          y: 70,
        }),
      ),
    );
  },
});

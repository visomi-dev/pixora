import { createTextStyle } from '../../shared/styles';

import { pixora } from 'pixora';

export const victoryScene = pixora.scene({
  key: 'victory',
  render: (context) => {
    const vp = context.viewport.get();
    const w = vp.width;
    const h = vp.height;

    return pixora.container(
      { x: 0, y: 0 },
      pixora.box({ backgroundColor: 0x0a0a1a, height: h, width: w, x: 0, y: 0 }),
      pixora.container(
        { x: 0, y: 0 },
        pixora.text({ ...createTextStyle('#00ffaa', 72, '900'), text: 'VICTORY!', x: w / 2, y: h / 2 - 120 }),
        pixora.text({ ...createTextStyle('#ff00aa', 28), text: 'GALAXY DEFENDED!', x: w / 2, y: h / 2 - 30 }),
        pixora.text({ ...createTextStyle('#ffffff', 32), text: 'FINAL SCORE: 0', x: w / 2, y: h / 2 + 40 }),
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

import { pixora } from 'pixora';

import { createCenteredMonoTextStyle, createCenteredTextStyle } from '../../shared/styles';
import { centeredBoxX } from '../scene-positioning';
import { createBackground, createMenuButton } from '../../shared/ui';

export const gameOverScene = pixora.scene({
  key: 'game-over',
  render: (context) => {
    const vp = context.viewport.get();
    const headingY = Math.max(140, vp.height * 0.22);
    const menuX = centeredBoxX(vp.width, 280);

    let highScoreText = 'HIGH SCORE: 0';
    try {
      const saved = localStorage.getItem('spaceInvadersHighScore');
      if (saved) {
        highScoreText = `HIGH SCORE: ${parseInt(saved, 10).toLocaleString()}`;
      }
    } catch {
      // localStorage not available
    }

    return pixora.container({
      style: {
        height: vp.height,
        position: 'relative',
        width: vp.width,
      },
      children: [
        createBackground(vp.width, vp.height),
        pixora.text({
          ...createCenteredTextStyle('#ff4444', 72, '900'),
          content: 'GAME OVER',
          style: {
            ...createCenteredTextStyle('#ff4444', 72, '900').style,
            left: vp.width / 2,
            position: 'absolute',
            top: headingY,
          },
        }),
        pixora.text({
          ...createCenteredTextStyle('#ffffff', 32),
          content: 'SCORE: 0',
          style: {
            ...createCenteredTextStyle('#ffffff', 32).style,
            left: vp.width / 2,
            position: 'absolute',
            top: headingY + 110,
          },
        }),
        pixora.text({
          ...createCenteredMonoTextStyle('#ffff00', 24),
          content: highScoreText,
          style: {
            align: 'center',
            ...createCenteredMonoTextStyle('#ffff00', 24).style,
            left: vp.width / 2,
            position: 'absolute',
            top: headingY + 160,
          },
        }),
        createMenuButton({
          backgroundColor: 0x00ffaa,
          height: 56,
          key: 'play-again',
          label: 'PLAY AGAIN',
          left: menuX,
          onPointerTap: () => void context.scenes.goTo('game'),
          top: headingY + 240,
          width: 280,
        }),
        createMenuButton({
          backgroundColor: 0x666688,
          height: 48,
          key: 'main-menu',
          label: 'MAIN MENU',
          left: menuX,
          onPointerTap: () => void context.scenes.goTo('main-menu'),
          top: headingY + 320,
          width: 280,
        }),
      ],
    });
  },
});

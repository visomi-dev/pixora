import { pixora } from 'pixora';

import { createCenteredMonoTextStyle, createCenteredTextStyle } from '../../shared/styles';
import { centeredBoxX } from '../scene-positioning';
import { createBackground, createMenuButton } from '../../shared/ui';

export const mainMenuScene = pixora.scene({
  key: 'main-menu',
  render: (context) => {
    const vp = context.viewport.get();
    const titleY = Math.max(72, vp.height * 0.14);
    const menuY = Math.max(260, vp.height * 0.45);
    const menuX = centeredBoxX(vp.width, 280);

    let highScoreText = 'GALACTIC DEFENSE v2.0';
    try {
      const saved = localStorage.getItem('spaceInvadersHighScore');
      if (saved) {
        highScoreText = `GALACTIC DEFENSE v2.0 | HIGH SCORE: ${parseInt(saved, 10).toLocaleString()}`;
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
          ...createCenteredTextStyle('#00ffaa', 72, '900'),
          content: 'SPACE',
          style: {
            ...createCenteredTextStyle('#00ffaa', 72, '900').style,
            left: vp.width / 2,
            position: 'absolute',
            top: titleY,
          },
        }),
        pixora.text({
          ...createCenteredTextStyle('#ff00aa', 48, '700'),
          content: 'INVADERS',
          style: {
            ...createCenteredTextStyle('#ff00aa', 48, '700').style,
            left: vp.width / 2,
            position: 'absolute',
            top: titleY + 76,
          },
        }),
        createMenuButton({
          backgroundColor: 0x00ffaa,
          height: 56,
          key: 'start-game',
          label: 'START GAME',
          left: menuX,
          onPointerTap: () => void context.scenes.goTo('game'),
          top: menuY,
          width: 280,
        }),
        createMenuButton({
          backgroundColor: 0x333366,
          height: 48,
          key: 'instructions',
          label: 'INSTRUCTIONS',
          left: menuX,
          onPointerTap: () => void context.scenes.goTo('instructions'),
          top: menuY + 80,
          width: 280,
        }),
        pixora.text({
          ...createCenteredMonoTextStyle('#666688', 14),
          content: highScoreText,
          style: {
            align: 'center',
            ...createCenteredMonoTextStyle('#666688', 14).style,
            left: vp.width / 2,
            position: 'absolute',
            top: vp.height - 36,
          },
        }),
      ],
    });
  },
});

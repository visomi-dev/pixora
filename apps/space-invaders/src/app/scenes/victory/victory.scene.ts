import { pixora } from 'pixora';

import { centeredBoxX } from '../scene-positioning';
import { createBackground, createMenuButton } from '../../shared/ui';

export const victoryScene = pixora.scene({
  key: 'victory',
  render: (context) => {
    const vp = context.viewport.get();
    const headingY = Math.max(140, vp.height * 0.22);
    const menuX = centeredBoxX(vp.width, 280);

    return pixora.container({
      style: {
        height: vp.height,
        position: 'relative',
        width: vp.width,
      },
      children: [
        createBackground(vp.width, vp.height),
        pixora.text({
          anchor: { x: 0.5, y: 0 },
          content: 'VICTORY!',
          style: {
            color: '#00ffaa',
            fontFamily: 'Orbitron, sans-serif',
            fontSize: 72,
            fontWeight: '900',
            left: vp.width / 2,
            position: 'absolute',
            top: headingY,
          },
        }),
        pixora.text({
          anchor: { x: 0.5, y: 0 },
          content: 'GALAXY DEFENDED!',
          style: {
            color: '#ff00aa',
            fontFamily: 'Orbitron, sans-serif',
            fontSize: 28,
            left: vp.width / 2,
            position: 'absolute',
            top: headingY + 105,
          },
        }),
        pixora.text({
          anchor: { x: 0.5, y: 0 },
          content: 'FINAL SCORE: 0',
          style: {
            color: '#ffffff',
            fontFamily: 'Orbitron, sans-serif',
            fontSize: 32,
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

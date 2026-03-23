import { pixora } from 'pixora';

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
          anchor: { x: 0.5, y: 0 },
          content: 'SPACE',
          style: {
            color: '#00ffaa',
            fontFamily: 'Orbitron, sans-serif',
            fontSize: 72,
            fontWeight: '900',
            left: vp.width / 2,
            position: 'absolute',
            top: titleY,
          },
        }),
        pixora.text({
          anchor: { x: 0.5, y: 0 },
          content: 'INVADERS',
          style: {
            color: '#ff00aa',
            fontFamily: 'Orbitron, sans-serif',
            fontSize: 48,
            fontWeight: '700',
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
          anchor: { x: 0.5, y: 0 },
          content: highScoreText,
          style: {
            align: 'center',
            color: '#666688',
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 14,
            left: vp.width / 2,
            position: 'absolute',
            top: vp.height - 36,
          },
        }),
      ],
    });
  },
});

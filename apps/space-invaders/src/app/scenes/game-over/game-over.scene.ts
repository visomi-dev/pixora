import { pixora } from 'pixora';

import { centeredBoxX } from '../scene-positioning';


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

    return pixora.container(
      { x: 0, y: 0 },
      pixora.box({ backgroundColor: 0x0a0a1a, height: vp.height, width: vp.width, x: 0, y: 0 }),
      pixora.text({
        anchor: { x: 0.5, y: 0 },
        color: '#ff4444',
        font: 'Orbitron, sans-serif',
        size: 72,
        text: 'GAME OVER',
        weight: '900',
        x: vp.width / 2,
        y: headingY,
      }),
      pixora.text({
        anchor: { x: 0.5, y: 0 },
        color: '#ffffff',
        font: 'Orbitron, sans-serif',
        size: 32,
        text: 'SCORE: 0',
        x: vp.width / 2,
        y: headingY + 110,
      }),
      pixora.text({
        anchor: { x: 0.5, y: 0 },
        color: '#ffff00',
        font: 'Orbitron, sans-serif',
        size: 24,
        style: { align: 'center' },
        text: highScoreText,
        x: vp.width / 2,
        y: headingY + 160,
      }),
      pixora.button({
        backgroundColor: 0x00ffaa,
        height: 56,
        label: 'PLAY AGAIN',
        onPointerTap: () => void context.scenes.goTo('game'),
        width: 280,
        x: menuX,
        y: headingY + 240,
      }),
      pixora.button({
        backgroundColor: 0x666688,
        height: 48,
        label: 'MAIN MENU',
        onPointerTap: () => void context.scenes.goTo('main-menu'),
        width: 280,
        x: menuX,
        y: headingY + 320,
      }),
    );
  },
});

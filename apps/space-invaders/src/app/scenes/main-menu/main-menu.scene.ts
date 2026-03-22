import { pixora } from 'pixora';

import { centeredBoxX } from '../scene-positioning';


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

    return pixora.container(
      { x: 0, y: 0 },
      pixora.box({ backgroundColor: 0x0a0a1a, height: vp.height, width: vp.width, x: 0, y: 0 }),
      pixora.text({
        anchor: { x: 0.5, y: 0 },
        color: '#00ffaa',
        font: 'Orbitron, sans-serif',
        size: 72,
        text: 'SPACE',
        weight: '900',
        x: vp.width / 2,
        y: titleY,
      }),
      pixora.text({
        anchor: { x: 0.5, y: 0 },
        color: '#ff00aa',
        font: 'Orbitron, sans-serif',
        size: 48,
        text: 'INVADERS',
        weight: '700',
        x: vp.width / 2,
        y: titleY + 76,
      }),
      pixora.button({
        backgroundColor: 0x00ffaa,
        height: 56,
        label: 'START GAME',
        onPointerTap: () => void context.scenes.goTo('game'),
        width: 280,
        x: menuX,
        y: menuY,
      }),
      pixora.button({
        backgroundColor: 0x333366,
        height: 48,
        label: 'INSTRUCTIONS',
        onPointerTap: () => void context.scenes.goTo('instructions'),
        width: 280,
        x: menuX,
        y: menuY + 80,
      }),
      pixora.text({
        anchor: { x: 0.5, y: 0 },
        text: highScoreText,
        color: '#666688',
        size: 14,
        font: 'JetBrains Mono, monospace',
        style: { align: 'center' },
        x: vp.width / 2,
        y: vp.height - 36,
      }),
    );
  },
});

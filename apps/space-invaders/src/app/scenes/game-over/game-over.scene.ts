import { layout, pixora } from 'pixora';

export const gameOverScene = pixora.scene({
  key: 'game-over',
  render: (context) => {
    const vp = context.viewport.get();
    const headingY = Math.max(140, vp.height * 0.22);

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
        color: '#ff4444',
        font: 'Orbitron, sans-serif',
        layout: layout.anchor({
          horizontal: 'center',
          offsetY: headingY,
          vertical: 'start',
        }),
        size: 72,
        text: 'GAME OVER',
        weight: '900',
      }),
      pixora.text({
        color: '#ffffff',
        font: 'Orbitron, sans-serif',
        layout: layout.anchor({
          horizontal: 'center',
          offsetY: headingY + 110,
          vertical: 'start',
        }),
        size: 32,
        text: 'SCORE: 0',
      }),
      pixora.text({
        color: '#ffff00',
        font: 'Orbitron, sans-serif',
        layout: layout.anchor({
          horizontal: 'center',
          offsetY: headingY + 160,
          vertical: 'start',
        }),
        size: 24,
        style: { align: 'center' },
        text: highScoreText,
      }),
      pixora.button({
        backgroundColor: 0x00ffaa,
        height: 56,
        label: 'PLAY AGAIN',
        layout: layout.anchor({
          horizontal: 'center',
          offsetY: headingY + 240,
          vertical: 'start',
        }),
        onPointerTap: () => void context.scenes.goTo('game'),
        width: 280,
      }),
      pixora.button({
        backgroundColor: 0x666688,
        height: 48,
        label: 'MAIN MENU',
        layout: layout.anchor({
          horizontal: 'center',
          offsetY: headingY + 320,
          vertical: 'start',
        }),
        onPointerTap: () => void context.scenes.goTo('main-menu'),
        width: 280,
      }),
    );
  },
});

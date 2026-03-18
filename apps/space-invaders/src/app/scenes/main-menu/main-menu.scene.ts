import { layout, pixora } from 'pixora';

export const mainMenuScene = pixora.scene({
  key: 'main-menu',
  render: (context) => {
    const vp = context.viewport.get();
    const titleY = Math.max(72, vp.height * 0.14);
    const menuY = Math.max(260, vp.height * 0.45);

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
        color: '#00ffaa',
        font: 'Orbitron, sans-serif',
        layout: layout.anchor({
          horizontal: 'center',
          offsetY: titleY,
          vertical: 'start',
        }),
        size: 72,
        text: 'SPACE',
        weight: '900',
      }),
      pixora.text({
        color: '#ff00aa',
        font: 'Orbitron, sans-serif',
        layout: layout.anchor({
          horizontal: 'center',
          offsetY: titleY + 76,
          vertical: 'start',
        }),
        size: 48,
        text: 'INVADERS',
        weight: '700',
      }),
      pixora.button({
        backgroundColor: 0x00ffaa,
        height: 56,
        label: 'START GAME',
        layout: layout.anchor({
          horizontal: 'center',
          offsetY: menuY,
          vertical: 'start',
        }),
        onPointerTap: () => void context.scenes.goTo('game'),
        width: 280,
      }),
      pixora.button({
        backgroundColor: 0x333366,
        height: 48,
        label: 'INSTRUCTIONS',
        layout: layout.anchor({
          horizontal: 'center',
          offsetY: menuY + 80,
          vertical: 'start',
        }),
        onPointerTap: () => void context.scenes.goTo('instructions'),
        width: 280,
      }),
      pixora.text({
        text: highScoreText,
        color: '#666688',
        size: 14,
        font: 'JetBrains Mono, monospace',
        layout: layout.anchor({
          horizontal: 'center',
          vertical: 'end',
          offsetY: -28,
        }),
        style: { align: 'center' },
      }),
    );
  },
});

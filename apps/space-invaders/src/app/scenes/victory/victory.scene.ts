import { layout, pixora } from 'pixora';

export const victoryScene = pixora.scene({
  key: 'victory',
  render: (context) => {
    const vp = context.viewport.get();
    const headingY = Math.max(140, vp.height * 0.22);

    return pixora.container(
      { x: 0, y: 0 },
      pixora.box({ backgroundColor: 0x0a0a1a, height: vp.height, width: vp.width, x: 0, y: 0 }),
      pixora.text({
        color: '#00ffaa',
        font: 'Orbitron, sans-serif',
        layout: layout.anchor({
          horizontal: 'center',
          offsetY: headingY,
          vertical: 'start',
        }),
        size: 72,
        text: 'VICTORY!',
        weight: '900',
      }),
      pixora.text({
        color: '#ff00aa',
        font: 'Orbitron, sans-serif',
        layout: layout.anchor({
          horizontal: 'center',
          offsetY: headingY + 105,
          vertical: 'start',
        }),
        size: 28,
        text: 'GALAXY DEFENDED!',
      }),
      pixora.text({
        color: '#ffffff',
        font: 'Orbitron, sans-serif',
        layout: layout.anchor({
          horizontal: 'center',
          offsetY: headingY + 160,
          vertical: 'start',
        }),
        size: 32,
        text: 'FINAL SCORE: 0',
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

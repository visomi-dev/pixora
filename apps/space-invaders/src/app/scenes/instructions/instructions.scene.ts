import { layout, pixora } from 'pixora';

export const instructionsScene = pixora.scene({
  key: 'instructions',
  render: (context) => {
    const vp = context.viewport.get();

    return pixora.container(
      { x: 0, y: 0 },
      pixora.box({ backgroundColor: 0x0a0a1a, height: vp.height, width: vp.width, x: 0, y: 0 }),
      pixora.container(
        {
          layout: layout.percent({
            horizontal: 'center',
            vertical: 'start',
            width: 1,
          }),
        },
        pixora.text({
          text: 'INSTRUCTIONS',
          color: '#00ffaa',
          size: 48,
          weight: '900',
          font: 'Orbitron, sans-serif',
          y: vp.height * 0.06,
        }),
      ),
      pixora.container(
        {
          layout: layout.percent({
            horizontal: 'center',
            vertical: 'center',
            width: 1,
          }),
        },
        pixora.container(
          {
            layout: layout.flex({
              direction: 'vertical',
              justify: 'center',
              align: 'center',
              gap: 12,
            }),
          },
          pixora.text({ text: 'CONTROLS', color: '#ff00aa', size: 24, weight: 'bold', font: 'Orbitron, sans-serif' }),
          pixora.text({
            text: '← → or A/D - Move Ship\nSPACE - Fire\nP - Pause\nESC - Pause',
            color: '#ffffff',
            size: 16,
            font: 'JetBrains Mono, monospace',
          }),
          pixora.text({ text: 'POWER-UPS', color: '#ff00aa', size: 24, weight: 'bold', font: 'Orbitron, sans-serif' }),
          pixora.text({
            text: '⚡ Speed Boost - Move faster\n🛡️ Shield - Invincibility\n🔥 Triple Shot - Fire 3 bullets\n💣 Smart Bomb - Clear row',
            color: '#ffffff',
            size: 16,
            font: 'JetBrains Mono, monospace',
          }),
          pixora.text({ text: 'TIPS', color: '#ff00aa', size: 24, weight: 'bold', font: 'Orbitron, sans-serif' }),
          pixora.text({
            text: '• Combo kills for score multipliers\n• Destroy enemies quickly for bonus points\n• Watch for falling power-ups\n• Each level gets harder!',
            color: '#ffffff',
            size: 16,
            font: 'JetBrains Mono, monospace',
          }),
        ),
      ),
      pixora.container(
        {
          layout: layout.percent({
            horizontal: 'center',
            vertical: 'end',
          }),
          y: -(vp.height * 0.08),
        },
        pixora.button({
          backgroundColor: 0x00ffaa,
          height: 56,
          label: 'BACK',
          onPointerTap: () => void context.scenes.goTo('main-menu'),
          width: 200,
        }),
      ),
    );
  },
});

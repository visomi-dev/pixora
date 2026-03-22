import { pixora } from 'pixora';

import { centeredBoxX } from '../scene-positioning';


export const instructionsScene = pixora.scene({
  key: 'instructions',
  render: (context) => {
    const vp = context.viewport.get();
    const titleY = Math.max(40, vp.height * 0.05);
    const contentTop = Math.max(180, vp.height * 0.22);

    return pixora.container(
      { x: 0, y: 0 },
      pixora.box({ backgroundColor: 0x0a0a1a, height: vp.height, width: vp.width, x: 0, y: 0 }),
      pixora.text({
        anchor: { x: 0.5, y: 0 },
        color: '#00ffaa',
        font: 'Orbitron, sans-serif',
        size: 48,
        text: 'INSTRUCTIONS',
        weight: '900',
        x: vp.width / 2,
        y: titleY,
      }),
      pixora.scrollBox(
        { height: vp.height - contentTop - 100, width: vp.width, x: 0, y: contentTop },
        pixora.text({
          anchor: { x: 0.5, y: 0 },
          color: '#ff00aa',
          font: 'Orbitron, sans-serif',
          size: 24,
          text: 'CONTROLS',
          weight: 'bold',
          x: vp.width / 2,
          y: 0,
        }),
        pixora.text({
          anchor: { x: 0.5, y: 0 },
          color: '#ffffff',
          font: 'JetBrains Mono, monospace',
          size: 16,
          style: { align: 'center' },
          text: 'LEFT / RIGHT or A / D - Move Ship\nSPACE - Fire\nP - Pause\nESC - Pause',
          x: vp.width / 2,
          y: 40,
        }),
        pixora.text({
          anchor: { x: 0.5, y: 0 },
          color: '#ff00aa',
          font: 'Orbitron, sans-serif',
          size: 24,
          text: 'POWER-UPS',
          weight: 'bold',
          x: vp.width / 2,
          y: 150,
        }),
        pixora.text({
          anchor: { x: 0.5, y: 0 },
          color: '#ffffff',
          font: 'JetBrains Mono, monospace',
          size: 16,
          style: { align: 'center' },
          text: 'SPEED BOOST - Move faster\nSHIELD - Temporary protection\nTRIPLE SHOT - Fire three bullets\nSMART BOMB - Clear a row',
          x: vp.width / 2,
          y: 190,
        }),
        pixora.text({
          anchor: { x: 0.5, y: 0 },
          color: '#ff00aa',
          font: 'Orbitron, sans-serif',
          size: 24,
          text: 'TIPS',
          weight: 'bold',
          x: vp.width / 2,
          y: 320,
        }),
        pixora.text({
          anchor: { x: 0.5, y: 0 },
          color: '#ffffff',
          font: 'JetBrains Mono, monospace',
          size: 16,
          style: { align: 'center' },
          text: 'Chain eliminations for score multipliers.\nDestroy waves quickly for bonus points.\nWatch for falling power-ups.\nEach level ramps up the pressure.',
          x: vp.width / 2,
          y: 360,
        }),
        // Spacer for bottom
        pixora.box({ height: 460, width: 10, x: 0, y: 0, alpha: 0 }),
      ),
      pixora.button({
        backgroundColor: 0x00ffaa,
        height: 56,
        label: 'BACK',
        onPointerTap: () => void context.scenes.goTo('main-menu'),
        width: 200,
        x: centeredBoxX(vp.width, 200),
        y: vp.height - 72,
      }),
    );
  },
});

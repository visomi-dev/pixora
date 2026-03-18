import { centeredBoxX, centeredTextX } from '../scene-positioning';

import { pixora } from 'pixora';

export const instructionsScene = pixora.scene({
  key: 'instructions',
  render: (context) => {
    const vp = context.viewport.get();
    const titleY = Math.max(40, vp.height * 0.05);
    const contentTop = Math.max(180, vp.height * 0.22);
    const bodyX = centeredTextX(vp.width, 'Chain eliminations for score multipliers.', 16, 0.56);

    return pixora.container(
      { x: 0, y: 0 },
      pixora.box({ backgroundColor: 0x0a0a1a, height: vp.height, width: vp.width, x: 0, y: 0 }),
      pixora.text({
        color: '#00ffaa',
        font: 'Orbitron, sans-serif',
        size: 48,
        text: 'INSTRUCTIONS',
        weight: '900',
        x: centeredTextX(vp.width, 'INSTRUCTIONS', 48, 0.58),
        y: titleY,
      }),
      pixora.text({
        color: '#ff00aa',
        font: 'Orbitron, sans-serif',
        size: 24,
        text: 'CONTROLS',
        weight: 'bold',
        x: centeredTextX(vp.width, 'CONTROLS', 24, 0.58),
        y: contentTop,
      }),
      pixora.text({
        color: '#ffffff',
        font: 'JetBrains Mono, monospace',
        size: 16,
        style: { align: 'center' },
        text: 'LEFT / RIGHT or A / D - Move Ship\nSPACE - Fire\nP - Pause\nESC - Pause',
        x: bodyX,
        y: contentTop + 40,
      }),
      pixora.text({
        color: '#ff00aa',
        font: 'Orbitron, sans-serif',
        size: 24,
        text: 'POWER-UPS',
        weight: 'bold',
        x: centeredTextX(vp.width, 'POWER-UPS', 24, 0.58),
        y: contentTop + 150,
      }),
      pixora.text({
        color: '#ffffff',
        font: 'JetBrains Mono, monospace',
        size: 16,
        style: { align: 'center' },
        text: 'SPEED BOOST - Move faster\nSHIELD - Temporary protection\nTRIPLE SHOT - Fire three bullets\nSMART BOMB - Clear a row',
        x: centeredTextX(vp.width, 'SPEED BOOST - Move faster', 16, 0.56),
        y: contentTop + 190,
      }),
      pixora.text({
        color: '#ff00aa',
        font: 'Orbitron, sans-serif',
        size: 24,
        text: 'TIPS',
        weight: 'bold',
        x: centeredTextX(vp.width, 'TIPS', 24, 0.58),
        y: contentTop + 320,
      }),
      pixora.text({
        color: '#ffffff',
        font: 'JetBrains Mono, monospace',
        size: 16,
        style: { align: 'center' },
        text: 'Chain eliminations for score multipliers.\nDestroy waves quickly for bonus points.\nWatch for falling power-ups.\nEach level ramps up the pressure.',
        x: bodyX,
        y: contentTop + 360,
      }),
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

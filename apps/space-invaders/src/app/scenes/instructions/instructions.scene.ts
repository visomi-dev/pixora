import { pixora } from 'pixora';

import { centeredBoxX } from '../scene-positioning';
import { createBackground, createMenuButton } from '../../shared/ui';

export const instructionsScene = pixora.scene({
  key: 'instructions',
  render: (context) => {
    const vp = context.viewport.get();
    const titleY = Math.max(40, vp.height * 0.05);
    const sectionX = vp.width / 2;

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
          content: 'INSTRUCTIONS',
          style: {
            color: '#00ffaa',
            fontFamily: 'Orbitron, sans-serif',
            fontSize: 48,
            fontWeight: '900',
            left: sectionX,
            position: 'absolute',
            top: titleY,
          },
        }),
        pixora.text({
          anchor: { x: 0.5, y: 0 },
          content: 'CONTROLS',
          style: {
            color: '#ff00aa',
            fontFamily: 'Orbitron, sans-serif',
            fontSize: 24,
            fontWeight: '700',
            left: sectionX,
            position: 'absolute',
            top: 170,
          },
        }),
        pixora.text({
          anchor: { x: 0.5, y: 0 },
          content: 'LEFT / RIGHT or A / D - Move Ship\nSPACE - Fire\nP - Pause\nESC - Pause',
          style: {
            align: 'center',
            color: '#ffffff',
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 16,
            left: sectionX,
            position: 'absolute',
            top: 210,
          },
        }),
        pixora.text({
          anchor: { x: 0.5, y: 0 },
          content: 'POWER-UPS',
          style: {
            color: '#ff00aa',
            fontFamily: 'Orbitron, sans-serif',
            fontSize: 24,
            fontWeight: '700',
            left: sectionX,
            position: 'absolute',
            top: 340,
          },
        }),
        pixora.text({
          anchor: { x: 0.5, y: 0 },
          content:
            'SPEED BOOST - Move faster\nSHIELD - Temporary protection\nTRIPLE SHOT - Fire three bullets\nSMART BOMB - Clear a row',
          style: {
            align: 'center',
            color: '#ffffff',
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 16,
            left: sectionX,
            position: 'absolute',
            top: 380,
          },
        }),
        pixora.text({
          anchor: { x: 0.5, y: 0 },
          content: 'TIPS',
          style: {
            color: '#ff00aa',
            fontFamily: 'Orbitron, sans-serif',
            fontSize: 24,
            fontWeight: '700',
            left: sectionX,
            position: 'absolute',
            top: 530,
          },
        }),
        pixora.text({
          anchor: { x: 0.5, y: 0 },
          content:
            'Chain eliminations for score multipliers.\nDestroy waves quickly for bonus points.\nWatch for falling power-ups.\nEach level ramps up the pressure.',
          style: {
            align: 'center',
            color: '#ffffff',
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 16,
            left: sectionX,
            position: 'absolute',
            top: 570,
          },
        }),
        createMenuButton({
          backgroundColor: 0x00ffaa,
          height: 56,
          key: 'back',
          label: 'BACK',
          left: centeredBoxX(vp.width, 200),
          onPointerTap: () => void context.scenes.goTo('main-menu'),
          top: vp.height - 72,
          width: 200,
        }),
      ],
    });
  },
});

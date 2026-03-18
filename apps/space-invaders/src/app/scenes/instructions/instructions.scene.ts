import { layout, pixora } from 'pixora';

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
        color: '#00ffaa',
        font: 'Orbitron, sans-serif',
        layout: layout.anchor({
          horizontal: 'center',
          offsetY: titleY,
          vertical: 'start',
        }),
        size: 48,
        text: 'INSTRUCTIONS',
        weight: '900',
      }),
      pixora.text({
        color: '#ff00aa',
        font: 'Orbitron, sans-serif',
        layout: layout.anchor({
          horizontal: 'center',
          offsetY: contentTop,
          vertical: 'start',
        }),
        size: 24,
        text: 'CONTROLS',
        weight: 'bold',
      }),
      pixora.text({
        color: '#ffffff',
        font: 'JetBrains Mono, monospace',
        layout: layout.anchor({
          horizontal: 'center',
          offsetY: contentTop + 40,
          vertical: 'start',
        }),
        size: 16,
        style: { align: 'center' },
        text: 'LEFT / RIGHT or A / D - Move Ship\nSPACE - Fire\nP - Pause\nESC - Pause',
      }),
      pixora.text({
        color: '#ff00aa',
        font: 'Orbitron, sans-serif',
        layout: layout.anchor({
          horizontal: 'center',
          offsetY: contentTop + 150,
          vertical: 'start',
        }),
        size: 24,
        text: 'POWER-UPS',
        weight: 'bold',
      }),
      pixora.text({
        color: '#ffffff',
        font: 'JetBrains Mono, monospace',
        layout: layout.anchor({
          horizontal: 'center',
          offsetY: contentTop + 190,
          vertical: 'start',
        }),
        size: 16,
        style: { align: 'center' },
        text: 'SPEED BOOST - Move faster\nSHIELD - Temporary protection\nTRIPLE SHOT - Fire three bullets\nSMART BOMB - Clear a row',
      }),
      pixora.text({
        color: '#ff00aa',
        font: 'Orbitron, sans-serif',
        layout: layout.anchor({
          horizontal: 'center',
          offsetY: contentTop + 320,
          vertical: 'start',
        }),
        size: 24,
        text: 'TIPS',
        weight: 'bold',
      }),
      pixora.text({
        color: '#ffffff',
        font: 'JetBrains Mono, monospace',
        layout: layout.anchor({
          horizontal: 'center',
          offsetY: contentTop + 360,
          vertical: 'start',
        }),
        size: 16,
        style: { align: 'center' },
        text: 'Chain eliminations for score multipliers.\nDestroy waves quickly for bonus points.\nWatch for falling power-ups.\nEach level ramps up the pressure.',
      }),
      pixora.button({
        backgroundColor: 0x00ffaa,
        height: 56,
        label: 'BACK',
        layout: layout.anchor({
          horizontal: 'center',
          offsetY: -36,
          vertical: 'end',
        }),
        onPointerTap: () => void context.scenes.goTo('main-menu'),
        width: 200,
      }),
    );
  },
});

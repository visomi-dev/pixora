import { createMonoTextStyle, createTextStyle } from '../../shared/styles';

import { pixora } from 'pixora';

export const instructionsScene = pixora.scene({
  key: 'instructions',
  render: (context) => {
    const vp = context.viewport.get();
    const w = vp.width;
    const h = vp.height;

    return pixora.container(
      { x: 0, y: 0 },
      pixora.box({ backgroundColor: 0x0a0a1a, height: h, width: w, x: 0, y: 0 }),
      pixora.container(
        { x: 0, y: 0 },
        pixora.text({ ...createTextStyle('#00ffaa', 48, '900'), text: 'INSTRUCTIONS', x: w / 2, y: 60 }),
        pixora.text({ ...createTextStyle('#ff00aa', 24, 'bold'), text: 'CONTROLS', x: w / 2, y: 160 }),
        pixora.text({
          ...createMonoTextStyle('#ffffff', 16),
          text: '← → or A/D - Move Ship\nSPACE - Fire\nP - Pause\nESC - Pause',
          x: w / 2,
          y: 210,
        }),
        pixora.text({ ...createTextStyle('#ff00aa', 24, 'bold'), text: 'POWER-UPS', x: w / 2, y: 330 }),
        pixora.text({
          ...createMonoTextStyle('#ffffff', 16),
          text: '⚡ Speed Boost - Move faster\n🛡️ Shield - Invincibility\n🔥 Triple Shot - Fire 3 bullets\n💣 Smart Bomb - Clear row',
          x: w / 2,
          y: 380,
        }),
        pixora.text({ ...createTextStyle('#ff00aa', 24, 'bold'), text: 'TIPS', x: w / 2, y: 520 }),
        pixora.text({
          ...createMonoTextStyle('#ffffff', 16),
          text: '• Combo kills for score multipliers\n• Destroy enemies quickly for bonus points\n• Watch for falling power-ups\n• Each level gets harder!',
          x: w / 2,
          y: 570,
        }),
        pixora.button({
          backgroundColor: 0x00ffaa,
          height: 56,
          label: 'BACK',
          onPointerTap: () => void context.scenes.goTo('main-menu'),
          width: 200,
          x: w / 2 - 100,
          y: h - 120,
        }),
      ),
    );
  },
});

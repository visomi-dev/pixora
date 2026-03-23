import { pixora } from 'pixora';

import { createCenteredMonoTextStyle, createCenteredTextStyle } from '../../shared/styles';
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
          ...createCenteredTextStyle('#00ffaa', 48, '900'),
          content: 'INSTRUCTIONS',
          style: {
            ...createCenteredTextStyle('#00ffaa', 48, '900').style,
            left: sectionX,
            position: 'absolute',
            top: titleY,
          },
        }),
        pixora.text({
          ...createCenteredTextStyle('#ff00aa', 24, '700'),
          content: 'CONTROLS',
          style: {
            ...createCenteredTextStyle('#ff00aa', 24, '700').style,
            left: sectionX,
            position: 'absolute',
            top: 170,
          },
        }),
        pixora.text({
          ...createCenteredMonoTextStyle('#ffffff', 16),
          content: 'LEFT / RIGHT or A / D - Move Ship\nSPACE - Fire\nP - Pause\nESC - Pause',
          style: {
            align: 'center',
            ...createCenteredMonoTextStyle('#ffffff', 16).style,
            left: sectionX,
            position: 'absolute',
            top: 210,
          },
        }),
        pixora.text({
          ...createCenteredTextStyle('#ff00aa', 24, '700'),
          content: 'POWER-UPS',
          style: {
            ...createCenteredTextStyle('#ff00aa', 24, '700').style,
            left: sectionX,
            position: 'absolute',
            top: 340,
          },
        }),
        pixora.text({
          ...createCenteredMonoTextStyle('#ffffff', 16),
          content:
            'SPEED BOOST - Move faster\nSHIELD - Temporary protection\nTRIPLE SHOT - Fire three bullets\nSMART BOMB - Clear a row',
          style: {
            align: 'center',
            ...createCenteredMonoTextStyle('#ffffff', 16).style,
            left: sectionX,
            position: 'absolute',
            top: 380,
          },
        }),
        pixora.text({
          ...createCenteredTextStyle('#ff00aa', 24, '700'),
          content: 'TIPS',
          style: {
            ...createCenteredTextStyle('#ff00aa', 24, '700').style,
            left: sectionX,
            position: 'absolute',
            top: 530,
          },
        }),
        pixora.text({
          ...createCenteredMonoTextStyle('#ffffff', 16),
          content:
            'Chain eliminations for score multipliers.\nDestroy waves quickly for bonus points.\nWatch for falling power-ups.\nEach level ramps up the pressure.',
          style: {
            align: 'center',
            ...createCenteredMonoTextStyle('#ffffff', 16).style,
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

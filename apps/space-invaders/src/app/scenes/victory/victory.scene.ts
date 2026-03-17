import { layout, pixora } from 'pixora';

export const victoryScene = pixora.scene({
  key: 'victory',
  render: (context) => {
    const vp = context.viewport.get();

    return pixora.container(
      { x: 0, y: 0 },
      pixora.box({ backgroundColor: 0x0a0a1a, height: vp.height, width: vp.width, x: 0, y: 0 }),
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
              gap: 16,
            }),
          },
          pixora.text({ text: 'VICTORY!', color: '#00ffaa', size: 72, weight: '900', font: 'Orbitron, sans-serif' }),
          pixora.text({ text: 'GALAXY DEFENDED!', color: '#ff00aa', size: 28, font: 'Orbitron, sans-serif' }),
          pixora.text({ text: 'FINAL SCORE: 0', color: '#ffffff', size: 32, font: 'Orbitron, sans-serif' }),
          pixora.button({
            backgroundColor: 0x00ffaa,
            height: 56,
            label: 'PLAY AGAIN',
            onPointerTap: () => void context.scenes.goTo('game'),
            width: 280,
          }),
          pixora.button({
            backgroundColor: 0x666688,
            height: 48,
            label: 'MAIN MENU',
            onPointerTap: () => void context.scenes.goTo('main-menu'),
            width: 280,
          }),
        ),
      ),
    );
  },
});

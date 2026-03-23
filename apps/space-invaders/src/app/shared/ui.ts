import { pixora } from 'pixora';

import { createTextStyle } from './styles';

type MenuButtonOptions = {
  backgroundColor: number;
  height: number;
  key: string;
  label: string;
  left: number;
  onPointerTap: () => void;
  textOffsetY?: number;
  top: number;
  width: number;
};

export function createMenuButton(options: MenuButtonOptions): ReturnType<typeof pixora.container> {
  return pixora.container({
    key: options.key,
    label: options.key,
    onPointerTap: options.onPointerTap,
    style: {
      backgroundColor: options.backgroundColor,
      borderRadius: 14,
      cursor: 'pointer',
      height: options.height,
      left: options.left,
      position: 'absolute',
      top: options.top,
      width: options.width,
    },
    children: [
      pixora.text({
        anchor: 0.5,
        content: options.label,
        style: {
          ...createTextStyle('#09111d', 20, '700').style,
          left: options.width / 2,
          position: 'absolute',
          top: options.height / 2 + (options.textOffsetY ?? -2),
        },
      }),
    ],
  });
}

export function createBackground(width: number, height: number): ReturnType<typeof pixora.container> {
  return pixora.container({
    style: {
      backgroundColor: 0x0a0a1a,
      height,
      position: 'absolute',
      width,
    },
  });
}

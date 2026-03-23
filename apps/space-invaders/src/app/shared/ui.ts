import { pixora } from 'pixora';

type MenuButtonOptions = {
  backgroundColor: number;
  height: number;
  key: string;
  label: string;
  left: number;
  onPointerTap: () => void;
  top: number;
  width: number;
};

export function createMenuButton(options: MenuButtonOptions): ReturnType<typeof pixora.container> {
  return pixora.container({
    key: options.key,
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
          color: '#09111d',
          fontFamily: 'Orbitron, sans-serif',
          fontSize: 20,
          fontWeight: '700',
          left: options.width / 2,
          position: 'absolute',
          top: options.height / 2,
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

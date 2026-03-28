import type { ButtonProps, PixoraStyle } from 'pixora';

type MenuButtonOptions = {
  backgroundColor: number;
  height: number;
  key: string;
  label: string;
  labelColor?: string;
  labelSize?: number;
  onPointerTap: () => void;
  style?: PixoraStyle;
  width: number;
};

export function createMenuButtonProps(options: MenuButtonOptions): ButtonProps {
  return {
    animation: {
      durationMs: 100,
      hoverScale: 1,
      pressedScale: 0.985,
    },
    key: options.key,
    label: options.key,
    onPointerTap: options.onPointerTap,
    backgroundColor: resolveButtonBackground(options.backgroundColor),
    style: {
      height: options.height,
      width: options.width,
      ...options.style,
    },
    text: {
      content: options.label,
      offset: { y: -2 },
      style: {
        color: options.labelColor ?? '#09111d',
        fontFamily: 'Orbitron, sans-serif',
        fontSize: options.labelSize ?? 20,
        fontWeight: '700',
      },
    },
  };
}

function resolveButtonBackground(backgroundColor: number): NonNullable<ButtonProps['backgroundColor']> {
  if (backgroundColor === 0x333366) {
    return {
      hovered: 0x4d4d80,
      idle: 0x333366,
      pressed: 0x141447,
    };
  }

  if (backgroundColor === 0x666688) {
    return {
      hovered: 0x8080a2,
      idle: 0x666688,
      pressed: 0x474769,
    };
  }

  if (backgroundColor === 0x20263a) {
    return {
      hovered: 0x394158,
      idle: 0x20263a,
      pressed: 0x12182c,
    };
  }

  if (backgroundColor === 0xff6644) {
    return {
      hovered: 0xff866b,
      idle: 0xff6644,
      pressed: 0xd94727,
    };
  }

  return {
    hovered: 0x1affc4,
    idle: 0x00ffaa,
    pressed: 0x00e08b,
  };
}

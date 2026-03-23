import { createTween } from '../animation/create-tween';
import { SpriteNode } from '../components/sprite-node';
import { TextNode } from '../components/text-node';
import { bindInteractive, type ButtonState } from '../input/bind-interactive';
import { effect, signal } from '../state/signal';

import { getCurrentApplicationContext } from './current-context';
import { island } from './island';

import type { PixoraStyle } from '../layout/layout-types';
import type { SpriteNodeProps } from './types';

type ButtonTexture = NonNullable<SpriteNodeProps['texture']>;

type ButtonTextures = {
  disabled?: ButtonTexture;
  hovered?: ButtonTexture;
  idle: ButtonTexture;
  pressed?: ButtonTexture;
};

type ButtonText = {
  content: string;
  style?: Pick<PixoraStyle, 'color' | 'fontFamily' | 'fontSize' | 'fontWeight'>;
};

type ButtonAnimationConfig = {
  durationMs?: number;
  easing?: 'ease-in' | 'ease-out' | 'ease-in-out' | 'linear';
};

export type ButtonProps = {
  animation?: ButtonAnimationConfig;
  disabled?: boolean;
  key?: string | number;
  label?: string;
  onPointerDown?: () => void;
  onPointerOut?: () => void;
  onPointerOver?: () => void;
  onPointerTap?: () => void;
  onPointerUp?: () => void;
  style?: PixoraStyle;
  text: ButtonText;
  textures: ButtonTextures;
};

const DEFAULT_HEIGHT = 72;
const DEFAULT_WIDTH = 280;

export function button(props: ButtonProps): ReturnType<typeof island> {
  const context = getCurrentApplicationContext();

  return island({
    context,
    key: props.key,
    setup: ({ root }) => {
      const rootLabel = props.label ?? 'Button';
      const initialState: ButtonState = props.disabled ? 'disabled' : 'idle';
      const state = signal<ButtonState>(initialState);
      const width = resolveNumericDimension(props.style?.width, DEFAULT_WIDTH);
      const height = resolveNumericDimension(props.style?.height, DEFAULT_HEIGHT);
      const label = new TextNode({
        content: props.text.content,
        style: resolveTextStyle(props.text.style, initialState),
      });
      const background = new SpriteNode({
        texture: resolveTexture(props.textures, initialState),
        style: { height, width },
      });

      let currentTween: { dispose: () => void } | null = null;

      root.displayObject.label = rootLabel;
      background.displayObject.label = `${rootLabel}.Background`;
      label.displayObject.label = `${rootLabel}.Text`;

      root.setLayoutSize(width, height);
      background.setLayoutSize(width, height);
      root.layout = { ...resolveRootStyle(props.style, initialState), height, width };
      root.updateProps({ style: resolveRootStyle(props.style, initialState) });

      label.displayObject.anchor.set(0.5);
      label.setLayoutPosition(width / 2, height / 2);

      root.addChild(background);
      root.addChild(label);

      root.addDisposable(
        bindInteractive(root.displayObject, {
          enabled: !props.disabled,
          onHoverChange(hovered) {
            if (hovered) {
              props.onPointerOver?.();
            } else {
              props.onPointerOut?.();
            }
          },
          onPress() {
            props.onPointerTap?.();
          },
          onPressEnd() {
            props.onPointerUp?.();
          },
          onPressStart() {
            props.onPointerDown?.();
          },
          onStateChange(interaction) {
            state.set(resolveButtonState(interaction));
          },
        }),
      );

      root.addDisposable(
        effect(() => {
          const currentState = state.get();
          const nextScale = currentState === 'pressed' ? 0.98 : currentState === 'hovered' ? 1.01 : 1;

          root.setLayoutSize(width, height);
          background.setLayoutSize(width, height);
          root.layout = { ...resolveRootStyle(props.style, currentState), height, width };
          root.updateProps({ style: resolveRootStyle(props.style, currentState) });
          background.updateProps({ texture: resolveTexture(props.textures, currentState) });
          label.updateProps({ style: resolveTextStyle(props.text.style, currentState) });

          currentTween?.dispose();
          currentTween = createTween({
            durationMs: props.animation?.durationMs ?? 100,
            easing: props.animation?.easing ?? 'ease-out',
            from: root.displayObject.scale.x,
            onUpdate: (value) => {
              root.displayObject.scale.set(value);
            },
            to: nextScale,
          });
        }),
      );

      root.addDisposable({
        dispose() {
          currentTween?.dispose();
        },
      });
    },
  });
}

function resolveButtonState(interaction: { disabled: boolean; hovered: boolean; pressed: boolean }): ButtonState {
  if (interaction.disabled) {
    return 'disabled';
  }

  if (interaction.pressed) {
    return 'pressed';
  }

  if (interaction.hovered) {
    return 'hovered';
  }

  return 'idle';
}

function resolveTextStyle(
  style: ButtonText['style'],
  state: ButtonState,
): Pick<PixoraStyle, 'color' | 'fontFamily' | 'fontSize' | 'fontWeight' | 'opacity'> {
  const baseColor = style?.color ?? '#4a3728';

  return {
    color: state === 'disabled' ? '#8e7866' : state === 'hovered' ? '#362519' : baseColor,
    fontFamily: style?.fontFamily ?? 'Fredoka, sans-serif',
    fontSize: style?.fontSize ?? 28,
    fontWeight: style?.fontWeight ?? '700',
    opacity: state === 'disabled' ? 0.8 : 1,
  };
}

function resolveRootStyle(style: PixoraStyle | undefined, state: ButtonState): PixoraStyle {
  return {
    ...style,
    cursor: state === 'disabled' ? 'default' : (style?.cursor ?? 'pointer'),
    opacity: state === 'disabled' ? 0.9 : (style?.opacity ?? 1),
  };
}

function resolveTexture(textures: ButtonTextures, state: ButtonState): ButtonTexture {
  switch (state) {
    case 'disabled':
      return textures.disabled ?? textures.idle;
    case 'hovered':
      return textures.hovered ?? textures.pressed ?? textures.idle;
    case 'pressed':
      return textures.pressed ?? textures.hovered ?? textures.idle;
    default:
      return textures.idle;
  }
}

function resolveNumericDimension(value: PixoraStyle['width'] | PixoraStyle['height'], fallback: number): number {
  return typeof value === 'number' ? value : fallback;
}

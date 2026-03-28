import { ButtonContainer } from '@pixi/ui';
import { Container, Sprite, Text, Texture, type TextStyleOptions } from 'pixi.js';

import { BaseNode } from '../components/base-node';
import { createTween } from '../animation/create-tween';
import { effect, signal } from '../state/signal';
import { applyPixiLayout } from '../layout/translate-to-pixi-layout';

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

type ButtonBackgroundColor =
  | number
  | {
      disabled?: number;
      hovered?: number;
      idle: number;
      pressed?: number;
    };

type ButtonText = {
  content: string;
  offset?: {
    x?: number;
    y?: number;
  };
  style?: Pick<PixoraStyle, 'color' | 'fontFamily' | 'fontSize' | 'fontWeight'>;
};

type ButtonAnimationConfig = {
  durationMs?: number;
  easing?: 'ease-in' | 'ease-out' | 'ease-in-out' | 'linear';
  hoverScale?: number;
  pressedScale?: number;
};

export type ButtonProps = {
  animation?: ButtonAnimationConfig;
  backgroundColor?: ButtonBackgroundColor;
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
  textures?: ButtonTextures;
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
      const background = new Sprite(resolveTexture(props, initialState));
      const content = new Container();
      const label = new Text({
        resolution: 2,
        style: buildTextStyle(resolveTextStyle(props.text.style, initialState)),
        text: props.text.content,
      });
      const view = new Container();
      const widget = new ButtonContainer(view);
      const widgetNode = new BaseNode(widget);
      let currentTween: { dispose: () => void } | null = null;

      root.displayObject.label = rootLabel;
      widget.label = `${rootLabel}.Widget`;
      background.label = `${rootLabel}.Background`;
      content.label = `${rootLabel}.Content`;
      label.label = `${rootLabel}.Text`;

      root.setLayoutSize(width, height);
      root.layout = { ...resolveRootStyle(props.style, initialState), height, width };
      root.updateProps({ style: resolveRootStyle(props.style, initialState) });

      applyPixiLayout(view, {
        height,
        width,
      });
      applyPixiLayout(content, {
        height: '100%',
        left: 0,
        position: 'absolute',
        top: 0,
        width: '100%',
      });

      background.width = width;
      background.height = height;
      label.anchor.set(0.5);
      positionLabel(label, width, height, props.text.offset);
      view.addChild(background as never);
      content.addChild(label as never);
      view.addChild(content as never);
      widget.enabled = !props.disabled;
      root.addChild(widgetNode);

      widget.onHover.connect(() => {
        state.set('hovered');
        props.onPointerOver?.();
      });
      widget.onOut.connect(() => {
        state.set('idle');
        props.onPointerOut?.();
      });
      widget.onDown.connect(() => {
        state.set('pressed');
        props.onPointerDown?.();
      });
      widget.onUp.connect(() => {
        state.set('idle');
      });
      widget.onUpOut.connect(() => {
        state.set('idle');
      });
      widget.onPress.connect(() => {
        state.set('idle');
        props.onPointerTap?.();
        props.onPointerUp?.();
      });

      root.addDisposable(
        effect(() => {
          const currentState = state.get();
          const nextScale = resolveButtonScale(props.animation, currentState);

          root.setLayoutSize(width, height);
          root.layout = { ...resolveRootStyle(props.style, currentState), height, width };
          root.updateProps({ style: resolveRootStyle(props.style, currentState) });
          root.displayObject.cursor = currentState === 'disabled' ? 'default' : (props.style?.cursor ?? 'pointer');
          widget.cursor = currentState === 'disabled' ? 'default' : (props.style?.cursor ?? 'pointer');
          applyPixiLayout(view, {
            height,
            width,
          });
          applyPixiLayout(content, {
            height: '100%',
            left: 0,
            position: 'absolute',
            top: 0,
            width: '100%',
          });
          widget.enabled = currentState !== 'disabled';
          background.texture = resolveTexture(props, currentState);
          background.tint = resolveBackgroundTint(props.backgroundColor, currentState);
          background.width = width;
          background.height = height;
          label.style = buildTextStyle(resolveTextStyle(props.text.style, currentState));
          positionLabel(label, width, height, props.text.offset);

          currentTween?.dispose();
          currentTween = createTween({
            durationMs: props.animation?.durationMs ?? 100,
            easing: props.animation?.easing ?? 'ease-out',
            from: widget.scale.x,
            onUpdate: (value) => {
              widget.scale.set(value);
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

      background.tint = resolveBackgroundTint(props.backgroundColor, initialState);
    },
  });
}

type ButtonState = 'disabled' | 'hovered' | 'idle' | 'pressed';

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

function buildTextStyle(
  style: Pick<PixoraStyle, 'color' | 'fontFamily' | 'fontSize' | 'fontWeight' | 'opacity'>,
): TextStyleOptions {
  return {
    fill: style.color,
    fontFamily: style.fontFamily,
    fontSize: style.fontSize,
    fontWeight: style.fontWeight as TextStyleOptions['fontWeight'] | undefined,
  };
}

function resolveRootStyle(style: PixoraStyle | undefined, state: ButtonState): PixoraStyle {
  return {
    ...style,
    cursor: state === 'disabled' ? 'default' : (style?.cursor ?? 'pointer'),
    opacity: state === 'disabled' ? 0.9 : (style?.opacity ?? 1),
  };
}

function resolveTexture(props: ButtonProps, state: ButtonState): ButtonTexture {
  if (!props.textures) {
    return Texture.WHITE;
  }

  const textures = props.textures;

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

function resolveBackgroundTint(backgroundColor: ButtonProps['backgroundColor'], state: ButtonState): number {
  if (typeof backgroundColor === 'number') {
    return backgroundColor;
  }

  if (backgroundColor) {
    switch (state) {
      case 'disabled':
        return backgroundColor.disabled ?? backgroundColor.idle;
      case 'hovered':
        return backgroundColor.hovered ?? backgroundColor.pressed ?? backgroundColor.idle;
      case 'pressed':
        return backgroundColor.pressed ?? backgroundColor.hovered ?? backgroundColor.idle;
      default:
        return backgroundColor.idle;
    }
  }

  return 0xffffff;
}

function resolveNumericDimension(value: PixoraStyle['width'] | PixoraStyle['height'], fallback: number): number {
  return typeof value === 'number' ? value : fallback;
}

function positionLabel(label: Text, width: number, height: number, offset: ButtonText['offset'] | undefined): void {
  label.x = width / 2 + (offset?.x ?? 0);
  label.y = height / 2 + (offset?.y ?? 0);
}

function resolveButtonScale(animation: ButtonAnimationConfig | undefined, state: ButtonState): number {
  switch (state) {
    case 'hovered':
      return animation?.hoverScale ?? 1.01;
    case 'pressed':
      return animation?.pressedScale ?? 1;
    default:
      return 1;
  }
}

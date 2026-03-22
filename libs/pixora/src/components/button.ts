import { Container } from 'pixi.js';


import { signal, type Signal } from '../state/signal';
import { createTransition, type Tween } from '../animation/create-tween';

import { TextNode } from './text-node';
import { Box } from './box';
import { SpriteNode } from './sprite-node';
import { InteractiveComponent } from './interactive-component';

import type { Texture } from 'pixi.js';

export type ButtonTextures = {
  disabled?: Texture;
  hovered?: Texture;
  idle: Texture;
  pressed?: Texture;
};

export type ButtonAnimationConfig = {
  durationMs?: number;
  easing?: 'ease-in' | 'ease-out' | 'ease-in-out' | 'linear';
};

export type ButtonOptions = {
  animation?: ButtonAnimationConfig;
  backgroundColor?: number;
  disabled?: boolean;
  height?: number;
  label: string;
  onPress?: () => void;
  radius?: number;
  textures?: ButtonTextures;
  width?: number;
};

type ButtonState = 'disabled' | 'hovered' | 'idle' | 'pressed';

export class Button extends InteractiveComponent<ButtonOptions, Container> {
  readonly background: Box | SpriteNode;
  readonly label: TextNode;

  private readonly _state: Signal<ButtonState>;
  private readonly _textures: ButtonTextures | undefined;
  private _scaleTween: Tween | undefined;
  private _alphaTween: Tween | undefined;

  constructor(options: ButtonOptions) {
    super(new Container(), options);

    this._textures = options.textures;
    this._state = signal(this.props.disabled ? 'disabled' : 'idle');

    if (this._textures?.idle) {
      this.background = new SpriteNode({ texture: this._textures.idle });
    } else {
      this.background = new Box({
        backgroundColor: options.backgroundColor ?? 0x3b82f6,
        height: options.height ?? 48,
        radius: options.radius ?? 8,
        width: options.width ?? 120,
      });
    }

    this.label = new TextNode({
      style: {
        fill: 0xffffff,
        fontFamily: 'sans-serif',
        fontSize: 16,
        fontWeight: 'bold',
      },
      text: options.label,
    });

    this.label.displayObject.anchor.set(0.5);
    this.label.displayObject.x = this._getBackgroundWidth() / 2;
    this.label.displayObject.y = this._getBackgroundHeight() / 2;

    this.addChild(this.background);
    this.addChild(this.label);

    this.bindInteraction({
      onHoverChange: (hovered) => {
        if (this.props.disabled) {
          return;
        }
        this._transitionTo(hovered ? 'hovered' : 'idle');
      },
      onPress: () => {
        options.onPress?.();
      },
      onPressStart: () => {
        if (!this.props.disabled) {
          this._transitionTo('pressed');
        }
      },
      onPressEnd: () => {
        if (!this.props.disabled) {
          this._transitionTo(this._isHovered() ? 'hovered' : 'idle');
        }
      },
    });

    this.setDisabled(options.disabled ?? false);

    this.displayObject.eventMode = options.disabled ? 'none' : 'static';
    this.displayObject.cursor = options.disabled ? 'default' : 'pointer';

    this._applyStateTexture();
  }

  private _getBackgroundWidth(): number {
    if (this.background instanceof Box) {
      return this.background.getProps().width ?? 120;
    }
    return this.background.displayObject.width || 120;
  }

  private _getBackgroundHeight(): number {
    if (this.background instanceof Box) {
      return this.background.getProps().height ?? 48;
    }
    return this.background.displayObject.height || 48;
  }

  private _isHovered(): boolean {
    return this._state.get() === 'hovered';
  }

  private _transitionTo(state: ButtonState): void {
    const previousState = this._state.get();
    if (previousState === state) {
      return;
    }

    this._state.set(state);
    this._cancelTweens();
    this._applyStateTexture();

    const animation = this.props.animation ?? { durationMs: 100 };
    const durationMs = animation.durationMs ?? 100;
    const easing = animation.easing ?? 'ease-out';

    if (state === 'pressed') {
      this._scaleTween = createTransition({
        durationMs,
        easing,
        from: 1,
        onUpdate: (scale) => {
          this.displayObject.scale.set(scale);
        },
        to: 0.96,
      });
    } else if (previousState === 'pressed' || previousState === 'hovered') {
      this._scaleTween = createTransition({
        durationMs,
        easing,
        from: this.displayObject.scale.x,
        onUpdate: (scale) => {
          this.displayObject.scale.set(scale);
        },
        to: 1,
      });
    }

    if (state === 'hovered' && !this._textures) {
      this._alphaTween = createTransition({
        durationMs,
        easing,
        from: this.displayObject.alpha,
        onUpdate: (alpha) => {
          this.displayObject.alpha = alpha;
        },
        to: 0.9,
      });
    } else if (state === 'idle' && !this._textures) {
      this._alphaTween = createTransition({
        durationMs,
        easing,
        from: this.displayObject.alpha,
        onUpdate: (alpha) => {
          this.displayObject.alpha = alpha;
        },
        to: 1,
      });
    }
  }

  private _cancelTweens(): void {
    this._scaleTween?.dispose();
    this._alphaTween?.dispose();
    this._scaleTween = undefined;
    this._alphaTween = undefined;
  }

  private _applyStateTexture(): void {
    if (!this._textures?.idle) {
      return;
    }

    const state = this._state.get();
    const texture = this._getTextureForState(state);

    if (texture && this.background instanceof SpriteNode) {
      this.background.displayObject.texture = texture;
    }
  }

  private _getTextureForState(state: ButtonState): Texture | undefined {
    switch (state) {
      case 'disabled':
        return this._textures?.disabled ?? this._textures?.idle;
      case 'hovered':
        return this._textures?.hovered ?? this._textures?.idle;
      case 'pressed':
        return this._textures?.pressed ?? this._textures?.hovered ?? this._textures?.idle;
      case 'idle':
      default:
        return this._textures?.idle;
    }
  }

  protected override onPropsChanged(): void {
    super.onPropsChanged();
    this.label.setText(this.props.label);

    if (this.background instanceof Box) {
      this.background.updateProps({
        backgroundColor: this.props.backgroundColor,
        height: this.props.height,
        radius: this.props.radius,
        width: this.props.width,
      });
    }

    this.label.displayObject.x = (this.props.width ?? 120) / 2;
    this.label.displayObject.y = (this.props.height ?? 48) / 2;

    this.displayObject.eventMode = this.props.disabled ? 'none' : 'static';
    this.displayObject.cursor = this.props.disabled ? 'default' : 'pointer';

    if (this._state.get() !== (this.props.disabled ? 'disabled' : 'idle')) {
      this._cancelTweens();
      const newState = this.props.disabled ? 'disabled' : 'idle';
      this._state.set(newState);
      this._applyStateTexture();
      this.displayObject.alpha = this.props.disabled ? 0.5 : 1;
      this.displayObject.scale.set(1);
    }
  }

  override dispose(): void {
    this._cancelTweens();
    super.dispose();
  }
}

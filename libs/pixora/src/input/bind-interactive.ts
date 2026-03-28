import type { Container, FederatedPointerEvent } from 'pixi.js';
import type { Disposable } from '../utils/disposable';

export type ButtonState = 'disabled' | 'hovered' | 'idle' | 'pressed';

export type InteractionState = {
  disabled: boolean;
  hovered: boolean;
  pressed: boolean;
};

export type BindInteractiveOptions = {
  enabled?: boolean;
  onHoverChange?: (hovered: boolean) => void;
  onPress?: () => void;
  onPressEnd?: () => void;
  onPressStart?: () => void;
  onStateChange?: (state: InteractionState) => void;
};

export function bindInteractive(target: Container, options: BindInteractiveOptions): Disposable {
  const state: InteractionState = {
    disabled: options.enabled === false,
    hovered: false,
    pressed: false,
  };

  const updateTargetState = () => {
    target.eventMode = state.disabled ? 'none' : 'static';
    target.cursor = state.disabled ? 'default' : 'pointer';
    options.onStateChange?.({ ...state });
  };

  const handlePointerOver = (_event: FederatedPointerEvent) => {
    if (state.disabled) {
      return;
    }

    state.hovered = true;
    options.onHoverChange?.(true);
    updateTargetState();
  };

  const handlePointerOut = (_event: FederatedPointerEvent) => {
    if (state.disabled) {
      return;
    }

    state.hovered = false;
    state.pressed = false;
    options.onHoverChange?.(false);
    updateTargetState();
  };

  const handlePointerDown = (_event: FederatedPointerEvent) => {
    if (state.disabled) {
      return;
    }

    state.pressed = true;
    options.onPressStart?.();
    updateTargetState();
  };

  const handlePointerUp = (_event: FederatedPointerEvent) => {
    if (state.disabled) {
      return;
    }

    const shouldPress = state.pressed;

    state.pressed = false;
    options.onPressEnd?.();

    if (shouldPress) {
      options.onPress?.();
    }

    updateTargetState();
  };

  updateTargetState();

  target.on('pointerover', handlePointerOver);
  target.on('pointerout', handlePointerOut);
  target.on('pointerdown', handlePointerDown);
  target.on('pointerup', handlePointerUp);
  target.on('pointerupoutside', handlePointerOut);

  return {
    dispose() {
      target.off('pointerover', handlePointerOver);
      target.off('pointerout', handlePointerOut);
      target.off('pointerdown', handlePointerDown);
      target.off('pointerup', handlePointerUp);
      target.off('pointerupoutside', handlePointerOut);
    },
  };
}

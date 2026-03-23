import type { Container, FederatedPointerEvent } from 'pixi.js';
import type { Disposable } from '../utils/disposable';

export type InteractionEventType = 'pointerdown' | 'pointerup' | 'pointerover' | 'pointerout' | 'pointertap';

export type InteractionCallback = (event: PixoraInteractionEvent) => void;

export type PixoraInteractionEvent = {
  type: InteractionEventType;
  target: Container;
  nativeEvent: FederatedPointerEvent;
};

export type InteractiveState = 'disabled' | 'hovered' | 'idle' | 'pressed';

export type InteractiveConfig = {
  disabled?: boolean;
  onPointerDown?: InteractionCallback;
  onPointerOut?: InteractionCallback;
  onPointerOver?: InteractionCallback;
  onPointerTap?: InteractionCallback;
  onPointerUp?: InteractionCallback;
};

type InteractiveBinding = {
  dispose: () => void;
  state: InteractiveState;
};

const activeBindings = new WeakMap<Container, InteractiveBinding>();

export function bindInteractive(target: Container, config: InteractiveConfig): Disposable {
  activeBindings.get(target)?.dispose();

  const state: { current: InteractiveState } = { current: config.disabled ? 'disabled' : 'idle' };

  const updateState = (newState: InteractiveState): void => {
    state.current = newState;
    target.eventMode = newState === 'disabled' ? 'none' : 'static';
    target.cursor = newState === 'disabled' ? 'default' : 'pointer';
  };

  const createHandler = (type: InteractionEventType) => {
    return (nativeEvent: FederatedPointerEvent): void => {
      if (state.current === 'disabled') {
        return;
      }

      const event: PixoraInteractionEvent = {
        nativeEvent,
        target,
        type,
      };

      switch (type) {
        case 'pointerover':
          updateState('hovered');
          config.onPointerOver?.(event);
          break;
        case 'pointerout':
          updateState('idle');
          config.onPointerOut?.(event);
          break;
        case 'pointerdown':
          updateState('pressed');
          config.onPointerDown?.(event);
          break;
        case 'pointerup':
          updateState('hovered');
          config.onPointerTap?.(event);
          config.onPointerUp?.(event);
          break;
      }
    };
  };

  const handlers = {
    pointerover: createHandler('pointerover'),
    pointerout: createHandler('pointerout'),
    pointerdown: createHandler('pointerdown'),
    pointerup: createHandler('pointerup'),
    pointerupoutside: createHandler('pointerout'),
  };

  target.on('pointerover', handlers.pointerover);
  target.on('pointerout', handlers.pointerout);
  target.on('pointerdown', handlers.pointerdown);
  target.on('pointerup', handlers.pointerup);
  target.on('pointerupoutside', handlers.pointerupoutside);

  const binding: InteractiveBinding = {
    dispose: () => {
      target.off('pointerover', handlers.pointerover);
      target.off('pointerout', handlers.pointerout);
      target.off('pointerdown', handlers.pointerdown);
      target.off('pointerup', handlers.pointerup);
      target.off('pointerupoutside', handlers.pointerupoutside);
      activeBindings.delete(target);
    },
    get state() {
      return state.current;
    },
  };

  activeBindings.set(target, binding);

  return binding;
}

export function getInteractiveState(target: Container): InteractiveState | undefined {
  return activeBindings.get(target)?.state;
}

export function isInteractive(target: Container): boolean {
  return activeBindings.has(target);
}

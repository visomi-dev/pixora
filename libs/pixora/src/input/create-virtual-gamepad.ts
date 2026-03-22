import { Container, Graphics, Text, type FederatedPointerEvent } from 'pixi.js';

import { signal } from '../state/signal';
import type { ReadonlySignal } from '../state/signal';

export type VirtualGamepadOptions = {
  parent: Container;
  position?: { x: number; y: number };
  joystickSize?: number;
  buttonSize?: number;
  onDirectionChange?: (direction: JoystickDirection) => void;
  onButtonPress?: (button: GamepadButton) => void;
  onButtonRelease?: (button: GamepadButton) => void;
};

export type JoystickDirection = {
  x: number;
  y: number;
  angle: number;
  magnitude: number;
};

export type GamepadButton = 'fire' | 'jump' | 'action1' | 'action2';

export type VirtualGamepadState = {
  readonly direction: ReadonlySignal<JoystickDirection>;
  readonly buttonsPressed: ReadonlySignal<Set<GamepadButton>>;
  readonly container: Container;
  readonly dispose: () => void;
};

type JoystickState = {
  active: boolean;
  touchId: number | null;
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
};

const JOYSTICK_SENSITIVITY = 0.3;

export function createVirtualGamepad(options: VirtualGamepadOptions): VirtualGamepadState {
  const parent = options.parent;
  const joystickSize = options.joystickSize ?? 80;
  const buttonSize = options.buttonSize ?? 50;
  const posX = options.position?.x ?? 60;
  const posY = options.position?.y ?? (parent.height ?? 400) - 100;

  const container = new Container();
  container.width = parent.width ?? 400;
  container.height = parent.height ?? 400;

  const direction = signal<JoystickDirection>({ x: 0, y: 0, angle: 0, magnitude: 0 });
  const buttonsPressed = signal<Set<GamepadButton>>(new Set());

  const joystickBaseGraphics = new Graphics();
  joystickBaseGraphics.circle(joystickSize / 2, joystickSize / 2, joystickSize / 2);
  joystickBaseGraphics.fill({ color: 0x333333, alpha: 0.8 });
  joystickBaseGraphics.setStrokeStyle({ width: 2, color: 0x555555 });
  joystickBaseGraphics.circle(joystickSize / 2, joystickSize / 2, joystickSize / 2);
  joystickBaseGraphics.stroke();

  const joystickKnobGraphics = new Graphics();
  const knobRadius = joystickSize * 0.2;

  const joystickBase = new Container();
  joystickBase.addChild(joystickBaseGraphics);
  joystickBase.position.set(posX, posY);

  const joystickKnob = new Container();
  joystickKnob.addChild(joystickKnobGraphics);
  joystickKnobGraphics.circle(knobRadius, knobRadius, knobRadius);
  joystickKnobGraphics.fill({ color: 0x888888 });
  joystickKnob.position.set(posX + joystickSize / 2 - knobRadius, posY + joystickSize / 2 - knobRadius);

  const buttonConfigs: { key: GamepadButton; label: string; x: number; y: number }[] = [
    { key: 'fire', label: '●', x: (parent.width ?? 400) - 80, y: posY - 20 },
    { key: 'jump', label: '▲', x: (parent.width ?? 400) - 140, y: posY - 40 },
    { key: 'action1', label: '■', x: (parent.width ?? 400) - 80, y: posY + 30 },
    { key: 'action2', label: '◆', x: (parent.width ?? 400) - 20, y: posY + 30 },
  ];

  const buttons: Map<GamepadButton, Container> = new Map();

  for (const config of buttonConfigs) {
    const btnContainer = new Container();
    const btnBg = new Graphics();
    btnBg.circle(buttonSize / 2, buttonSize / 2, buttonSize / 2);
    btnBg.fill({ color: 0x444444, alpha: 0.8 });
    btnBg.setStrokeStyle({ width: 2, color: 0x666666 });
    btnBg.circle(buttonSize / 2, buttonSize / 2, buttonSize / 2);
    btnBg.stroke();

    const label = new Text({
      text: config.label,
      style: { fill: 0xffffff, fontSize: 18, fontWeight: 'bold' as const },
    });
    label.anchor.set(0.5);
    label.position.set(buttonSize / 2, buttonSize / 2);

    btnContainer.addChild(btnBg);
    btnContainer.addChild(label);
    btnContainer.position.set(config.x, config.y);
    btnContainer.eventMode = 'static';
    btnContainer.cursor = 'pointer';

    const pressHandler = () => {
      buttonsPressed.update((set) => new Set(set).add(config.key));
      btnBg.clear();
      btnBg.circle(buttonSize / 2, buttonSize / 2, buttonSize / 2);
      btnBg.fill({ color: 0x666666, alpha: 0.9 });
      btnBg.setStrokeStyle({ width: 2, color: 0x888888 });
      btnBg.circle(buttonSize / 2, buttonSize / 2, buttonSize / 2);
      btnBg.stroke();
      options.onButtonPress?.(config.key);
    };

    const releaseHandler = () => {
      buttonsPressed.update((set) => {
        const newSet = new Set(set);
        newSet.delete(config.key);
        return newSet;
      });
      btnBg.clear();
      btnBg.circle(buttonSize / 2, buttonSize / 2, buttonSize / 2);
      btnBg.fill({ color: 0x444444, alpha: 0.8 });
      btnBg.setStrokeStyle({ width: 2, color: 0x666666 });
      btnBg.circle(buttonSize / 2, buttonSize / 2, buttonSize / 2);
      btnBg.stroke();
      options.onButtonRelease?.(config.key);
    };

    btnContainer.on('pointerdown', pressHandler);
    btnContainer.on('pointerup', releaseHandler);
    btnContainer.on('pointerupoutside', releaseHandler);

    container.addChild(btnContainer);
    buttons.set(config.key, btnContainer);
  }

  container.addChild(joystickBase);
  container.addChild(joystickKnob);
  parent.addChild(container);

  const joystickState: JoystickState = {
    active: false,
    touchId: null,
    startX: posX + joystickSize / 2,
    startY: posY + joystickSize / 2,
    currentX: posX + joystickSize / 2,
    currentY: posY + joystickSize / 2,
  };

  function updateDirection(): void {
    const dx = joystickState.currentX - joystickState.startX;
    const dy = joystickState.currentY - joystickState.startY;
    const maxRadius = joystickSize / 2 - knobRadius;
    const magnitude = Math.min(Math.sqrt(dx * dx + dy * dy) / maxRadius, 1);

    let x = 0;
    let y = 0;
    let angle = 0;

    if (magnitude > JOYSTICK_SENSITIVITY) {
      x = dx / maxRadius;
      y = dy / maxRadius;
      angle = Math.atan2(dy, dx);
    }

    const newDirection = { x, y, angle, magnitude };
    direction.set(newDirection);
    options.onDirectionChange?.(newDirection);
  }

  function updateJoystickKnob(x: number, y: number): void {
    const maxRadius = joystickSize / 2 - knobRadius;
    const dx = x - joystickState.startX;
    const dy = y - joystickState.startY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    let knobX: number;
    let knobY: number;

    if (dist > maxRadius) {
      const scale = maxRadius / dist;
      knobX = joystickState.startX + dx * scale - knobRadius;
      knobY = joystickState.startY + dy * scale - knobRadius;
    } else {
      knobX = x - knobRadius;
      knobY = y - knobRadius;
    }

    joystickKnob.position.set(knobX, knobY);
  }

  function handleTouchStart(event: FederatedPointerEvent): void {
    const local = container.toLocal(event.global);

    const jLeft = 0;
    const jRight = joystickSize;
    const jTop = 0;
    const jBottom = joystickSize;

    if (local.x >= jLeft && local.x <= jRight && local.y >= jTop && local.y <= jBottom) {
      joystickState.active = true;
      joystickState.touchId = event.pointerId;
      joystickState.currentX = local.x;
      joystickState.currentY = local.y;
      updateJoystickKnob(local.x, local.y);
    }
  }

  function handleTouchMove(event: FederatedPointerEvent): void {
    if (!joystickState.active || event.pointerId !== joystickState.touchId) {
      return;
    }

    const local = container.toLocal(event.global);
    joystickState.currentX = local.x;
    joystickState.currentY = local.y;
    updateJoystickKnob(local.x, local.y);
    updateDirection();
  }

  function handleTouchEnd(event: FederatedPointerEvent): void {
    if (event.pointerId !== joystickState.touchId) {
      return;
    }

    joystickState.active = false;
    joystickState.touchId = null;
    joystickState.currentX = joystickState.startX;
    joystickState.currentY = joystickState.startY;
    updateJoystickKnob(joystickState.startX, joystickState.startY);
    updateDirection();
  }

  container.on('pointerdown', handleTouchStart);
  container.on('pointermove', handleTouchMove);
  container.on('pointerup', handleTouchEnd);
  container.on('pointerupoutside', handleTouchEnd);

  return {
    direction: direction.asReadonly(),
    buttonsPressed: buttonsPressed.asReadonly(),
    container,
    dispose() {
      container.off('pointerdown', handleTouchStart);
      container.off('pointermove', handleTouchMove);
      container.off('pointerup', handleTouchEnd);
      container.off('pointerupoutside', handleTouchEnd);
      parent.removeChild(container);
      buttons.clear();
    },
  };
}

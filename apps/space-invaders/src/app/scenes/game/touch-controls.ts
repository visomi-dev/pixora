import { createVirtualGamepad, pixora } from 'pixora';

import { shouldUseTouchControls } from '../../shared/layout';

import { resetTouchControls, setTouchControlsActive, setTouchFirePressed, setTouchMoveDirection } from './game-state';

import type { ApplicationContext, PixoraNode, Viewport, VirtualGamepadState } from 'pixora';

const touchControlNodes = new WeakMap<ApplicationContext, PixoraNode>();

export function touchControls(context: ApplicationContext): PixoraNode | null {
  if (!shouldUseTouchControls(context.viewport.get())) {
    setTouchControlsActive(false);
    resetTouchControls();

    return null;
  }

  const existing = touchControlNodes.get(context);

  if (existing) {
    return existing;
  }

  const node = pixora.island({
    context,
    key: 'touch-controls',
    setup: ({ root }) => {
      let gamepad: VirtualGamepadState | null = null;

      const mountGamepad = (viewport: Viewport) => {
        const joystickSize = viewport.width < 420 ? 74 : viewport.width < 720 ? 84 : 92;
        const buttonSize = viewport.width < 420 ? 48 : viewport.width < 720 ? 54 : 60;
        const horizontalPadding = viewport.width < 420 ? 18 : 24;
        const bottomPadding = viewport.height < 700 ? 18 : 28;

        root.layout = {
          height: viewport.height,
          left: 0,
          position: 'absolute',
          top: 0,
          width: viewport.width,
        };
        root.setLayoutSize(viewport.width, viewport.height);

        gamepad?.dispose();
        gamepad = createVirtualGamepad({
          buttonSize,
          joystickSize,
          onButtonPress: (button) => {
            if (button === 'fire') {
              setTouchFirePressed(true);
            }
          },
          onButtonRelease: (button) => {
            if (button === 'fire') {
              setTouchFirePressed(false);
            }
          },
          onDirectionChange: (direction) => setTouchMoveDirection(direction.x),
          parent: root.displayObject,
          position: {
            x: horizontalPadding,
            y: viewport.height - joystickSize - bottomPadding,
          },
        });

        gamepad.container.alpha = 0.9;
        gamepad.container.eventMode = 'static';
        gamepad.container.label = 'TouchControls';
        setTouchControlsActive(true);
      };

      mountGamepad(context.viewport.get());
      root.addDisposable(
        context.viewport.subscribe((viewport) => {
          if (!shouldUseTouchControls(viewport)) {
            gamepad?.dispose();
            gamepad = null;
            setTouchControlsActive(false);
            resetTouchControls();

            return;
          }

          mountGamepad(viewport);
        }),
      );
      root.addDisposable({
        dispose() {
          gamepad?.dispose();
          touchControlNodes.delete(context);
          setTouchControlsActive(false);
          resetTouchControls();
        },
      });
    },
  });

  touchControlNodes.set(context, node);

  return node;
}

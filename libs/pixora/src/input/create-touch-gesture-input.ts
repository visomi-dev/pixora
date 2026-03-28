import { signal } from '../state/signal';

import type { Container, FederatedPointerEvent } from 'pixi.js';
import type { ReadonlySignal } from '../state/signal';

export type GestureType =
  | 'tap'
  | 'longPress'
  | 'swipeLeft'
  | 'swipeRight'
  | 'swipeUp'
  | 'swipeDown'
  | 'pinch'
  | 'spread';

export type GestureEvent = {
  type: GestureType;
  x: number;
  y: number;
  velocity?: number;
  scale?: number;
};

export type TouchGestureState = {
  readonly lastGesture: ReadonlySignal<GestureEvent | null>;
  readonly isTouching: ReadonlySignal<boolean>;
  readonly attach: (container: Container) => void;
  readonly detach: () => void;
  readonly dispose: () => void;
};

type TouchPoint = {
  id: number;
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  startTime: number;
};

const TAP_THRESHOLD = 200;
const LONG_PRESS_THRESHOLD = 500;
const SWIPE_THRESHOLD = 50;
const VELOCITY_WINDOW_MS = 100;

export function createTouchGestureInput(): TouchGestureState {
  const lastGesture = signal<GestureEvent | null>(null);
  const isTouching = signal<boolean>(false);

  let targetContainer: Container | null = null;
  const activeTouches = new Map<number, TouchPoint>();
  let tapTimeout: ReturnType<typeof setTimeout> | null = null;
  let longPressTimeout: ReturnType<typeof setTimeout> | null = null;
  let gestureStartScale = 1;

  function emitGesture(gesture: GestureEvent): void {
    lastGesture.set(gesture);
    isTouching.set(false);
  }

  function clearTimeouts(): void {
    if (tapTimeout) {
      clearTimeout(tapTimeout);
      tapTimeout = null;
    }
    if (longPressTimeout) {
      clearTimeout(longPressTimeout);
      longPressTimeout = null;
    }
  }

  function calculateVelocity(startTime: number, endTime: number, distance: number): number {
    const elapsed = endTime - startTime;
    if (elapsed > VELOCITY_WINDOW_MS) {
      return distance / VELOCITY_WINDOW_MS;
    }
    return distance / elapsed;
  }

  function handlePointerDown(event: FederatedPointerEvent): void {
    if (activeTouches.size === 0) {
      clearTimeouts();
    }

    const point: TouchPoint = {
      id: event.pointerId,
      startX: event.globalX,
      startY: event.globalY,
      currentX: event.globalX,
      currentY: event.globalY,
      startTime: Date.now(),
    };

    activeTouches.set(event.pointerId, point);
    isTouching.set(true);

    longPressTimeout = setTimeout(() => {
      const currentPoint = activeTouches.get(point.id);
      if (currentPoint) {
        const dx = currentPoint.currentX - currentPoint.startX;
        const dy = currentPoint.currentY - currentPoint.startY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < SWIPE_THRESHOLD) {
          emitGesture({
            type: 'longPress',
            x: currentPoint.currentX,
            y: currentPoint.currentY,
          });
          activeTouches.delete(point.id);
        }
      }
    }, LONG_PRESS_THRESHOLD);

    if (activeTouches.size === 2) {
      gestureStartScale = 1;
    }
  }

  function handlePointerMove(event: FederatedPointerEvent): void {
    const point = activeTouches.get(event.pointerId);
    if (!point) {
      return;
    }

    point.currentX = event.globalX;
    point.currentY = event.globalY;

    if (activeTouches.size === 2) {
      const otherPoints = Array.from(activeTouches.values()).filter((p) => p.id !== point.id);
      if (otherPoints.length === 1) {
        const other = otherPoints[0];
        const dx1 = point.currentX - other.currentX;
        const dy1 = point.currentY - other.currentY;
        const dx2 = point.startX - other.startX;
        const dy2 = point.startY - other.startY;
        const currentDist = Math.sqrt(dx1 * dx1 + dy1 * dy1);
        const startDist = Math.sqrt(dx2 * dx2 + dy2 * dy2);

        if (startDist > 0) {
          const scale = currentDist / startDist;
          if (Math.abs(scale - gestureStartScale) > 0.1) {
            gestureStartScale = scale;
            emitGesture({
              type: scale > 1 ? 'spread' : 'pinch',
              x: (point.currentX + other.currentX) / 2,
              y: (point.currentY + other.currentY) / 2,
              scale,
            });
          }
        }
      }
    }
  }

  function handlePointerUp(event: FederatedPointerEvent): void {
    const point = activeTouches.get(event.pointerId);
    if (!point) {
      return;
    }

    clearTimeouts();

    const dx = point.currentX - point.startX;
    const dy = point.currentY - point.startY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const elapsed = Date.now() - point.startTime;

    if (dist < SWIPE_THRESHOLD) {
      if (elapsed < TAP_THRESHOLD) {
        emitGesture({
          type: 'tap',
          x: point.currentX,
          y: point.currentY,
        });
      }
    } else {
      const velocity = calculateVelocity(point.startTime, Date.now(), dist);
      const absDx = Math.abs(dx);
      const absDy = Math.abs(dy);

      if (absDx > absDy) {
        emitGesture({
          type: dx > 0 ? 'swipeRight' : 'swipeLeft',
          x: point.currentX,
          y: point.currentY,
          velocity: velocity * (dx > 0 ? 1 : -1),
        });
      } else {
        emitGesture({
          type: dy > 0 ? 'swipeDown' : 'swipeUp',
          x: point.currentX,
          y: point.currentY,
          velocity: velocity * (dy > 0 ? 1 : -1),
        });
      }
    }

    activeTouches.delete(event.pointerId);
    if (activeTouches.size === 0) {
      isTouching.set(false);
    }
  }

  function handlePointerCancel(event: FederatedPointerEvent): void {
    activeTouches.delete(event.pointerId);
    clearTimeouts();
    if (activeTouches.size === 0) {
      isTouching.set(false);
    }
  }

  function attach(container: Container): void {
    detach();
    targetContainer = container;
    container.on('pointerdown', handlePointerDown);
    container.on('pointermove', handlePointerMove);
    container.on('pointerup', handlePointerUp);
    container.on('pointerupoutside', handlePointerUp);
    container.on('pointercancel', handlePointerCancel);
  }

  function detach(): void {
    if (!targetContainer) {
      return;
    }
    targetContainer.off('pointerdown', handlePointerDown);
    targetContainer.off('pointermove', handlePointerMove);
    targetContainer.off('pointerup', handlePointerUp);
    targetContainer.off('pointerupoutside', handlePointerUp);
    targetContainer.off('pointercancel', handlePointerCancel);
    targetContainer = null;
  }

  return {
    lastGesture: lastGesture.asReadonly(),
    isTouching: isTouching.asReadonly(),
    attach,
    detach,
    dispose() {
      detach();
      clearTimeouts();
      activeTouches.clear();
    },
  };
}

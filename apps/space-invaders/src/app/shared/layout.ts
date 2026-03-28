import type { Viewport } from 'pixora';

export type SceneMetrics = {
  bodySize: number;
  buttonHeight: number;
  buttonWidth: number;
  contentWidth: number;
  gap: number;
  hudCompact: boolean;
  isCompact: boolean;
  isPortrait: boolean;
  padding: number;
  panelPadding: number;
  subtitleSize: number;
  titleSize: number;
};

export function getSceneMetrics(viewport: Viewport): SceneMetrics {
  const shortestSide = Math.min(viewport.width, viewport.height);
  const isPortrait = viewport.height > viewport.width;
  const isCompact = shortestSide < 700;

  return {
    bodySize: shortestSide < 420 ? 14 : shortestSide < 640 ? 16 : 18,
    buttonHeight: shortestSide < 420 ? 50 : shortestSide < 640 ? 54 : 58,
    buttonWidth: Math.min(viewport.width - 48, shortestSide < 420 ? 220 : shortestSide < 640 ? 260 : 300),
    contentWidth: Math.min(viewport.width - 32, isPortrait ? 420 : 560),
    gap: shortestSide < 420 ? 12 : shortestSide < 640 ? 16 : 22,
    hudCompact: viewport.width < 900,
    isCompact,
    isPortrait,
    padding: shortestSide < 420 ? 16 : shortestSide < 640 ? 20 : 28,
    panelPadding: shortestSide < 420 ? 16 : shortestSide < 640 ? 20 : 28,
    subtitleSize: shortestSide < 420 ? 18 : shortestSide < 640 ? 22 : 28,
    titleSize: shortestSide < 420 ? 34 : shortestSide < 640 ? 46 : 72,
  };
}

export function supportsTouchInput(): boolean {
  if (typeof globalThis === 'undefined') {
    return false;
  }

  const hasTouchEvent = 'ontouchstart' in globalThis;
  const hasTouchPoints = typeof navigator !== 'undefined' && navigator.maxTouchPoints > 0;

  return hasTouchEvent || hasTouchPoints;
}

export function shouldUseTouchControls(viewport: Viewport): boolean {
  if (!supportsTouchInput()) {
    return false;
  }

  const hasCoarsePointer =
    typeof globalThis.matchMedia === 'function' && globalThis.matchMedia('(pointer: coarse)').matches;

  return hasCoarsePointer || viewport.width <= 900 || viewport.height <= 720;
}

import type { Viewport } from 'pixora';

export type MenuMetrics = {
  bodySize: number;
  buttonHeight: number;
  buttonWidth: number;
  contentWidth: number;
  gap: number;
  isCompact: boolean;
  isPortrait: boolean;
  padding: number;
  titleSize: number;
};

export function getMenuMetrics(viewport: Viewport): MenuMetrics {
  const shortestSide = Math.min(viewport.width, viewport.height);
  const isPortrait = viewport.height > viewport.width;

  return {
    bodySize: shortestSide < 420 ? 15 : shortestSide < 720 ? 18 : 20,
    buttonHeight: shortestSide < 420 ? 62 : shortestSide < 720 ? 68 : 72,
    buttonWidth: Math.min(viewport.width - 40, shortestSide < 420 ? 220 : shortestSide < 720 ? 260 : 280),
    contentWidth: Math.min(viewport.width - 32, isPortrait ? 360 : 520),
    gap: shortestSide < 420 ? 12 : shortestSide < 720 ? 18 : 24,
    isCompact: shortestSide < 720,
    isPortrait,
    padding: shortestSide < 420 ? 16 : shortestSide < 720 ? 22 : 30,
    titleSize: shortestSide < 420 ? 36 : shortestSide < 720 ? 46 : 58,
  };
}

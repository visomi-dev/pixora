import { signal, type Signal } from '../state/signal';

import type { Viewport } from './types';

export type ViewportManager = {
  destroy(): void;
  refresh(): Viewport;
  viewport: Signal<Viewport>;
};

type CreateViewportManagerOptions = {
  height?: number;
  mount: HTMLElement;
  width?: number;
};

export function createViewportManager(options: CreateViewportManagerOptions): ViewportManager {
  const viewport = signal(readViewport(options.mount, options.width, options.height));
  const handleResize = () => {
    viewport.set(readViewport(options.mount, options.width, options.height));
  };
  const resizeObserver =
    typeof globalThis.ResizeObserver === 'function' && options.width === undefined && options.height === undefined
      ? new globalThis.ResizeObserver(handleResize)
      : null;

  resizeObserver?.observe(options.mount);
  globalThis.addEventListener?.('resize', handleResize);

  return {
    destroy() {
      resizeObserver?.disconnect();
      globalThis.removeEventListener?.('resize', handleResize);
    },
    refresh() {
      const nextViewport = readViewport(options.mount, options.width, options.height);

      viewport.set(nextViewport);

      return nextViewport;
    },
    viewport,
  };
}

function readViewport(mount: HTMLElement, fallbackWidth?: number, fallbackHeight?: number): Viewport {
  const bounds = mount.getBoundingClientRect();
  const computedWidth = fallbackWidth ?? mount.clientWidth ?? bounds.width;
  const computedHeight = fallbackHeight ?? mount.clientHeight ?? bounds.height;

  if (computedWidth === 0 || computedHeight === 0) {
    console.warn(
      `[pixora] Mount element has no dimensions (${computedWidth}x${computedHeight}). ` +
        `Ensure the element has CSS dimensions (e.g., #game { width: 100%; height: 100%; }). ` +
        `Using fallback resolution (1280x720).`,
    );
  }

  const width = Math.max(1, Math.floor(computedWidth ?? 1280));
  const height = Math.max(1, Math.floor(computedHeight ?? 720));

  return {
    aspectRatio: width / height,
    height,
    orientation: width >= height ? 'landscape' : 'portrait',
    width,
  };
}

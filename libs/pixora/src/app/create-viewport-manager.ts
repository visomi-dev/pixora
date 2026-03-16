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
  const width = Math.max(1, Math.floor(fallbackWidth ?? mount.clientWidth ?? bounds.width ?? 1280));
  const height = Math.max(1, Math.floor(fallbackHeight ?? mount.clientHeight ?? bounds.height ?? 720));

  return {
    aspectRatio: width / height,
    height,
    orientation: width >= height ? 'landscape' : 'portrait',
    width,
  };
}

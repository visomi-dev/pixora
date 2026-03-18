import type { ApplicationContext } from '../app/types';

import { InvalidationFlag } from './lifecycle';
import type { MountedTree } from './mounted-node';
import { runLayout } from './layout-runtime';
import { updateTree } from './reconcile';
import type { PixoraNode } from './types';

export type SchedulerTask = {
  type: 'update' | 'layout';
  sceneKey: string;
  mountedTree: MountedTree;
  renderFn: (context: ApplicationContext) => PixoraNode;
  context: ApplicationContext;
};

type ScheduledUpdate = {
  sceneKey: string;
  mountedTree: MountedTree;
  renderFn: (context: ApplicationContext) => PixoraNode;
  context: ApplicationContext;
  visualDirty: boolean;
  layoutDirty: boolean;
};

export class Scheduler {
  private pendingUpdates = new Map<string, ScheduledUpdate>();
  private postUpdateCallbacks: (() => void)[] = [];
  private isProcessing = false;
  private frameCallback: (() => void) | null = null;
  private frameHandle: number | ReturnType<typeof setTimeout> | null = null;
  private usesAnimationFrame = false;

  scheduleUpdate(
    sceneKey: string,
    mountedTree: MountedTree,
    renderFn: (context: ApplicationContext) => PixoraNode,
    context: ApplicationContext,
    flags: InvalidationFlag,
  ): void {
    const existing = this.pendingUpdates.get(sceneKey);

    if (existing) {
      existing.visualDirty = existing.visualDirty || (flags & InvalidationFlag.Visual) !== 0;
      existing.layoutDirty = existing.layoutDirty || (flags & InvalidationFlag.Layout) !== 0;

      return;
    }

    this.pendingUpdates.set(sceneKey, {
      context,
      layoutDirty: (flags & InvalidationFlag.Layout) !== 0,
      mountedTree,
      renderFn,
      sceneKey,
      visualDirty: (flags & InvalidationFlag.Visual) !== 0,
    });

    this.scheduleFrame();
  }

  scheduleFrame(): void {
    if (this.frameHandle !== null) {
      return;
    }

    this.frameCallback = () => {
      this.frameCallback = null;
      this.frameHandle = null;
      this.usesAnimationFrame = false;
      this.processUpdates();
    };

    if (typeof requestAnimationFrame !== 'undefined') {
      this.usesAnimationFrame = true;
      this.frameHandle = requestAnimationFrame(this.frameCallback);
    } else {
      this.usesAnimationFrame = false;
      this.frameHandle = setTimeout(this.frameCallback, 16);
    }
  }

  private processUpdates(): void {
    if (this.isProcessing) {
      return;
    }

    this.isProcessing = true;

    const updates = Array.from(this.pendingUpdates.values());
    this.pendingUpdates.clear();

    for (const update of updates) {
      this.processUpdate(update);
    }

    this.runPostUpdateCallbacks();

    this.isProcessing = false;
  }

  private processUpdate(update: ScheduledUpdate): void {
    if (update.visualDirty) {
      const newTree = update.renderFn(update.context);
      updateTree(update.mountedTree, newTree);
    }

    if (update.layoutDirty) {
      this.runLayout(update.mountedTree);
    }
  }

  private runLayout(tree: MountedTree): void {
    const viewport = tree.context.viewport.get();

    runLayout(tree.root.hostNode, viewport);
  }

  schedulePostUpdate(callback: () => void): void {
    this.postUpdateCallbacks.push(callback);
  }

  private runPostUpdateCallbacks(): void {
    const callbacks = this.postUpdateCallbacks.splice(0);

    for (const callback of callbacks) {
      try {
        callback();
      } catch (error) {
        console.error('Error in post-update callback:', error);
      }
    }
  }

  isScheduled(sceneKey: string): boolean {
    return this.pendingUpdates.has(sceneKey);
  }

  hasPendingUpdates(): boolean {
    return this.pendingUpdates.size > 0;
  }

  clear(): void {
    this.pendingUpdates.clear();
    this.postUpdateCallbacks.splice(0);
  }

  destroy(): void {
    if (this.frameHandle !== null) {
      if (this.usesAnimationFrame && typeof cancelAnimationFrame === 'function' && typeof this.frameHandle === 'number') {
        cancelAnimationFrame(this.frameHandle);
      } else {
        clearTimeout(this.frameHandle);
      }
    }

    this.clear();
    this.frameCallback = null;
    this.frameHandle = null;
    this.usesAnimationFrame = false;
  }
}

let globalScheduler: Scheduler | null = null;

export function getScheduler(): Scheduler {
  if (!globalScheduler) {
    globalScheduler = new Scheduler();
  }

  return globalScheduler;
}

export function createScheduler(): Scheduler {
  return new Scheduler();
}

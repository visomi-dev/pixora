/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ApplicationContext } from '../app/types';

import { InvalidationFlag } from './lifecycle';
import { Scheduler, createScheduler } from './scheduler';
import { container } from './create-node';

describe('Scheduler', () => {
  let scheduler: Scheduler;
  let mockContext: ApplicationContext;
  let mockMountedTree: ReturnType<typeof createMockMountedTree>;

  beforeEach(() => {
    scheduler = createScheduler();
    mockContext = {} as ApplicationContext;
    mockMountedTree = createMockMountedTree();
  });

  afterEach(() => {
    scheduler.destroy();
    vi.restoreAllMocks();
  });

  describe('scheduleUpdate', () => {
    it('schedules an update for a scene', () => {
      scheduler.scheduleUpdate(
        'scene1',
        mockMountedTree as any,
        () => container(),
        mockContext,
        InvalidationFlag.Visual,
      );

      expect(scheduler.isScheduled('scene1')).toBe(true);
      expect(scheduler.hasPendingUpdates()).toBe(true);
    });

    it('batches multiple updates for the same scene', () => {
      scheduler.scheduleUpdate(
        'scene1',
        mockMountedTree as any,
        () => container(),
        mockContext,
        InvalidationFlag.Visual,
      );

      scheduler.scheduleUpdate(
        'scene1',
        mockMountedTree as any,
        () => container(),
        mockContext,
        InvalidationFlag.Layout,
      );

      expect(scheduler.hasPendingUpdates()).toBe(true);
    });
  });

  describe('schedulePostUpdate', () => {
    it('adds callback to post-update queue', () => {
      const callback = vi.fn();
      scheduler.schedulePostUpdate(callback);

      scheduler.schedulePostUpdate(callback);

      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('isScheduled', () => {
    it('returns false for non-existent scene', () => {
      expect(scheduler.isScheduled('nonexistent')).toBe(false);
    });
  });

  describe('hasPendingUpdates', () => {
    it('returns false when no updates are scheduled', () => {
      expect(scheduler.hasPendingUpdates()).toBe(false);
    });
  });

  describe('clear', () => {
    it('clears all pending updates', () => {
      scheduler.scheduleUpdate(
        'scene1',
        mockMountedTree as any,
        () => container(),
        mockContext,
        InvalidationFlag.Visual,
      );

      scheduler.clear();

      expect(scheduler.hasPendingUpdates()).toBe(false);
    });
  });

  describe('destroy', () => {
    it('cancels a queued frame before teardown', () => {
      const clearTimeoutSpy = vi.spyOn(globalThis, 'clearTimeout');

      scheduler.scheduleUpdate('scene1', mockMountedTree as any, () => container(), mockContext, InvalidationFlag.Visual);
      scheduler.destroy();

      expect(clearTimeoutSpy).toHaveBeenCalled();
    });
  });
});

function createMockMountedTree() {
  return {
    context: {},
    root: {
      children: [],
      definition: null,
      hostNode: null,
      isImperative: false,
      parent: null,
    },
  };
}

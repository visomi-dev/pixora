import { vi } from 'vitest';

import { computed, createStore, effect, signal } from './signal';

describe('signal', () => {
  it('reads and writes values', () => {
    const s = signal(0);
    expect(s.get()).toBe(0);

    s.set(1);
    expect(s.get()).toBe(1);

    s.update((v) => v + 1);
    expect(s.get()).toBe(2);
  });

  it('notifies subscribers on change', () => {
    const s = signal('a');
    const spy = vi.fn();
    const sub = s.subscribe(spy);

    s.set('a'); // no change, no call
    expect(spy).not.toHaveBeenCalled();

    s.set('b');
    expect(spy).toHaveBeenCalledWith('b', 'a');

    sub.dispose();
    s.set('c');
    expect(spy).toHaveBeenCalledTimes(1); // not called again
  });
});

describe('computed', () => {
  it('computes derived values', () => {
    const first = signal('Hello');
    const last = signal('World');
    const full = computed(() => `${first.get()} ${last.get()}`);

    expect(full.get()).toBe('Hello World');

    first.set('Hi');
    expect(full.get()).toBe('Hi World');
  });

  it('notifies subscribers when dependencies change', () => {
    const count = signal(1);
    const doubled = computed(() => count.get() * 2);
    const spy = vi.fn();
    const sub = doubled.subscribe(spy);

    count.set(2);
    expect(spy).toHaveBeenCalledWith(4, 2);

    sub.dispose();
  });
});

describe('effect', () => {
  it('runs on initialization and dependency changes', () => {
    const s = signal(0);
    const spy = vi.fn();
    
    const ef = effect(() => {
      spy(s.get());
    });

    expect(spy).toHaveBeenCalledWith(0);
    expect(spy).toHaveBeenCalledTimes(1);

    s.set(1);
    expect(spy).toHaveBeenCalledWith(1);
    expect(spy).toHaveBeenCalledTimes(2);

    ef.dispose();
    s.set(2);
    expect(spy).toHaveBeenCalledTimes(2); // no longer runs
  });

  it('handles cleanup functions', () => {
    const s = signal(true);
    const cleanupSpy = vi.fn();
    const runSpy = vi.fn();

    const ef = effect(() => {
      runSpy(s.get());
      return () => {
        cleanupSpy(s.get());
      };
    });

    expect(runSpy).toHaveBeenCalledWith(true);
    expect(cleanupSpy).not.toHaveBeenCalled();

    s.set(false);
    expect(cleanupSpy).toHaveBeenCalledWith(true); // cleanup from previous run
    expect(runSpy).toHaveBeenCalledWith(false);

    ef.dispose();
    expect(cleanupSpy).toHaveBeenCalledWith(false); // final cleanup
  });
});

describe('createStore', () => {
  it('reads and patches state', () => {
    const store = createStore({ hp: 100, x: 0, y: 0 });

    expect(store.get().hp).toBe(100);

    store.patch({ hp: 50 });
    expect(store.get()).toEqual({ hp: 50, x: 0, y: 0 });

    store.set({ hp: 0, x: 10, y: 10 });
    expect(store.get()).toEqual({ hp: 0, x: 10, y: 10 });
  });

  it('supports derived selectors', () => {
    const store = createStore({ hp: 100, dead: false });
    const isDead = store.select((state) => state.hp <= 0);

    expect(isDead.get()).toBe(false);

    store.patch({ hp: 0 });
    expect(isDead.get()).toBe(true);
  });
});

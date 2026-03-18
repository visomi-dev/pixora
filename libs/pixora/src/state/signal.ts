import type { Disposable } from '../utils/disposable';

type Listener<T> = (value: T, previous: T) => void;
type EffectCleanup = Disposable | (() => void) | void;
type EffectRunner = () => EffectCleanup;
type ReactiveSource = {
  subscribeObserver(observer: ReactiveObserver): void;
  unsubscribeObserver(observer: ReactiveObserver): void;
};
type ReactiveObserver = {
  addDependency(source: ReactiveSource): void;
  onDependencyChanged(): void;
};

export type ReadonlySignal<T> = {
  get(): T;
  subscribe(listener: Listener<T>): Disposable;
};

export type Signal<T> = ReadonlySignal<T> & {
  asReadonly(): ReadonlySignal<T>;
  set(next: T): void;
  update(updater: (current: T) => T): void;
};

export type Store<State> = {
  get(): State;
  patch(patch: Partial<State>): void;
  select<Selected>(selector: (state: State) => Selected): ReadonlySignal<Selected>;
  set(next: State): void;
  subscribe(listener: Listener<State>): Disposable;
};

let activeObserver: ReactiveObserver | null = null;

export function signal<T>(initialValue: T): Signal<T> {
  return new SignalState(initialValue);
}

export function computed<T>(read: () => T): ReadonlySignal<T> {
  return new ComputedState(read);
}

export function effect(run: EffectRunner): Disposable {
  return new EffectState(run);
}

export function createStore<State>(initialState: State): Store<State> {
  const stateSignal = signal(initialState);

  return {
    get() {
      return stateSignal.get();
    },
    patch(patch) {
      stateSignal.update((current) => ({ ...current, ...patch }));
    },
    select(selector) {
      return computed(() => selector(stateSignal.get()));
    },
    set(next) {
      stateSignal.set(next);
    },
    subscribe(listener) {
      return stateSignal.subscribe(listener);
    },
  };
}

class SignalState<T> implements Signal<T>, ReactiveSource {
  private readonly listeners = new Set<Listener<T>>();
  private readonly observers = new Set<ReactiveObserver>();

  constructor(private value: T) {}

  asReadonly(): ReadonlySignal<T> {
    return {
      get: () => this.get(),
      subscribe: (listener) => this.subscribe(listener),
    };
  }

  get(): T {
    trackDependency(this);

    return this.value;
  }

  set(next: T): void {
    if (Object.is(this.value, next)) {
      return;
    }

    const previous = this.value;

    this.value = next;

    for (const observer of Array.from(this.observers)) {
      observer.onDependencyChanged();
    }

    for (const listener of Array.from(this.listeners)) {
      listener(this.value, previous);
    }
  }

  subscribe(listener: Listener<T>): Disposable {
    this.listeners.add(listener);

    return {
      dispose: () => {
        this.listeners.delete(listener);
      },
    };
  }

  subscribeObserver(observer: ReactiveObserver): void {
    this.observers.add(observer);
  }

  unsubscribeObserver(observer: ReactiveObserver): void {
    this.observers.delete(observer);
  }

  update(updater: (current: T) => T): void {
    this.set(updater(this.value));
  }
}

class ComputedState<T> implements ReadonlySignal<T>, ReactiveObserver, ReactiveSource {
  private readonly dependencies = new Set<ReactiveSource>();
  private readonly listeners = new Set<Listener<T>>();
  private readonly observers = new Set<ReactiveObserver>();
  private dirty = true;
  private initialized = false;
  private value!: T;

  constructor(private readonly read: () => T) {}

  addDependency(source: ReactiveSource): void {
    this.dependencies.add(source);
  }

  get(): T {
    trackDependency(this);

    if (this.dirty || !this.initialized) {
      this.recompute(false);
    }

    return this.value;
  }

  onDependencyChanged(): void {
    if (!this.initialized) {
      this.dirty = true;

      return;
    }

    const previous = this.value;

    this.recompute(true);

    if (!Object.is(previous, this.value)) {
      for (const observer of Array.from(this.observers)) {
        observer.onDependencyChanged();
      }
    }
  }

  subscribe(listener: Listener<T>): Disposable {
    if (this.dirty || !this.initialized) {
      this.recompute(false);
    }

    this.listeners.add(listener);

    return {
      dispose: () => {
        this.listeners.delete(listener);
      },
    };
  }

  subscribeObserver(observer: ReactiveObserver): void {
    this.observers.add(observer);
  }

  unsubscribeObserver(observer: ReactiveObserver): void {
    this.observers.delete(observer);
  }

  private recompute(notifyListeners: boolean): void {
    const previous = this.value;

    clearDependencies(this.dependencies, this);
    this.value = withActiveObserver(this, () => this.read());
    this.dirty = false;

    if (notifyListeners && this.initialized && !Object.is(previous, this.value)) {
      for (const listener of Array.from(this.listeners)) {
        listener(this.value, previous);
      }
    }

    this.initialized = true;
  }
}

class EffectState implements Disposable, ReactiveObserver {
  private cleanup: EffectCleanup = undefined;
  private readonly dependencies = new Set<ReactiveSource>();
  private disposed = false;

  constructor(private readonly run: EffectRunner) {
    this.execute();
  }

  addDependency(source: ReactiveSource): void {
    this.dependencies.add(source);
  }

  dispose(): void {
    if (this.disposed) {
      return;
    }

    this.disposed = true;

    clearDependencies(this.dependencies, this);
    disposeCleanup(this.cleanup);
  }

  onDependencyChanged(): void {
    this.execute();
  }

  private execute(): void {
    if (this.disposed) {
      return;
    }

    clearDependencies(this.dependencies, this);
    disposeCleanup(this.cleanup);
    this.cleanup = withActiveObserver(this, () => this.run());
  }
}

function clearDependencies(dependencies: Set<ReactiveSource>, observer: ReactiveObserver): void {
  for (const dependency of dependencies) {
    dependency.unsubscribeObserver(observer);
  }

  dependencies.clear();
}

function disposeCleanup(cleanup: EffectCleanup): void {
  if (!cleanup) {
    return;
  }

  if (typeof cleanup === 'function') {
    cleanup();

    return;
  }

  cleanup.dispose();
}

function trackDependency(source: ReactiveSource): void {
  if (!activeObserver) {
    return;
  }

  source.subscribeObserver(activeObserver);
  activeObserver.addDependency(source);
}

function withActiveObserver<T>(observer: ReactiveObserver, run: () => T): T {
  const previousObserver = activeObserver;

  activeObserver = observer;

  try {
    return run();
  } finally {
    activeObserver = previousObserver;
  }
}

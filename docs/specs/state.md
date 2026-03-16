# State Spec

## Goal

Provide lightweight reactive primitives for application, scene, and component state.

## Core primitives

pixora MVP includes:

- `signal<T>(initialValue)`
- `computed<T>(read)`
- `effect(run)`
- `createStore<State>(initialState)`

## Signal contract

```ts
type Disposable = {
  dispose(): void;
};

type ReadonlySignal<T> = {
  get(): T;
  subscribe(listener: (value: T, previous: T) => void): Disposable;
};

type Signal<T> = {
  get(): T;
  set(next: T): void;
  update(updater: (current: T) => T): void;
  subscribe(listener: (value: T, previous: T) => void): Disposable;
  asReadonly(): ReadonlySignal<T>;
};
```

## Store contract

```ts
type Store<State> = {
  get(): State;
  set(next: State): void;
  patch(patch: Partial<State>): void;
  select<T>(selector: (state: State) => T): ReadonlySignal<T>;
  subscribe(listener: (value: State, previous: State) => void): Disposable;
};
```

## Behavior rules

- writes are synchronous;
- reads return the latest committed snapshot;
- computed values are memoized and recomputed when dirty;
- effects re-run when tracked dependencies change;
- all subscriptions return disposables.

## Factory direction

`signal`, `computed`, `effect`, and `createStore` are exported as top-level factories from `pixora`.

## Scope rules

- app-level stores live in services or app context;
- scene-level stores live inside scenes or scene-owned services;
- component-level state should stay local unless shared behavior requires elevation.

## Cleanup rules

- effects and subscriptions created by scenes must be disposed on scene destroy;
- effects and subscriptions created by components must be disposed on node destroy;
- computed values should release dependencies when no longer referenced.

## Usage guidance

- use stores for persistent structured state;
- use signals for focused mutable values;
- use computed values for derived read models;
- use the event bus for transient events, not as a replacement for persistent state.

## MVP deliverables

- synchronous reads;
- reactive subscriptions;
- derived selectors;
- predictable cleanup;
- enough ergonomics to power menu state, HUD state, and viewport state.

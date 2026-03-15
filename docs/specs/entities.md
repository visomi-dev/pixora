# Entities Spec

## Goal

Provide a lightweight gameplay-facing abstraction without committing to a full ECS.

## Responsibilities

- combine a root visual node with local state and behavior;
- support update participation when needed;
- integrate with events, layout, and animation helpers;
- keep gameplay objects organized in scenes.

## Entity model

```ts
type EntityOptions<State> = {
  id: string;
  node: BaseNode;
  initialState: State;
};

abstract class Entity<State = unknown> {
  readonly id: string;
  readonly node: BaseNode;

  getState(): State;
  setState(next: State): void;
  update(deltaMs: number): void {}
  destroy(): void {}
}
```

## Rules

- entities are optional and scene-owned;
- entities do not replace scenes or services;
- entity state should stay local unless the rest of the app needs to observe it;
- entities clean up their own bindings and listeners on destroy.

## MVP deliverables

- one or more stateful gameplay objects in the example scene;
- clear ownership of visual node plus logic;
- compatibility with event bus and animation helpers.

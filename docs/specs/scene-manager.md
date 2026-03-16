# Scene Manager Spec

## Goal

Provide predictable scene registration, switching, overlays, and lifecycle management.

## Responsibilities

- register scene definitions by key;
- create scene instances lazily;
- activate and deactivate scenes;
- manage overlay stack order;
- forward `update` and `resize` lifecycle calls;
- destroy scenes when requested.

## Scene definition

```ts
type SceneKey = string;
type ScenePayload = unknown;

type SceneDefinition = {
  key: SceneKey;
  create: () => Scene;
  cache?: boolean;
  kind?: 'scene' | 'overlay';
};
```

## Base scene contract

```ts
abstract class Scene {
  readonly key: SceneKey;
  readonly root: Container;

  init(context: ApplicationContext, payload?: ScenePayload): void | Promise<void> {}
  mount(): void {}
  activate(payload?: ScenePayload): void {}
  deactivate(): void {}
  update(deltaMs: number): void {}
  resize(viewport: Viewport): void {}
  destroy(): void {}
}
```

## Manager API

The manager must support:

- `register(definition)`
- `registerMany(definitions)`
- `goTo(key, payload?)`
- `showOverlay(key, payload?)`
- `hideOverlay(key?)`
- `getActiveScene()`
- `getOverlayStack()`
- `update(deltaMs)`
- `resize(viewport)`
- `destroy()`

## Caching policy

- scenes may opt into caching through `cache: true`;
- cached scenes stay in memory after deactivation;
- non-cached scenes are destroyed after exit;
- overlays default to non-cached unless explicitly configured.

## Lifecycle guarantees

- `init` runs once per instance;
- `mount` runs once per instance after root creation;
- `activate` runs every time the scene becomes active;
- `deactivate` runs every time the scene loses active status;
- `resize` runs after mount and on every viewport change;
- `destroy` runs once per instance.

## Overlay rules

- overlays mount above the active base scene;
- the top-most overlay receives input by default;
- the base scene may pause updates while an overlay is open if configured;
- closing the last overlay restores the base scene as the active interactive layer.

## MVP deliverables

- switch between at least two scenes;
- show and hide a pause overlay;
- call lifecycle hooks in deterministic order;
- clean up destroyed scene instances.

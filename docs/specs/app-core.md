# App Core Spec

## Goal

Provide the bootstrap layer that creates the Pixi application, shared runtime context, and initial scene flow.

## Responsibilities

- create and own the Pixi application instance;
- mount the canvas into a host element;
- create the shared application context;
- initialize the service registry, event bus, asset registry, animation manager, and scene manager;
- start and stop the ticker;
- wire resize handling and viewport updates;
- activate the initial scene.

## Non-responsibilities

- scene-specific business logic;
- gameplay systems;
- content authoring;
- advanced asset pipeline behavior.

## Conceptual API

```ts
type pixoraAppOptions = {
  mount: HTMLElement;
  width?: number;
  height?: number;
  backgroundColor?: number;
  autoStart?: boolean;
  scenes: SceneDefinition[];
  initialScene: SceneKey;
  services?: ServiceDescriptor[];
  assets?: AssetManifest;
};

type Viewport = {
  width: number;
  height: number;
  aspectRatio: number;
  orientation: 'portrait' | 'landscape';
};

type pixoraApp = {
  context: ApplicationContext;
  start(): Promise<void>;
  destroy(): Promise<void>;
};

declare function createpixoraApp(options: pixoraAppOptions): Promise<pixoraApp>;
```

## Application context

The shared context must expose:

- Pixi application instance;
- viewport readonly signal;
- scene manager;
- event bus;
- asset registry;
- service registry;
- animation manager;
- ticker access;
- app destroy signal or equivalent state.

## Startup sequence

1. validate options;
2. create core runtime services;
3. register consumer services;
4. mount renderer;
5. preload required app-level assets if declared;
6. start ticker if configured;
7. activate initial scene.

## Resize model

- viewport changes must update a single shared source of truth;
- scene manager receives the new viewport;
- layout recalculation is triggered through scene and node invalidation.

## Error rules

The app core must throw descriptive errors for:

- missing mount element;
- duplicate scene keys;
- missing initial scene;
- duplicate service tokens;
- unresolved required asset keys.

## MVP deliverables

- host mount and destroy work correctly;
- initial scene activation works;
- resize wiring works;
- ticker starts and stops correctly;
- custom services are available through context.

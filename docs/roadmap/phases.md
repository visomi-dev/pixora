# Development Phases

## Phase 0 - Definitions

Outputs:

- glossary;
- architecture docs;
- ADRs;
- module specs;
- roadmap docs.

Exit criteria:

- open technical decisions are closed for MVP;
- implementation order is clear.

## Phase 1 - Package Foundation

Outputs:

- `pixi.js` added to the library package;
- internal folder structure created in `libs/pixora/src/`;
- root public API scaffolded;
- placeholder Nx scaffold code removed.

Exit criteria:

- the library builds with the new structure;
- the space-invaders game can import from `pixora`.

## Phase 2 - App Core

Outputs:

- `createpixoraApp`;
- application context;
- viewport manager;
- service registry;
- ticker wiring.

Exit criteria:

- app boot and destroy work;
- resize state updates correctly.

## Phase 3 - Scene Runtime

Outputs:

- base `Scene` class;
- scene manager;
- overlay support;
- lifecycle orchestration;
- cleanup behavior.

Exit criteria:

- two scenes and one overlay can run end-to-end.

## Phase 4 - Reactive Core

Outputs:

- signals;
- computed values;
- effects;
- stores;
- typed event bus.

Exit criteria:

- scene and UI state can drive rendering reactively.

## Phase 5 - UI Foundation

Outputs:

- base nodes and components;
- built-in UI primitives;
- pointer input abstraction.

Exit criteria:

- reusable button and panel components exist.

## Phase 6 - Layout Engine

Outputs:

- fixed layout;
- anchor layout;
- stack layout;
- breakpoint support.

Exit criteria:

- menu and HUD layouts adapt across viewport sizes.

## Phase 7 - Gameplay Support

Outputs:

- asset registry;
- tween helpers;
- minimal entity abstraction;
- gameplay-facing helpers.

Exit criteria:

- the gameplay scene can render a stateful entity and HUD.

## Phase 8 - Space Invaders Game

Outputs:

- main menu scene;
- gameplay scene with enemies, power-ups, and combo system;
- game over and victory screens;
- game-specific assets and services.

Exit criteria:

- the space-invaders game demonstrates the full MVP scope.

## Phase 9 - Hardening

Outputs:

- additional tests;
- README and usage docs;
- API cleanup;
- publishability checks.

Exit criteria:

- lint, test, typecheck, and build are green for both projects.

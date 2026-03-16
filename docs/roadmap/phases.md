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

## Phase 10 — Declarative Runtime Foundation

Outputs:

* `pixora()` as the new primary application entry point;
* declarative application runtime;
* `PixoraNode` definition;
* host tree model decoupled from Pixi display objects;
* children normalization;
* initial renderer for mounting declarative trees;
* initial compatibility layer with the existing imperative API.

Exit criteria:

* an app can be created with `pixora(...)`;
* a full declarative tree can be rendered;
* the runtime can translate declarative nodes into mounted instances;
* the current foundation remains functional in hybrid mode.

## Phase 11 — Reconciliation and Tree Diff

Outputs:

* diff algorithm based on type, key, and position;
* props patching;
* subtree insertion, replacement, and removal;
* separation between node definition and mounted instance;
* stable node identity strategy;
* incremental update strategy.

Exit criteria:

* tree changes do not force a full remount;
* the runtime can update only the affected nodes;
* mount, replace, and unmount behave predictably;
* the renderer operates with real reconciliation, not only initial render.

## Phase 12 — Automated Lifecycle Runtime

Outputs:

* formalized runtime lifecycle;
* internal phases for:

  * create;
  * mount;
  * update;
  * layout;
  * destroy;
* automatic lifecycle orchestration;
* invalidation flags for visual updates and layout updates;
* automatic cleanup for nodes and resources;
* internal integration hooks with the scene runtime.

Exit criteria:

* the user no longer needs to manually call `mount`, `render`, `update`, or `layout update` in normal flows;
* nodes update automatically when props or state change;
* lifecycle execution order is consistent;
* mount and destroy are centralized in the runtime.

## Phase 13 — Scheduler and Invalidation System

Outputs:

* internal scheduler per tick/frame;
* update batching;
* invalidation queue;
* separation between visual invalidation and layout invalidation;
* post-update queue;
* protection against duplicated work;
* foundation for future optimizations.

Exit criteria:

* multiple changes in the same cycle are grouped correctly;
* layout is not recalculated unnecessarily;
* the runtime avoids redundant renders;
* update cost for medium-sized trees is stable and predictable.

## Phase 14 — Public API Expansion

Outputs:

* functional public API based on namespaces:

  * `pixora()`;
  * `pixora.layout()`;
  * `pixora.container()`;
  * `pixora.sprite()`;
  * `pixora.text()`;
  * `pixora.button()`;
  * `pixora.assets()`;
* strongly typed factories per component;
* consistent public contracts for props and children;
* adapters for coexistence with existing class-based APIs;
* clean and stable public surface.

Exit criteria:

* most UI can be built without manually instantiating classes;
* the public API is consistent, typed, and easy to discover;
* the library supports declarative and imperative modes without duplicating core logic;
* the official direction of the framework is clearly defined.

## Phase 15 — Functional Components

Outputs:

* support for function-defined components;
* recursive component tree resolution;
* normalized props and children passing;
* distinction between host nodes and functional components;
* reusable component composition;
* clear render and update boundaries.

Exit criteria:

* functional components can be built on top of pixora primitives;
* components can be nested freely;
* prop updates rerender only the necessary subtree;
* the composition model is robust enough for real applications.

## Phase 16 — Signal-Driven Component Reactivity

Outputs:

* formal integration between components and signals;
* reactive dependency tracking per subtree;
* selective rerendering when consumed signals change;
* computed bindings for UI;
* effects bound to the runtime lifecycle;
* removal of manual wiring for component refresh.

Exit criteria:

* functional components update automatically when consumed signals change;
* a React-style hooks model is not required to achieve reactivity;
* the framework feels aligned with an Angular + signals philosophy;
* rerendering remains localized and predictable.

## Phase 17 — Layout Runtime 2.0

Outputs:

* full integration of the layout engine with the scheduler;
* automatic layout invalidation;
* formal measurement and distribution rules;
* extended support for:

  * fixed;
  * auto;
  * fill;
  * content;
  * percent;
* stack layout improvements;
* foundation for future grid layout support;
* controlled size-change propagation.

Exit criteria:

* layout no longer depends on manual calls;
* content or constraint changes recalculate layout correctly;
* complex scenes and UI trees maintain consistent responsive behavior;
* the engine is ready for more advanced primitives.

## Phase 18 — Asset Context and Shared Cache

Outputs:

* `pixora.assets()` integrated into the app context;
* per-context asset registry;
* optional shared cache across apps/scenes;
* formal load, preload, and lookup pipeline;
* support for asset states:

  * idle;
  * loading;
  * loaded;
  * error;
* declarative integration with sprite/image/button skins/fonts.

Exit criteria:

* assets are no longer managed as isolated utilities;
* each app can own its own resource context;
* efficient reuse exists through shared caching;
* visual components can depend on assets in a declarative and predictable way.

## Phase 19 — Interaction and Event Runtime

Outputs:

* interaction system integrated into the declarative tree;
* formal pointer event dispatch;
* consistent hit testing;
* standard interactive states:

  * idle;
  * hover;
  * pressed;
  * disabled;
* declarative event bindings;
* integration with a typed event bus;
* uniform behavior for buttons and interactive components.

Exit criteria:

* events no longer require ad hoc manual wiring;
* `pixora.button()` uses the standard framework pipeline;
* interactive components share the same input model;
* interaction remains decoupled while still cohesive with runtime and state.

## Phase 20 — Developer Experience and Framework Hardening

Outputs:

* runtime warnings for invalid props and unsafe patterns;
* debug helpers for the node tree;
* basic runtime inspector;
* extended test coverage for:

  * reconciliation;
  * lifecycle;
  * scheduler;
  * signals integration;
  * layout invalidation;
  * assets;
  * interaction;
* v2 architecture documentation;
* migration guide from v1 APIs;
* official examples using the new declarative model.

Exit criteria:

* the framework can evolve without degrading maintainability;
* the new systems are covered by tests;
* the architecture is documented and explained;
* pixora is ready to serve as a serious foundation for Catfé Express and future games.

# Recommended Implementation Order

## Track A — Runtime Core

* Phase 10 — Declarative Runtime Foundation
* Phase 11 — Reconciliation and Tree Diff
* Phase 12 — Automated Lifecycle Runtime
* Phase 13 — Scheduler and Invalidation System

## Track B — Public Declarative Model

* Phase 14 — Public API Expansion
* Phase 15 — Functional Components
* Phase 16 — Signal-Driven Component Reactivity

## Track C — Framework Systems

* Phase 17 — Layout Runtime 2.0
* Phase 18 — Asset Context and Shared Cache
* Phase 19 — Interaction and Event Runtime

## Track D — Stability

* Phase 20 — Developer Experience and Framework Hardening

# Architectural Direction

* hybrid framework model;
* declarative API as the primary developer experience;
* imperative APIs preserved as escape hatches;
* tree diff based runtime;
* reconciliation instead of full remounts;
* mostly internal lifecycle;
* signals-first reactivity model inspired by Angular;
* app-scoped asset registry with optional shared cache.

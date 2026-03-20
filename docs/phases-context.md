# Implementation Context

This document captures the full architectural context after completing each phases. It serves as the entry point for the next phases.

---

## Phases 1-9 Summary — Imperative Framework Core

Before the declarative runtime (Phases 10-20), the framework was built as an imperative system with reactive primitives:

### Phase 1-2 — Foundation

- `pixi.js` added as dependency
- Internal folder structure created
- `createPixoraApp` application bootstrapper
- Application context, viewport manager, service registry
- Ticker wiring

### Phase 3 — Scene Runtime

- Base `Scene` class
- Scene manager with lifecycle orchestration
- Overlay support
- Cleanup behavior

### Phase 4 — Reactive Core

- Signals: `signal()`, `computed()`, `effect()`, `createStore()`
- Typed event bus
- Push-based reactive propagation

### Phase 5 — UI Foundation

- Base nodes and components
- Built-in UI primitives: `ContainerNode`, `SpriteNode`, `TextNode`, `Box`, `Button`
- Pointer input abstraction via `bindInteractive()`

### Phase 6 — Layout Engine

- Fixed layout
- Anchor layout
- Stack layout
- Breakpoint support

### Phase 7 — Gameplay Support

- Asset registry
- Tween helpers
- Entity abstraction

### Phase 8-9 — Space Invaders & Hardening

- Main menu, gameplay, game over scenes
- Tests, documentation, API cleanup

These phases established the imperative foundation that the declarative runtime (Phases 10-20) builds upon.

---

## What Was Built (Phase 10)

Phase 10 introduced a **declarative layer** on top of the existing imperative framework. The core additions are:

1. **`PixoraNode`** — a plain frozen object that describes what the scene graph should look like.
2. **Host type registry** — maps `HostType` strings to factory/patch functions backed by existing imperative classes.
3. **Children normalization** — flattens arrays, wraps strings/numbers as text nodes, filters falsy values.
4. **`MountedNode` / `MountedTree`** — the mounted instance tree that links definitions to live Pixi display objects.
5. **Renderer** — `mountTree()` and `unmountTree()` for initial mount and teardown.
6. **`pixora()` entry point** — new declarative app bootstrapper that delegates to `createPixoraApp` internally.
7. **`imperative()` bridge** — escape hatch for embedding existing `BaseNode` instances in declarative trees.
8. **Node factory helpers** — `container()`, `text()`, `sprite()`, `box()`, `button()`, `keyedContainer()`.

Phase 10 covers **initial mount only**. There is no reconciliation, no reactive re-rendering, no scheduler, and no automatic lifecycle beyond what the existing scene manager provides.

---

## Repository Structure

### Workspace Layout

```
pixora/
  apps/
    space-invaders/        # Showcase game (vanilla TS, fully imperative, uses pixora)
    docs/                  # Hugo documentation site
  libs/
    pixora/                # Core framework library (publishable, ES module)
      src/
        index.ts           # Public API barrel (85 lines, all named exports)
        app/               # Application bootstrapping
        scenes/            # Scene manager and abstract Scene class
        state/             # Reactive primitives (signal, computed, effect, store)
        events/            # Typed event bus
        components/        # Imperative UI component hierarchy
        layout/            # Layout engine (fixed, anchor, stack, breakpoints)
        input/             # Keyboard + pointer interaction
        animation/         # Tween helpers
        assets/            # Asset registry
        services/          # Token-based DI container
        entities/          # Entity = id + BaseNode + reactive state
        utils/             # Disposable interface
        runtime/           # NEW — Declarative runtime (Phase 10)
  docs/                    # Phase 0 definition set (PRD, specs, ADRs, roadmap)
```

### Runtime Module Files

```
libs/pixora/src/runtime/
  types.ts               # PixoraNode, HostType, props maps, IMPERATIVE_MARKER, isPixoraNode
  host-types.ts          # HostTypeRegistry with create/patch per host type, applyCommonProps
  normalize.ts           # normalizeChildren — flatten, wrap, filter
  mounted-node.ts        # MountedNode and MountedTree types
  renderer.ts            # mountTree, unmountTree
  pixora.ts              # pixora() entry point, DeclarativeSceneAdapter
  compat.ts              # imperative() bridge
  create-node.ts         # Factory helpers: container, keyedContainer, text, sprite, box, button

  types.spec.ts          #  7 tests
  normalize.spec.ts      #  9 tests
  create-node.spec.ts    # 13 tests
  compat.spec.ts         #  5 tests
  host-types.spec.ts     # 13 tests
  renderer.spec.ts       # 13 tests
```

---

## Architectural Layers After Phase 10

```
Layer 4 — Content
  Art, textures, spritesheets, sounds

Layer 3 — Game Domain
  Game rules, entities, HUD, services, systems
  Example: space-invaders game

Layer 2b — Declarative Runtime (NEW)
  PixoraNode definitions → MountedNode tree → Pixi display objects
  pixora() entry point, node factories, renderer, compatibility bridge

Layer 2a — Imperative Framework Core
  createPixoraApp, Scene, SceneManager, BaseNode, BaseComponent,
  signals, events, layout, input, animation, assets, services

Layer 1 — Renderer
  PixiJS (sprites, containers, text, rendering loop)
```

Layer 2b sits on top of Layer 2a. The declarative runtime creates imperative instances under the hood. Both layers are fully functional and can be used independently.

---

## Key Types and Their Relationships

### PixoraNode (definition)

```ts
type HostType = 'box' | 'button' | 'container' | 'sprite' | 'text';

type PixoraNode<T extends HostType = HostType> = {
  readonly children: PixoraChildren;
  readonly key?: string | number;
  readonly props: HostPropsMap[T] | ImperativeNodeProps;
  readonly type: T | typeof IMPERATIVE_MARKER;
};
```

- Plain frozen object, no class, no prototype methods.
- `key` is for stable identity during reconciliation (Phase 11).
- `type` is either a `HostType` string or the `IMPERATIVE_MARKER` symbol.
- `children` is `readonly PixoraChild[]` where `PixoraChild` can be a `PixoraNode`, string, number, boolean, null, undefined, or nested array.

### HostPropsMap

```ts
type ContainerNodeProps = { x?; y?; alpha?; visible?; scale? };
type TextNodeProps = ContainerNodeProps & { text; style? };
type SpriteNodeProps = ContainerNodeProps & { texture? };
type BoxNodeProps = ContainerNodeProps & { width?; height?; backgroundColor?; radius? };
type ButtonNodeProps = ContainerNodeProps & { label; width?; height?; backgroundColor?; radius?; disabled?; onPress? };
```

Every host type's props extend `ContainerNodeProps` because every host node wraps a pixi `Container`.

### MountedNode (instance)

```ts
type MountedNode = {
  definition: PixoraNode; // mutable — reconciliation swaps it after patching
  readonly hostNode: BaseNode; // readonly — created once, reused across updates
  readonly children: MountedNode[]; // mutable array — reconciliation splices into it
  parent: MountedNode | null; // bidirectional link for upward traversal
  readonly isImperative: boolean; // true if created via imperative() bridge
};
```

### MountedTree

```ts
type MountedTree = {
  readonly context: ApplicationContext;
  readonly root: MountedNode;
};
```

### HostTypeRegistry

```ts
type HostTypeDescriptor<T extends HostType> = {
  create(props: HostPropsMap[T]): BaseNode;
  patch(node: BaseNode, previous: HostPropsMap[T], next: HostPropsMap[T]): void;
};

type HostTypeRegistry = { readonly [K in HostType]: HostTypeDescriptor<K> };
```

The registry maps each `HostType` to its imperative counterpart:

| HostType      | Imperative Class | pixi DisplayObject                          |
| ------------- | ---------------- | ------------------------------------------- |
| `'container'` | `ContainerNode`  | `Container`                                 |
| `'text'`      | `TextNode`       | `Text`                                      |
| `'sprite'`    | `SpriteNode`     | `Sprite`                                    |
| `'box'`       | `Box`            | `Container` (with `Graphics` child)         |
| `'button'`    | `Button`         | `Container` (composite: `Box` + `TextNode`) |

The `patch` function is defined but only used meaningfully in Phase 11.

---

## How the Declarative Runtime Works (Phase 10)

### Mount Flow

```
pixora(options)
  └── createPixoraApp(converted options)
        └── SceneManager.goTo(initialScene)
              └── DeclarativeSceneAdapter.mount()
                    ├── renderFn(context) → PixoraNode tree
                    └── mountTree(tree, scene.root, context)
                          └── mountNode(definition, parent, registry)  [recursive]
                                ├── registry[type].create(props) → BaseNode
                                ├── applyCommonProps(displayObject, props)
                                ├── normalizeChildren(definition.children)
                                └── for each child: mountNode → addChild
```

### Unmount Flow

```
DeclarativeSceneAdapter.destroy()
  └── unmountTree(tree)
        ├── remove root displayObject from parent container
        └── unmountNode(root)  [recursive]
              ├── unmountNode(child) for each child
              ├── clear children array
              └── if imperative: detach only
                  else: hostNode.destroy()
```

### DeclarativeSceneAdapter

The `pixora()` function converts each `DeclarativeScene` into a `SceneDefinition` whose `create()` returns a `DeclarativeSceneAdapter`. This adapter extends the existing `Scene` class:

- `mount()` — calls the scene's `render(context)` function to get a `PixoraNode` tree, then mounts it via `mountTree()`.
- `destroy()` — calls `unmountTree()` to tear down the mounted tree.
- All other lifecycle hooks (`init`, `activate`, `deactivate`, `update`, `resize`) are inherited from `Scene` with their default no-op behavior.

The scene manager sees the adapter as a regular scene. Ticker, viewport, services, events, and assets all work unchanged.

---

## Imperative Foundation (Unchanged)

### Application Context

```ts
type ApplicationContext = {
  app: Application; // pixi.js Application instance
  assets: AssetRegistry;
  events: EventBus<Record<string, unknown>>;
  mount: HTMLElement;
  scenes: SceneManager;
  services: ServiceRegistry;
  viewport: ReadonlySignal<Viewport>;
};
```

Flows through the entire system. Every scene, service, and (in the declarative model) every render function has access to it.

### Component Hierarchy

```
BaseNode<Container>              — wraps pixi Container, manages children + disposables
  ├── ContainerNode              — convenience wrapper (new Container())
  ├── SpriteNode                 — wraps Sprite + Texture
  └── BaseComponent<Props>       — adds props system (getProps, updateProps, onPropsChanged)
        ├── TextNode             — wraps Text, syncs text on prop change
        ├── Box                  — Graphics-backed rectangle
        └── InteractiveComponent — adds pointer interaction (hover, press, disabled)
              └── Button         — composite: Box background + TextNode label + interaction
```

Key characteristics:

- `BaseNode.addChild()` / `removeChild()` syncs both the logical children set and the pixi display tree.
- `BaseNode.destroy()` cascades to all children and disposes all disposables.
- `BaseComponent.updateProps()` does a shallow merge then calls `onPropsChanged()` synchronously.
- There is **no diffing, no scheduler, no batching** at this level.

### Reactive System

```ts
signal(initialValue)           → Signal<T>          // mutable reactive cell
computed(read)                 → ReadonlySignal<T>   // derived value, auto-dependency tracking
effect(run)                    → Disposable           // side-effect, re-runs on dependency change
createStore(initialState)      → Store<State>         // object-level state with patch() and select()
```

Key characteristics:

- **Synchronous propagation** — no microtask batching, no scheduler. Changes propagate immediately.
- **Push-based** — signals push to observers (computeds/effects) on `set()`.
- **Automatic dependency tracking** via a global `activeObserver` pattern.
- **Dynamic dependencies** — cleared and re-tracked on each evaluation.
- The reactive system is **disconnected from the component tree**. Signals don't automatically update the visual tree. Developers must manually wire effects to call `updateProps()` or modify display objects.

### Scene Lifecycle

```ts
abstract class Scene {
  abstract readonly key: SceneKey;
  readonly root = new Container();

  init(context, payload?); // once — async setup
  mount(); // once — build scene graph
  activate(payload?); // every time scene becomes active
  deactivate(); // when replaced or overlaid
  update(deltaMs); // every tick while active
  resize(viewport); // on viewport change
  destroy(); // when evicted (non-cached)
}
```

Scene manager orchestrates: `goTo(key)` → deactivate current → init (once) → mount (once) → activate → resize. Overlays stack on top.

---

## Public API Surface (After Phase 10)

### Imperative API (Phases 1-9)

```ts
// App
createPixoraApp(options): Promise<pixoraApp>

// Scenes
Scene, createSceneManager

// State
signal, computed, effect, createStore

// Events
createEventBus

// Components
BaseNode, BaseComponent, InteractiveComponent
ContainerNode, SpriteNode, TextNode, Box, Button

// Layout
applyLayout, layout

// Input
bindInteractive, createKeyboardInput, clearKeyboardFrame, Keys

// Animation
createTransition, createTween

// Assets
createAssetRegistry

// Services
createServiceRegistry, createServiceToken

// Entities
Entity
```

### Declarative API (Phase 10)

```ts
// Entry point
pixora(options): Promise<PixoraRuntime>

// Node factories
container(props?, ...children): PixoraNode<'container'>
keyedContainer(key, props?, ...children): PixoraNode<'container'>
text(props): PixoraNode<'text'>
sprite(props?): PixoraNode<'sprite'>
box(props?, ...children): PixoraNode<'box'>
button(props): PixoraNode<'button'>

// Compatibility
imperative(node, key?): PixoraNode

// Renderer (advanced)
mountTree(definition, parent, context): MountedTree
unmountTree(tree): void

// Type guard
isPixoraNode(value): boolean
```

---

## What Exists vs What Is Missing

### Exists (Phases 1-10)

| Capability              | Status                                                                 |
| ----------------------- | ---------------------------------------------------------------------- |
| App bootstrapping       | `createPixoraApp` (imperative) + `pixora` (declarative)                |
| Scene lifecycle         | Full: init → mount → activate → update → resize → deactivate → destroy |
| Reactive state          | signal, computed, effect, store — synchronous, push-based              |
| Component tree          | BaseNode hierarchy with manual addChild/removeChild                    |
| Declarative definitions | PixoraNode, node factories, children normalization                     |
| Initial mount           | mountTree — recursive, produces MountedNode tree                       |
| Unmount/teardown        | unmountTree — recursive destroy with imperative bridge support         |
| Host type registry      | create + patch for all 5 built-in types                                |
| Imperative escape hatch | imperative() bridge — consumer owns lifecycle                          |
| Layout engine           | fixed, anchor, stack with breakpoints                                  |
| Input                   | Keyboard state + pointer interaction binding                           |
| Events                  | Typed event bus                                                        |
| Services                | Token-based DI container                                               |
| Assets                  | Manifest-based registry with load/lookup                               |
| Animation               | Tween + transition helpers                                             |

### Missing (Phases 11-22)

| Phase  | Capability               | Status                                                                                                                                                       |
| ------ | ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **11** | Reconciliation           | ✅ Completed — tree diffing, props patching, incremental updates implemented                                                                                 |
| **12** | Automated lifecycle      | ✅ Completed — lifecycle phases, invalidation flags, automatic reconcile on update/resize                                                                    |
| **13** | Scheduler                | ✅ Completed — per-frame batching, visual/layout separation, deduplication                                                                                   |
| **14** | Public declarative API   | ✅ Completed — `pixoraApi` namespace with container, text, sprite, box, button, layout helpers                                                               |
| **15** | Functional components    | ✅ Completed — function component support, component registry                                                                                                |
| **16** | Signal-driven reactivity | ✅ Completed — reactive effects for components, automatic re-render on signal change                                                                         |
| **17** | Layout Runtime 2.0       | ✅ Completed — layout integration with scheduler, automatic invalidation, extended sizing modes (auto, fill, percent, content)                               |
| **18** | Asset context            | ✅ Completed — per-context asset registry, asset states (idle, loading, loaded, error), optional shared cache, declarative asset integration                 |
| **19** | Interaction runtime      | ✅ Completed — interaction system integrated with declarative tree, declarative event bindings, standard interactive states (idle, hover, pressed, disabled) |
| **20** | DX hardening             | ✅ Completed — runtime warnings for invalid props, debug helpers for node tree, extended test coverage, validation utilities                                 |
| **21** | Space Invaders Refactor  | ✅ Completed — converted menu scenes to declarative API, hybrid model with imperative game scene                                                             |
| **22** | Recommended API          | ✅ Completed — `pixora.component()` for functional components, `pixora.scene()` for scene definitions, new component-style syntax as recommended usage       |

---

## Design Decisions and Constraints for Future Phases

### Phase 11 — Reconciliation

The `MountedNode` type was designed with reconciliation in mind:

- `definition` is mutable — swap it to the new `PixoraNode` after patching.
- `children` is a mutable array — splice, insert, remove.
- `hostNode` is readonly — reuse the same `BaseNode` instance, patch its props.
- `key` on `PixoraNode` enables stable identity matching.
- `HostTypeDescriptor.patch()` is already implemented for all 5 host types.

The reconciler needs to:

1. Compare old and new `PixoraNode` trees by type, key, and position.
2. Call `descriptor.patch(hostNode, oldProps, newProps)` for changed nodes.
3. Mount new children, unmount removed children.
4. Reorder children when keys change position.

### Phase 12 — Automated Lifecycle

The `DeclarativeSceneAdapter` currently only overrides `mount()` and `destroy()`. To support automatic updates:

- Override `update(deltaMs)` to re-run the render function and reconcile.
- Or, connect to the reactive system so signal changes trigger reconciliation.
- The scene manager already calls `update()` on every tick — this is the natural integration point.

### Phase 13 — Scheduler

The reactive system (`signal.ts`) propagates changes synchronously. A scheduler would:

- Intercept signal change notifications.
- Queue dirty nodes/trees.
- Batch reconciliation to once-per-frame (aligned with the ticker).
- Separate visual invalidation from layout invalidation.

### Phase 15 — Functional Components

`HostType` is currently a closed string union. To support functional components:

- `PixoraNode.type` needs to accept `(props) => PixoraNode` functions.
- The reconciler needs to call these functions and reconcile their output.
- A distinction between "host nodes" (produce BaseNode instances) and "component nodes" (produce more PixoraNode trees) is required.

**Phase 15 Implementation:**

- Extended `PixoraNode.type` to accept `AnyPixoraComponent` function types
- Created `components.ts` with component registry (`registerComponent`, `getComponent`, `resolveComponent`)
- Updated reconciliation to resolve functional components during mount/update
- Components can be registered by name or used directly as functions

### Phase 16 — Signal-Driven Reactivity

The natural approach:

- Wrap the render function in a reactive context (similar to `effect()`).
- When a signal read during render changes, mark the subtree as dirty.
- The scheduler (Phase 13) picks up the dirty subtree and reconciles it.
- This avoids manual wiring and makes the framework feel like Angular signals.

**Phase 16 Implementation:**

Created `reactive.ts` with:

- `createReactiveEffect()` — Creates an effect that re-renders a component when signals change
- `createReactiveSubtreeEffect()` — Creates an effect for mounted component subtrees
- `isSignal()` — Type guard to detect signal values
- `unwrapSignal()` — Utility to extract signal values

Integration with reconciliation:

- Added `reactiveContext?: ReactiveContext` to `MountedNode` type
- During `mountNode()`: if the original type is a functional component and we have a tree context, create a reactive effect
- During `reconcileNode()`: when props change for functional components, re-create the reactive effect with new props
- During `unmountNode()`: dispose the reactive context to clean up effects

Key behavior:

- Functional components automatically re-render when signals they read change
- The existing `effect()` from the signal system provides automatic dependency tracking
- Props changes trigger effect recreation
- Cleanup happens on unmount

### Phase 17 — Layout Runtime 2.0

Full integration of the layout engine with the scheduler:

- Created `layout-runtime.ts` with layout node management
- Integrated layout with scheduler's `runLayout()` method
- Automatic layout invalidation via `markLayoutDirty()` and `markSubtreeLayoutDirty()`
- Layout node caching via WeakMap

Extended sizing modes:

- `auto` — automatic sizing based on content or fill available space
- `fill` — fill available parent space
- `percent` — percentage of parent dimensions
- `content` — natural content size
- Added `SizeMode` type: `'auto' | 'content' | 'fill' | 'fixed' | 'percent'`

New layout types in `layout.ts`:

- `AutoLayoutSpec` — for auto-sizing containers
- `PercentLayoutSpec` — for percentage-based sizing

Updated `apply-layout.ts`:

- Added `applyAuto()` function for auto-sizing
- Added `applyPercent()` function for percentage-based sizing
- Both support breakpoints

Runtime exports:

- `runLayout()` — run layout on a tree
- `setLayoutSpec()` — set layout spec for a node
- `markLayoutDirty()` — mark a node as needing layout
- `markSubtreeLayoutDirty()` — mark entire subtree as needing layout
- `measureNode()` — measure node content size
- `getOrCreateLayoutNode()` — get or create layout node for a host

### Phase 18 — Asset Context and Shared Cache

Created `asset-context.ts` with:

- `AssetState` enum: `'idle' | 'loading' | 'loaded' | 'error'`
- `AssetContext` interface with:
  - `getState(key)` / `state(key)` - get asset state synchronously or as signal
  - `getProgress(key)` - get loading progress
  - `getTexture(key)` - get loaded texture
  - `has(key)` - check if asset is registered
  - `isLoaded(key)` / `isLoading(key)` - state checks
  - `load(key)` - load single asset
  - `loadBundle(name)` - load asset bundle
  - `preload(keys)` - preload multiple assets
  - `register(manifest)` - register assets from manifest
- Optional shared cache via `sharedCache: true` option
- `clearSharedCache()` - clear global shared cache

Declarative asset integration:

- Added `AssetRef<T>` type for asset references
- Added `isAssetRef<T>()` type guard
- Added `asset` property to `SpriteNodeProps` for declarative asset usage

Runtime exports:

- `createAssetContext()` - create new asset context
- `clearSharedCache()` - clear global shared cache
- `AssetState` - asset state enum

### Phase 19 — Interaction and Event Runtime

Created `interaction.ts` with declarative interaction system:

- `bindInteractive(target, config)` - bind interaction handlers to a container
- `getInteractiveState(target)` - get current interaction state
- `isInteractive(target)` - check if target has interactive bindings
- `InteractionState` type: `'disabled' | 'hovered' | 'idle' | 'pressed'`
- Event types: `pointerdown`, `pointerup`, `pointerover`, `pointerout`, `pointertap`
- `PixoraInteractionEvent` - standardized event object with native event access

Declarative event bindings:

- Updated `ButtonNodeProps` to support:
  - `onPointerDown`
  - `onPointerOut`
  - `onPointerOver`
  - `onPointerTap`
  - `onPointerUp`
- Updated button host type descriptor to automatically bind interaction when callbacks provided

Runtime exports:

- `bindInteractive()` - bind interaction to container
- `getInteractiveState()` - get current state
- `isInteractive()` - check if interactive
- `InteractionCallback`, `InteractionEventType`, `InteractiveState`, `PixoraInteractionEvent` types

### Phase 20 — Developer Experience and Framework Hardening

Created `debug.ts` with node tree inspection utilities:

- `inspectNode(node)` - inspect a single mounted node
- `inspectTree(tree)` - inspect entire mounted tree
- `getTreeStats(tree)` - get statistics about the tree (total, host, component, imperative, keyed nodes)
- `formatTree(tree)` - format tree as readable string
- `findNodeByKey(tree, key)` - find node by key
- `findNodesByType(tree, type)` - find all nodes of a specific type
- `DebugNodeInfo` - type for node inspection results
- `DebugTreeStats` - type for tree statistics

Created `warnings.ts` with runtime warning system:

- `WarningCode` enum with codes for different warning types
- `WarningOptions` - warning configuration
- `WarningHandler` - custom warning handler type
- `setWarningHandler()` - set custom warning handler
- `getWarningHandler()` - get current warning handler
- `warn()` - emit a warning
- Helper functions:
  - `warnDeprecated()` - deprecated API usage
  - `warnInvalidChild()` - invalid child node
  - `warnInvalidKey()` - invalid or duplicate key
  - `warnInvalidProp()` - unknown prop for host type
  - `warnMissingRequiredProp()` - missing required prop
  - `warnUnknownHostType()` - unknown host type
- Validation utilities:
  - `validateHostType()` - validate host type
  - `validateKey()` - validate key type
  - `validateProps()` - validate props for host type

---

## Test Coverage

### Phase 10-20 Tests (116 total)

| File                      | Tests | Coverage                                                             |
| ------------------------- | ----- | -------------------------------------------------------------------- |
| `types.spec.ts`           | 7     | `isPixoraNode` type guard                                            |
| `normalize.spec.ts`       | 9     | All normalization rules and edge cases                               |
| `create-node.spec.ts`     | 13    | All factory functions, freezing, key support                         |
| `compat.spec.ts`          | 5     | Imperative bridge, keys, freezing                                    |
| `host-types.spec.ts`      | 13    | Registry creation, all 5 type descriptors, `applyCommonProps`        |
| `renderer.spec.ts`        | 13    | Mount/unmount, nesting, mixed types, common props, imperative bridge |
| `reconcile.spec.ts`       | 13    | Tree diffing, props patching, incremental updates                    |
| `lifecycle.spec.ts`       | 12    | Lifecycle phases, invalidation flags                                 |
| `scheduler.spec.ts`       | 6     | Per-frame batching, deduplication                                    |
| `components.spec.ts`      | 3     | Functional component registration and resolution                     |
| `reactive.spec.ts`        | 6     | Signal detection and unwrapping utilities                            |
| `asset-context.spec.ts`   | 7     | Asset context, states, shared cache                                  |
| `warnings.spec.ts`        | 9     | Runtime warnings system                                              |
| `index.spec.ts` (partial) | 4     | Public API export verification                                       |

### Pre-existing Tests (from Phases 1-9)

| File                            | Tests | Notes                             |
| ------------------------------- | ----- | --------------------------------- |
| `signal.spec.ts`                | 6     | signal, computed, effect, store   |
| `scene-manager.spec.ts`         | 1     | Basic scene lifecycle             |
| `create-event-bus.spec.ts`      | 3     | Event pub/sub                     |
| `create-asset-registry.spec.ts` | 3     | Asset registration and loading    |
| `apply-layout.spec.ts`          | 7     | Fixed, anchor, stack, breakpoints |
| `text-node.spec.ts`             | 2     | 1 passes, 1 pre-existing failure  |
| `button.spec.ts`                | 2     | 1 passes, 1 pre-existing failure  |

The 2 pre-existing failures are in `updateProps` propagation for `TextNode.setText` and `Button` label update. These are bugs in the imperative component layer, not in the declarative runtime.

---

## Phase 21 — Space Invaders Refactor

Converted the space-invaders game to use the declarative runtime:

**Hybrid Model**:

- **Declarative scenes**: `main-menu`, `instructions`, `game-over`, `victory` — use `pixora()` with render functions
- **Imperative scene**: `game` — uses existing `GameScene` class for complex game logic

**Key Changes**:

- Extended `pixora()` to accept both declarative and imperative scene definitions:
  - Declarative: `{ key: 'menu', render: (ctx) => pixora.container(...) }`
  - Imperative: `{ key: 'game', create: () => new GameScene() }`

- Updated `space-invaders.ts` to use the new hybrid approach

**Benefits**:

- Demonstrates best practices: declarative for UI, imperative for complex logic
- Validates that both APIs can coexist in the same application

---

## Phase 22 — Recommended API, Component Syntax, Layout & Text Improvements

Made the declarative API the recommended/default and introduced cleaner component syntax:

### New API Pattern

**Before** (verbose):

```ts
function renderMainMenu(context: ApplicationContext): PixoraNode {
  return pixora.container({ x: 0, y: 0 }, pixora.box({ ... }));
}

{ key: 'main-menu', render: renderMainMenu }
```

**After** (recommended):

```ts
const mainMenu = pixora.component((context) => {
  return pixora.container({ x: 0, y: 0 }, pixora.box({ ... }));
}, 'mainMenu');

pixora.scene(mainMenu)  // Creates scene definition with auto-generated key
```

### New API Functions

Added to `api` namespace:

- `pixora.component(renderFn, name?)` — Wraps a render function as a named component, optionally registers it
- `pixora.scene(component)` — Creates a scene definition from a component

### Button Event Standardization

Changed from `onPress` to `onPointerTap` (and related pointer events) to align with PixiJS conventions:

- `onPointerDown`
- `onPointerUp`
- `onPointerOver`
- `onPointerOut`
- `onPointerTap`

### Flex Layout System

Added a new `flex` layout type to support CSS-like flexbox behavior:

```ts
type FlexLayoutSpec = {
  align?: 'center' | 'end' | 'start' | 'stretch';
  direction: 'horizontal' | 'vertical';
  gap?: number;
  grow?: number; // default grow factor for children
  justify?: 'center' | 'end' | 'space-around' | 'space-between' | 'space-evenly' | 'start';
  padding?: number;
  shrink?: number; // default shrink factor for children
  type: 'flex';
};
```

**Key features:**

- `justify`: Controls main axis distribution (`space-between`, `space-around`, `space-evenly`)
- `align`: Controls cross axis alignment (`stretch`, `center`, `end`, `start`)
- `grow`/`shrink`: CSS-like flex-grow and flex-shrink behavior
- `gap`: Space between children

**Example:**

```ts
pixora.container(
  {
    layout: layout.flex({
      direction: 'vertical',
      justify: 'space-between',
      align: 'center',
      gap: 16,
      padding: 48,
    }),
  },
  pixora.text({ text: 'Title' }),
  pixora.button({ label: 'Start' }),
);
```

### Simplified Text Props

Extended `TextNodeProps` with direct style properties:

```ts
type TextNodeProps = ContainerNodeProps & {
  color?: string; // fill color
  font?: string; // font family
  size?: number; // font size
  style?: Partial<TextStyleOptions>; // full style override
  text: string;
  weight?: string; // font weight
};
```

**Before:**

```ts
pixora.text({
  ...createTextStyle('#00ffaa', 72, '900'),
  text: 'SPACE',
  x: centerX,
  y: titleY,
});
```

**After:**

```ts
pixora.text({
  text: 'SPACE',
  color: '#00ffaa',
  size: 72,
  weight: '900',
  font: 'Orbitron, sans-serif',
  x: centerX,
  y: titleY,
});
```

### Recommended Usage

```ts
import { api as pixora, layout, pixora as createApp } from 'pixora';

// Create components with flex layout
const menu = pixora.component((ctx) => {
  return pixora.container(
    {
      layout: layout.flex({
        direction: 'vertical',
        justify: 'center',
        align: 'center',
        gap: 16,
      }),
    },
    pixora.text({ text: 'Welcome', color: '#ffffff', size: 32 }),
    pixora.button({ label: 'Start', onPointerTap: () => {} }),
  );
}, 'menu');

// Create app with mixed scene types
await createApp({
  scenes: [
    pixora.scene(menu), // Declarative
    { key: 'game', create: () => new GameScene() }, // Imperative
  ],
});
```

---

## Build and Verification Commands

```bash
# Build the library
pnpm nx run pixora:build

# Lint
pnpm nx run pixora:lint

# Run all tests
pnpm vitest run --config libs/pixora/vite.config.mts

# Run only runtime tests
pnpm vitest run --config libs/pixora/vite.config.mts src/runtime/

# Build space-invaders (verifies imperative API intact)
pnpm nx run space-invaders:build
```

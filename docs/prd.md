# PRD — Reactive Framework for 2D Games on PixiJS

## 1. General Information

**Working name:** Pixyn
**Type:** Internal framework / base library
**Target platform:** Mobile and desktop web
**Base stack:** TypeScript + PixiJS
**Paradigm:** Reactive, scene-oriented, component-based, event-driven
**Graphics engine:** PixiJS
**Initial consumer:** Catfé Express

---

## 2. Purpose

Build a lightweight framework for 2D web games that simplifies the development of:

* menus
* HUD/UI
* scenes
* responsive layout
* sprites and entities
* global and local state
* event-based communication
* simple animations and transitions

The framework must solve the problems that PixiJS does not address well on its own, especially:

* screen composition
* responsive positioning
* UI component abstraction
* reactive state management
* scene lifecycle
* orchestration between logic and rendering

---

## 3. Problem Statement

PixiJS works very well as a rendering engine, but it does not provide a complete solution for building a game with a modern application-like structure.

Identified problems:

1. **Complex manual layout**
   Positioning buttons, images, panels, and HUD across multiple screen sizes becomes costly.

2. **Poorly structured scenes**
   Without a custom abstraction layer, menus, overlays, and gameplay become tightly coupled to rendering.

3. **UI is hard to maintain**
   There is no natural “component-like” abstraction without using React or another external UI framework.

4. **Scattered state**
   Game logic, UI, and animations tend to be spread across disconnected objects.

5. **Unclear communication between modules**
   Without an event bus or reactive system, interactions between gameplay, UI, and scenes become fragile.

---

## 4. Vision

Create a technical foundation that combines:

* **PixiJS** for rendering
* **reactivity** for state and events
* **Scene Manager** for navigation and lifecycle
* **Component System** for UI and composition
* **Layout Engine** for responsive behavior
* **Services** for encapsulating reusable logic

The goal is to build screens and gameplay with a clear and maintainable syntax, without depending on React, Angular, or full engines such as Unity/Godot.

---

## 5. Goals

### Primary goals

* Reduce the time required to create new scenes
* Standardize how UI and gameplay are built
* Simplify responsive menu and HUD management
* Clearly separate rendering, state, and logic
* Enable fast iteration for an MVP

### Secondary goals

* Reuse across scenes
* Make logic easier to test independently of rendering
* Prepare a scalable foundation for future features
* Allow assets and logic to evolve without rewriting the structure

---

## 6. Non-goals

This framework does **not** aim to:

* compete with Unity, Godot, or Phaser
* be a physics engine
* include a full visual editor in this phase
* support 3D
* solve multiplayer networking
* be a public general-purpose library from day one
* replace PixiJS as the renderer

---

## 7. Framework Users

### Primary user

You, as the game developer.

### Secondary user

Your wife, indirectly, by benefiting from a clear structure for integrating sprites, assets, and UI.

### Final beneficiary

Catfé Express as the product.

---

## 8. Main Use Cases

1. Create a main menu with background, logo, and responsive buttons
2. Create a gameplay scene with tables, customers, player cat, and HUD
3. Display overlays such as pause, results, or tutorials
4. React to game events to update UI
5. Reposition elements when the screen size changes
6. Manage character and sprite states
7. Orchestrate navigation between scenes without tightly coupling everything

---

## 9. Design Principles

### 9.1 Simple before generic

It must first solve Catfé Express well.

### 9.2 Explicit reactivity

State changes should propagate predictably.

### 9.3 Separation of concerns

* rendering should not contain all logic
* state should not depend on the renderer
* scenes should not contain all business logic inline

### 9.4 Composition over excessive inheritance

Components should be composed with services, stores, and layout nodes.

### 9.5 Mobile-first

Everything should be designed for mobile screens first, then desktop.

### 9.6 Web-friendly

Fast, lightweight, and PWA-compatible.

---

## 10. Functional Requirements

## 10.1 Application Core

The framework must provide:

* game initialization
* integration with `PIXI.Application`
* central service registry
* global lifecycle
* global resize management
* access to shared context

---

## 10.2 Scene Manager

It must allow:

* scene registration
* initial scene loading
* switching between scenes
* destroying or pausing previous scenes
* support for overlays/modals
* lifecycle hooks

### Expected lifecycle

* `init`
* `mount`
* `activate`
* `deactivate`
* `update`
* `resize`
* `destroy`

### Example scenes

* MainMenuScene
* SettingsScene
* GameplayScene
* PauseOverlay
* ResultsScene

---

## 10.3 Component System

There must be an abstraction for building reusable elements.

### Initial component types

* Container
* Sprite
* Text
* Button
* Panel
* Icon
* ProgressBar
* AnimatedSpriteWrapper

### Expected capabilities

* props / initial configuration
* reactive state binding
* interaction events
* layout integration
* local lifecycle
* hierarchical composition

---

## 10.4 Layout Engine

It must resolve element positioning and sizing based on the viewport.

### Minimum needs

* horizontal and vertical alignment
* anchors
* offsets
* padding
* vertical/horizontal stacking
* parent-relative layout
* simple breakpoints
* adaptive scaling
* automatic recalculation on resize

### Use cases it must support

* centering logo and buttons in menu
* placing HUD at the top
* pinning buttons at the bottom
* distributing panels in rows/columns
* adapting UI between portrait mobile and desktop

### Suggested initial strategy

A declarative node-based layout system:

* `fixed`
* `anchor`
* `stack`
* `grid` in a later phase

---

## 10.5 Reactive State

It must provide a clear state solution decoupled from rendering.

### Requirements

* global state
* per-scene state
* local component state
* reactive subscriptions
* predictable updates
* automatic cleanup of listeners/subscriptions

### Valid possible approaches

* RxJS as the foundation
* signals as a lightweight layer
* hybrid Rx + signals store

### Capabilities

* synchronous state reads
* event streams
* effects/reactions
* derived selectors
* current snapshot

---

## 10.6 Event Bus

There must be infrastructure for domain and UI events.

### Examples

* `scene.changed`
* `button.clicked`
* `customer.arrived`
* `order.created`
* `order.served`
* `player.moved`
* `table.stateChanged`

### Requirements

* publish events
* subscribe by type
* TypeScript typing
* decouple producers and consumers
* cleanup support when destroying scene/component

---

## 10.7 Visual Entity System

For gameplay, the framework must facilitate scene entities.

### Typical entities

* tables
* customers
* player
* decorations
* interactive props

### Capabilities

* associated sprite or container
* position and scale
* state
* animations
* event integration
* layout integration when applicable

---

## 10.8 Animations and Transitions

It must include a lightweight layer for:

* simple tweening
* scene transitions
* button feedback
* panel enter/exit
* basic sprite movement

It does not need to be a complex system, but it should expose a clear API.

---

## 10.9 Input

It must simplify:

* click/tap
* pointer over/out/down/up
* disabled button state
* basic component interaction
* forwarding events to the reactive system

---

## 10.10 Asset Management

It should provide a clear integration path for assets.

### Requirements

* texture loading
* centralized access
* key-based registration
* spritesheet support
* fallback/loading state

A complex asset pipeline is not a priority for the first phase.

---

## 11. Non-functional Requirements

### Performance

* maintain smooth performance on modern mobile devices
* avoid unnecessary rerenders
* minimize redundant layout calculations

### Maintainability

* modular architecture
* consistent naming
* strict typing
* clear separation between core and game

### Scalability

* support more scenes and components without rewriting the core

### DX (Developer Experience)

* intuitive API
* low boilerplate
* reasonable debugging
* understandable errors

### Testability

* stores, services, and layout should be testable without real rendering whenever possible

---

## 12. Proposed Architecture

## 12.1 Layers

### Layer 1 — Render

PixiJS

Responsibility:

* draw sprites, text, containers, and visual animations

### Layer 2 — Core Framework

Your reactive framework

Responsibility:

* scenes
* layout
* events
* state
* base components
* core services

### Layer 3 — Game Domain

Catfé Express

Responsibility:

* gameplay rules
* customers
* tables
* orders
* scoring
* progression
* timing

### Layer 4 — Content / Assets

Sprites, sounds, backgrounds, UI art

---

## 12.2 Framework Modules

### `core/app`

Game bootstrap and global context

### `core/scenes`

Scene manager and base scene class

### `core/components`

Reusable base components

### `core/layout`

Declarative layout engine

### `core/state`

Stores, signals, bindings, and effects

### `core/events`

Typed event bus

### `core/input`

Interaction abstractions

### `core/animation`

Tweens and simple transitions

### `core/assets`

Asset registry / loader

### `core/services`

Simple injection or service registry

---

## 13. Expected Conceptual API

This is not final implementation, only the desired direction.

### Example: scene

```ts
class MainMenuScene extends Scene {
  init() {}
  mount() {}
  resize(viewport) {}
  destroy() {}
}
```

### Example: store

```ts
const menuStore = createStore({
  isSettingsOpen: false,
  selectedOption: 'play',
});
```

### Example: component

```ts
const playButton = new Button({
  text: 'Play',
  onClick: () => eventBus.emit('menu.play'),
});
```

### Example: layout

```ts
layout.stackVertical({
  align: 'center',
  gap: 16,
  children: [logo, playButton, settingsButton],
});
```

---

## 14. Framework MVP

The first version must solve only what is necessary to build:

* main menu
* simple gameplay scene
* pause overlay
* minimal HUD

### MVP scope

* App bootstrap
* Basic Scene Manager
* Base components: Container, Text, Sprite, Button, Panel
* Basic layout: anchor + stack
* Basic reactive store
* Typed event bus
* Global resize
* Simple transitions
* Basic asset registry

### Out of MVP scope

* visual editor
* complex animation system
* advanced grid layout
* custom devtools
* physics
* external scripting
* complete scene serialization

---

## 15. Technical User Stories

### US-01

As a developer, I want to register and switch scenes so I can build menus and gameplay without directly coupling them.

### US-02

As a developer, I want reusable components so I do not have to rebuild buttons and panels from scratch in every screen.

### US-03

As a developer, I want a responsive layout system so I can position elements without repeating manual calculations.

### US-04

As a developer, I want a reactive store so UI and gameplay can respond automatically to state changes.

### US-05

As a developer, I want a typed event bus so modules can communicate without circular dependencies.

### US-06

As a developer, I want to encapsulate shared logic in services so I can reuse it across scenes.

---

## 16. Risks

### Risk 1 — Overengineering

Trying to make the engine too generic from the start.

**Mitigation:** build only what Catfé Express needs.

### Risk 2 — Mixing too many paradigms

Using RxJS, signals, ECS, services, and a complex layout system all at once may make it difficult to maintain.

**Mitigation:** choose one main reactive core and keep the rest simple.

### Risk 3 — Overly ambitious layout

Building a CSS-like full layout system would be expensive.

**Mitigation:** start with anchor + stack + offsets.

### Risk 4 — Coupling game logic into the framework

The framework could end up full of Catfé Express-specific rules.

**Mitigation:** separate `core` from `game`.

### Risk 5 — Mobile performance

Observers, layout, and animations could introduce overhead.

**Mitigation:** recompute only on resize or required state changes.

---

## 17. Open Decisions

These decisions still need to be finalized:

1. **Pure RxJS vs pure signals vs hybrid**
2. **Simple services system vs DI container**
3. **Components by composition vs stronger base classes**
4. **Declarative JSON/config layout vs imperative API**
5. **Custom tween system vs lightweight external library**
6. **How to represent gameplay entities**
7. **How much of the framework should remain game-agnostic**

---

## 18. Recommended Initial Technical Direction

To avoid getting stuck, my recommendation would be:

### State

**Signals for simple read/write state**
**Event bus or RxJS only for events/asynchronous flows**

Because:

* signals simplify local/global state
* full RxJS for everything may be too heavy
* a controlled hybrid gives clarity without too much complexity

### Layout

Start only with:

* anchor
* vertical/horizontal stack
* relative width/height
* offsets
* recalculation on resize

### Components

Create lightweight base classes:

* `BaseNode`
* `BaseComponent`
* `InteractiveComponent`

### Scenes

A base `Scene` with:

* root container
* subscription bag
* lifecycle hooks
* access to services and stores

---

## 19. Success Metrics

The framework will be considered successful if it allows you to:

1. Build the main menu without chaotic manual calculations
2. Create new scenes with low boilerplate
3. Reuse buttons, panels, and overlays
4. Adapt to different screen sizes
5. Keep game logic and rendering separate
6. Integrate simple gameplay without rewriting the core
7. Build the Catfé Express MVP faster than with an ad hoc approach

---

## 20. Suggested Roadmap

## Phase 1 — Foundation

* app bootstrap
* game context
* scene manager
* resize manager
* event bus
* services registry

## Phase 2 — Reactive Core

* base store
* bindings
* effects
* automatic cleanup

## Phase 3 — UI Foundation

* container
* sprite
* text
* button
* panel
* anchor/stack layout

## Phase 4 — Gameplay Support

* entity wrapper
* animation helpers
* movement helpers
* HUD integration

## Phase 5 — Hardening

* API refactor
* docs
* tests
* mobile optimization

---

## 21. Suggested Repository Structure

```txt
src/
  core/
    app/
    scenes/
    state/
    events/
    layout/
    components/
    input/
    animation/
    assets/
    services/
    utils/
  game/
    scenes/
    entities/
    ui/
    stores/
    services/
    systems/
  assets/
  main.ts
```

---

## 22. MVP Acceptance Criteria

The framework MVP is considered ready when:

* the app can start and mount an initial scene
* it can navigate between at least 2 scenes
* there is a reusable interactive button
* there is a working basic responsive layout
* there is a working reactive store
* there is a working event bus
* scene cleanup works correctly
* a complete main menu can be built with the framework
* a simple gameplay scene with minimal HUD can be built with the framework

---

## 23. Executive Summary

This framework aims to be an intermediate layer between **PixiJS** and **Catfé Express**, solving the structure, state, UI, and layout problems that Pixi alone does not solve well.

The priority is not to create a universal engine, but rather a clear, reactive, and maintainable foundation that allows the game MVP to be developed quickly and without the unnecessary complexity of traditional web UI frameworks.

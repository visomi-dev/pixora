# pixora — Conversation Context Summary

## Project Overview

**pixora** is a lightweight reactive framework built on top of **PixiJS** to simplify the development of 2D web games.

It was created to solve the architectural gaps of PixiJS when building full applications such as:

- menus
- UI systems
- scenes
- responsive layout
- reactive state
- event-driven gameplay
- simple animation orchestration

pixora is **not a game engine replacement** and **does not attempt to compete with Unity, Godot, or Phaser**.

Instead, it acts as a **structured runtime layer on top of PixiJS**.

Primary use case:

- powering the game **Catfé Express**, a cozy cat café time-management game inspired by Penguin Diner.

However the framework is intentionally **game-agnostic**.

---

# Core Philosophy

pixora follows these architectural principles:

1. **PixiJS handles rendering**
2. **pixora handles application structure**
3. **Reactive state drives rendering**
4. **Scenes organize gameplay**
5. **Components compose UI**
6. **Layout solves responsiveness**
7. **Event-driven architecture decouples systems**

Design goals:

- minimal abstraction
- predictable reactivity
- mobile-first rendering
- composable systems
- low boilerplate

---

# High Level Architecture

pixora architecture is divided into layers:

### Layer 1 — Rendering

Handled by **PixiJS**

Responsibilities:

- sprites
- containers
- text
- rendering loop

---

### Layer 2 — pixora Core Runtime

Responsibilities:

- application lifecycle
- scene orchestration
- reactive state
- layout
- event bus
- UI primitives
- services
- input abstraction
- tween helpers
- asset registry

---

### Layer 3 — Game Domain

Game-specific logic:

- gameplay rules
- entities
- HUD
- services
- systems

Example: Catfé Express gameplay.

---

### Layer 4 — Assets

Sprites, sounds, UI graphics, backgrounds.

---

# Key Systems

## Application Core

Bootstrapped through:

```
createPixoraApp()
```

Responsibilities:

- create Pixi application
- manage viewport
- register services
- wire ticker loop
- provide application context

Core modules:

- application context
- viewport manager
- service registry
- ticker orchestration

---

# Scene System

pixora uses a **Scene Manager architecture**.

Scenes represent major game states such as:

- main menu
- gameplay
- pause
- results

Scenes follow a lifecycle.

Example lifecycle:

```
init
mount
activate
update
resize
deactivate
destroy
```

Features:

- scene stack
- overlay support
- automatic cleanup
- lifecycle orchestration

Overlays allow UI layers like pause menus to run above scenes.

---

# Reactive Core

pixora uses a **reactive architecture** for state updates.

Main primitives:

- signals
- computed values
- effects
- stores
- typed event bus

Signals drive UI and rendering updates.

Example:

```
store -> signal change -> UI updates
```

This avoids manual update propagation.

---

# Event System

pixora includes a **typed event bus** used for decoupled communication.

Examples:

```
scene.changed
button.clicked
customer.arrived
order.served
player.moved
```

This allows gameplay systems, UI, and scenes to communicate without tight coupling.

---

# UI Component System

pixora provides a **component-based UI layer** on top of Pixi.

Base primitives include:

- Node
- Container
- Sprite
- Text
- Button
- Panel

Features:

- hierarchical composition
- pointer input abstraction
- reactive state binding
- reusable UI primitives

---

# Layout Engine

pixora includes a **custom layout system** to solve responsive positioning.

Layouts supported:

- fixed
- anchor
- stack
- breakpoints

Purpose:

- adapt menus and HUD across screen sizes
- simplify positioning logic
- avoid manual coordinate calculations

Example use cases:

- centered menu layouts
- pinned HUD elements
- vertical button stacks

---

# Input System

pixora abstracts pointer interaction:

- click / tap
- hover
- pointer down/up
- disabled states

Input integrates directly with UI components.

---

# Asset System

pixora provides a minimal asset registry.

Responsibilities:

- texture loading
- spritesheet support
- centralized asset access
- asset lookup by key

This avoids scattering asset loading logic.

---

# Animation Helpers

pixora includes lightweight tween utilities.

Use cases:

- button feedback
- UI transitions
- sprite movement
- scene transitions

Not intended to be a full animation engine.

---

# Entity Support

pixora includes a **minimal entity abstraction** for gameplay.

Entities are lightweight objects representing:

- player
- customers
- tables
- props

This is **not a full ECS system**.

The architecture favors:

```
Entities
+ Reactive State
+ Systems/Services
```

instead of a full ECS implementation.

---

# Development Architecture

pixora is structured as a modular framework.

Example repository structure:

```
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

# Development Phases (Completed)

The framework development followed a structured roadmap.

### Phase 0 — Definitions

Architecture groundwork:

- glossary
- architecture documentation
- ADRs
- module specs
- roadmap

---

### Phase 1 — Package Foundation

Library infrastructure:

- PixiJS dependency
- internal folder structure
- public API scaffold
- Nx scaffolding cleanup

---

### Phase 2 — App Core

Core runtime creation:

- `createPixoraApp`
- application context
- viewport manager
- service registry
- ticker integration

---

### Phase 3 — Scene Runtime

Scene orchestration:

- base Scene class
- scene manager
- overlay support
- lifecycle orchestration
- cleanup management

---

### Phase 4 — Reactive Core

Reactive state system:

- signals
- computed
- effects
- stores
- typed event bus

---

### Phase 5 — UI Foundation

UI primitives:

- node and component system
- reusable button
- reusable panel
- pointer input abstraction

---

### Phase 6 — Layout Engine

Responsive layout system:

- fixed layout
- anchor layout
- stack layout
- breakpoint support

Used to power menus and HUD.

---

### Phase 7 — Gameplay Support

Gameplay utilities:

- asset registry
- tween helpers
- minimal entity abstraction
- gameplay helpers

---

### Phase 8 — Example App

Reference implementation:

- main menu scene
- gameplay scene
- pause overlay
- example services and assets

Demonstrates the full MVP architecture.

---

### Phase 9 — Hardening

Stability improvements:

- tests
- documentation
- API cleanup
- publishability checks
- lint / typecheck / build validation

---

# Current Status

pixora has reached **Phase 9 (Hardening)**.

This means the framework currently includes:

- stable runtime architecture
- reactive state layer
- scene system
- component-based UI
- responsive layout engine
- gameplay helpers
- Space Invaders game demo
- documentation and tests

pixora is now ready for:

- integration into the Catfé Express game
- iterative feature development
- potential publishing as a library.

---

# Intended Use

pixora is designed to enable fast development of games like:

- diner dash style games
- management games
- casual mobile games
- UI-heavy games

Especially where:

- scene structure
- reactive UI
- responsive layout

are more important than complex physics or ECS.

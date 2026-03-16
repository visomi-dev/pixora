# Architecture Overview

## Purpose

pixora is an intermediate layer between PixiJS and a game domain.

It exists to provide the structure that PixiJS intentionally does not solve on its own:

- app bootstrap;
- scene orchestration;
- reactive state and typed events;
- reusable UI components;
- responsive layout;
- asset and service access;
- simple animation and input abstractions.

## Workspace mapping

- `libs/pixora` contains the framework runtime and its public API.
- `apps/example` is the integration app that proves the framework can build the MVP flows.
- `docs/` contains the definition set that must be implemented before the framework is considered stable.

## Layer model

### Layer 1 - Renderer

PixiJS is responsible for drawing display objects, textures, text, and low-level interaction surfaces.

### Layer 2 - Framework Core

pixora is responsible for:

- application boot;
- scene lifecycle;
- reactive state;
- event routing;
- layout resolution;
- input abstraction;
- component composition;
- asset and service access;
- simple animation orchestration.

### Layer 3 - Game Domain

The game or demo built on top of pixora is responsible for:

- game rules;
- domain entities;
- user flows;
- balancing and progression;
- scene content;
- content-specific services.

### Layer 4 - Content

Art, textures, spritesheets, sounds, and copy live outside the framework rules but are consumed through framework services.

## Proposed internal module map

The initial implementation inside `libs/pixora/src/` should grow toward this structure:

```txt
src/
  index.ts
  app/
  scenes/
  state/
  events/
  components/
  layout/
  input/
  animation/
  assets/
  services/
  entities/
  utils/
```

The framework should avoid exposing deep internal folders as permanent public contracts until the API is stable.

## Architectural rules

- Framework modules must stay game-agnostic.
- Scene code must orchestrate systems, not hold all business logic inline.
- Rendering concerns must not own the source of truth for game state.
- Layout rules must be declarative and recomputed only when necessary.
- Public APIs must favor explicitness over cleverness.
- Cleanup must be part of every lifecycle boundary.

## Dependency direction

Allowed dependency flow:

```txt
content -> game domain -> framework core -> PixiJS
```

Disallowed dependency flow:

- framework core importing game-specific rules;
- state depending on rendering implementation details;
- layout depending on scene-specific business logic;
- services reaching directly into unrelated scene internals.

## Runtime model

At runtime the app owns one application context.

That context owns:

- the Pixi application instance;
- the viewport state;
- the service registry;
- the asset registry;
- the event bus;
- the animation manager;
- the scene manager.

Scenes and components consume those services through explicit APIs rather than through hidden globals.

## MVP focus

The architecture for v0 must solve only what is required to build:

- a main menu scene;
- a simple gameplay scene;
- a pause overlay;
- a minimal HUD.

Any generalization beyond those flows needs a strong reason.

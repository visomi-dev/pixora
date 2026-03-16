# Module Boundaries

This document defines what each major pixora module owns and what it must not own.

## App core

Owns:

- Pixi application creation;
- shared application context;
- ticker startup and shutdown;
- viewport and resize wiring;
- scene manager startup.

Must not own:

- scene-specific content;
- gameplay rules;
- layout rules beyond global viewport propagation.

## Scenes

Own:

- scene registration and lookup;
- scene lifecycle transitions;
- root visual tree mount/unmount;
- overlay stacking rules.

Must not own:

- asset loading internals;
- store implementation internals;
- reusable widget definitions.

## State

Owns:

- signals;
- stores;
- computed values;
- effects;
- cleanup of subscriptions and reactive scopes.

Must not own:

- Pixi display objects;
- scene transition rules;
- direct DOM or canvas side effects except through explicit effects.

## Events

Owns:

- typed event publishing and subscription;
- scoped disposal for listeners;
- event name and payload contracts.

Must not own:

- long-lived state;
- scene storage;
- direct rendering changes.

## Components

Own:

- visual wrappers around Pixi display objects;
- props and local bindings;
- local lifecycle hooks;
- parent/child composition.

Must not own:

- app-wide service creation;
- global state orchestration;
- cross-scene navigation decisions.

## Layout

Owns:

- declarative position and size rules;
- parent-relative resolution;
- breakpoint decisions;
- layout invalidation and recomputation.

Must not own:

- animation timing;
- input state;
- domain data.

## Input

Owns:

- pointer normalization;
- hover, press, release, and disabled states;
- mapping low-level interaction to framework callbacks and events.

Must not own:

- scene navigation logic;
- gameplay rules beyond event forwarding.

## Animation

Owns:

- tween lifecycle;
- transition helpers;
- time-based interpolation.

Must not own:

- layout decisions;
- asset loading;
- scene registration.

## Assets

Own:

- key-based asset registration;
- load state tracking;
- centralized texture lookup.

Must not own:

- layout;
- scene lifecycle;
- content generation.

## Services

Own:

- typed service registration and resolution;
- service lifecycle hooks;
- application-scoped reusable logic.

Must not own:

- rendering tree structure;
- scene transition implementation;
- implicit global mutable state outside the registry.

## Example app boundary

`apps/example` is allowed to depend on the public API of `pixora` only.

It must not depend on:

- deep imports from `libs/pixora/src/...`;
- private implementation details of framework modules;
- temporary file structure assumptions inside the library.

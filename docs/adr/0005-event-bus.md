# ADR 0005: Event Bus

## Status

Accepted

## Context

The framework needs decoupled communication between scenes, UI, and gameplay modules. Unstructured string events would make the system fragile.

## Decision

Pixyn will provide a typed event bus based on an `EventMap` generic.

The bus will support:

- `emit(eventName, payload)`
- `on(eventName, handler)`
- `off(eventName, handler)` or disposable subscriptions
- scoped cleanup through disposables

The event bus is for transient events, not for persistent state.

## Consequences

Positive:

- stronger TypeScript contracts;
- less direct coupling between modules;
- simple bridge between UI actions and domain behavior.

Negative:

- event naming must remain disciplined;
- some flows may be tempting to model as events when a store is a better fit.

## Follow-up rules

- event names use dot notation such as `scene.changed` or `button.clicked`;
- payloads must be typed;
- event handlers must be disposable.

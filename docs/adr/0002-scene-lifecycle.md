# ADR 0002: Scene Lifecycle

## Status

Accepted

## Context

Pixyn needs a predictable way to initialize, mount, activate, deactivate, resize, update, and destroy scenes. The scene system must also support overlays.

## Decision

Pixyn will use a class-based scene model.

Each scene extends `Scene` and participates in a fixed lifecycle:

- `init(context, payload)`
- `mount()`
- `activate(payload)`
- `deactivate()`
- `update(deltaMs)`
- `resize(viewport)`
- `destroy()`

`init` and `mount` run once per instance. `activate`, `deactivate`, `update`, and `resize` can run many times. `destroy` runs once.

Overlays are scene-like instances managed by the same scene manager with different stacking rules.

## Consequences

Positive:

- explicit lifecycle boundaries;
- simple place to manage subscriptions and child nodes;
- easy transition from menu scenes to gameplay scenes and overlays.

Negative:

- scene instances are stateful classes, so lifecycle rules must be followed carefully;
- scene caching policy must be explicit.

## Follow-up rules

- scenes own a root container;
- scenes own their disposal bag;
- scene switching must go through the scene manager only.

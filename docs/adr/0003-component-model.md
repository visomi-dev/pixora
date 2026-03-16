# ADR 0003: Component Model

## Status

Accepted

## Context

The PRD requires reusable UI elements without introducing React or another full UI framework.

## Decision

pixora will use lightweight class-based visual wrappers built on top of Pixi display objects.

The MVP hierarchy is:

- `BaseNode` for low-level visual ownership and disposal;
- `BaseComponent<Props>` for reusable configured elements;
- `InteractiveComponent<Props>` for pointer-aware components.

Built-in components such as `ContainerNode`, `SpriteNode`, `TextNode`, `Button`, and `Panel` compose these primitives.

## Consequences

Positive:

- reusable UI without external runtime dependencies;
- direct control over Pixi objects;
- explicit local lifecycle and cleanup.

Negative:

- pixora must define its own composition and prop conventions;
- component APIs must remain small to avoid framework bloat.

## Follow-up rules

- composition is preferred over deep inheritance;
- components may bind to signals and stores, but should not become mini-scenes;
- interactive behavior must remain opt-in.

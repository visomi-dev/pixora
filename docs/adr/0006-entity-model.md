# ADR 0006: Entity Model

## Status

Accepted

## Context

Gameplay support is part of the roadmap, but a full entity-component-system would introduce extra abstraction too early.

## Decision

pixora will not implement a full ECS for MVP.

Instead it will provide a lightweight `Entity` abstraction that combines:

- a root visual node;
- local state;
- optional behaviors;
- event hooks;
- optional layout participation.

Complex gameplay systems remain the responsibility of the consuming game.

## Consequences

Positive:

- enough structure for players, customers, tables, and props;
- lower implementation risk;
- easier fit for the example app.

Negative:

- not ideal for highly systemic gameplay;
- behavior reuse patterns will need observation during the demo build.

## Follow-up rules

- entities stay optional in UI-only scenes;
- entities do not replace scenes, stores, or services;
- if the model becomes limiting, a later ADR can introduce systems on top of it.

# pixora Docs

This directory contains the phase 0 definition set for pixora.

The goal of phase 0 is to remove the biggest technical unknowns before framework code is written in `libs/pixora` and before the demo is rebuilt in `apps/example`.

## Source of truth

Read the documents in this order:

1. `docs/prd.md` - product intent, goals, constraints, and MVP framing.
2. `docs/glossary.md` - shared vocabulary used across the rest of the docs.
3. `docs/architecture/overview.md` - system shape and workspace mapping.
4. `docs/adr/` - final technical decisions for the first implementation.
5. `docs/specs/` - detailed contracts for each framework module.
6. `docs/roadmap/` - implementation order, backlog, testing, and release plan.

## Current workspace status

- `libs/pixora` exists as a publishable Vite library but still contains scaffold code.
- `apps/space-invaders` contains a complete Space Invaders game demo.
- `docs/prd.md` defines the product direction, but the technical definition set was missing.

## Document map

### Core references

- `docs/glossary.md`
- `docs/architecture/overview.md`
- `docs/architecture/module-boundaries.md`
- `docs/architecture/runtime-lifecycle.md`
- `docs/architecture/public-api-surface.md`
- `docs/architecture/packaging-and-build.md`

### Decision records

- `docs/adr/0001-reactive-core.md`
- `docs/adr/0002-scene-lifecycle.md`
- `docs/adr/0003-component-model.md`
- `docs/adr/0004-layout-engine.md`
- `docs/adr/0005-event-bus.md`
- `docs/adr/0006-entity-model.md`
- `docs/adr/0007-animation-strategy.md`
- `docs/adr/0008-asset-strategy.md`
- `docs/adr/0009-declarative-runtime.md`
- `docs/adr/0010-unified-pixora-api.md`
- `docs/adr/0011-gameplay-subtree-boundaries.md`

### Module specs

- `docs/specs/app-core.md`
- `docs/specs/scene-manager.md`
- `docs/specs/state.md`
- `docs/specs/events.md`
- `docs/specs/components.md`
- `docs/specs/layout.md`
- `docs/specs/input.md`
- `docs/specs/animation.md`
- `docs/specs/assets.md`
- `docs/specs/services.md`
- `docs/specs/entities.md`
- `docs/specs/example-app.md`

### Delivery planning

- `docs/roadmap/mvp-scope.md`
- `docs/roadmap/phases.md`
- `docs/roadmap/backlog.md`
- `docs/roadmap/testing-strategy.md`
- `docs/roadmap/release-strategy.md`

## Phase 0 exit criteria

Phase 0 is complete when:

- the public API direction is defined;
- the reactive model, scene lifecycle, and layout approach are no longer open questions;
- the MVP is reduced to the exact features needed by the example app;
- every implementation phase has inputs, outputs, and validation steps.

## Change rules

- `docs/prd.md` captures product intent and should change only when scope or goals change.
- ADRs record decisions. If a decision changes, create a follow-up ADR instead of silently rewriting history.
- Specs describe implementation contracts. They can evolve as long as they remain consistent with the latest ADRs.
- Roadmap docs can change as work progresses, but must keep dependencies and acceptance criteria explicit.

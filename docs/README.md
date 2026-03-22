# pixora

[![Documentation](https://img.shields.io/badge/docs-github.pages-2563eb?style=flat-square)](https://visomi.github.io/pixora/)

A lightweight reactive framework built on top of [PixiJS](https://pixijs.com) for 2D web games.

## What is pixora?

pixora solves the architectural gaps of PixiJS when building full applications:

- menus, UI systems, and responsive layouts
- reactive state driving rendering
- scene-based navigation
- event-driven gameplay
- lightweight animation orchestration

pixora is **not a game engine replacement** and does not compete with Unity, Godot, or Phaser. It is a structured runtime layer on top of PixiJS.

Primary use case: powering **Catfé Express**, a cozy cat café time-management game.

## Architecture

```
Layer 1 — PixiJS        Rendering (sprites, containers, text, rendering loop)
Layer 2 — pixora Core   App bootstrap, scene lifecycle, reactive state, events
Layer 3 — pixora UI     Declarative component model, flex layout, interaction
Layer 4 — Game Domain   Entities, gameplay rules, services (your code)
```

## Key capabilities

- **Signals/reactive state** — `signal()`, `computed()`, `effect()`, `createStore()`
- **Scene system** — `init → mount → activate → update → resize → deactivate → destroy`
- **Declarative UI** — `pixora.component()`, `pixora.container()`, `pixora.button()`, etc.
- **Flex layout** — CSS-like flexbox for responsive menus and HUD
- **Typed events** — decoupled communication between systems
- **Hybrid model** — declarative API for UI, imperative API for complex game logic

## Quick start

```ts
import { api as pixora, pixora as createApp } from 'pixora';

const menu = pixora.component((ctx) => {
  return pixora.container(
    {
      layout: {
        type: 'flex',
        direction: 'vertical',
        justify: 'center',
        align: 'center',
        gap: 16,
      },
    },
    pixora.text({ text: 'Welcome', color: '#ffffff', size: 32 }),
    pixora.button({ label: 'Start', onPointerTap: () => ctx.scenes.goTo('game') }),
  );
}, 'menu');

await createApp({
  scenes: [pixora.scene(menu)],
});
```

## Learn more

| Document                                 | Description                                        |
| ---------------------------------------- | -------------------------------------------------- |
| [summary.md](./summary.md)               | Full architecture overview and all phases summary  |
| [phases-context.md](./phases-context.md) | Implementation context and technical details       |
| [prd.md](./prd.md)                       | Product intent, goals, and MVP framing             |
| [roadmap/phases.md](./roadmap/phases.md) | Development phases and implementation order        |
| [glossary.md](./glossary.md)             | Shared vocabulary                                  |
| [architecture/](./architecture/)         | System shape, module boundaries, runtime lifecycle |

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

## Change rules

- `docs/prd.md` captures product intent and should change only when scope or goals change.
- ADRs record decisions. If a decision changes, create a follow-up ADR instead of silently rewriting history.
- Specs describe implementation contracts. They can evolve as long as they remain consistent with the latest ADRs.
- Roadmap docs can change as work progresses, but must keep dependencies and acceptance criteria explicit.

# ADR 0009: Declarative Runtime Architecture

## Status

Accepted

## Context

The framework started as an imperative system (Phases 1-9) with manual scene management, component instantiation, and prop updates. While functional, this approach required significant boilerplate and manual wiring for reactive updates.

The goal (Phases 10-22) was to introduce a declarative layer that describes _what_ to render rather than _how_ to render it, while maintaining backward compatibility with the imperative API.

## Decision

pixora will use a **hybrid architecture** with a declarative runtime built on top of the imperative foundation:

### Core Principles

1. **Declarative Node Definitions**: UI is described as plain frozen objects (`PixoraNode`) that describe the desired scene graph structure.

2. **Host Type Registry**: Maps string-based host types (`'container'`, `'text'`, `'box'`, `'button'`, `'sprite'`) to imperative factory functions.

3. **Tree Reconciliation**: When state changes, the runtime diffs the old and new node trees and patches only what changed—no full remounts.

4. **Scheduler Integration**: Visual updates and layout calculations are batched per-frame via an internal scheduler.

5. **Signal-Driven Reactivity**: Functional components can read signals during render; when signals change, the component auto-re-renders.

6. **Hybrid Scene Model**: Both declarative render functions and imperative Scene classes can coexist in the same app.

### API Design

**Entry Points**:

- `pixora()` — Creates a declarative app (recommended)
- `createPixoraApp()` — Creates an imperative app (escape hatch)

**Node Creation**:

```ts
import { api as pixora } from 'pixora';

const myScene = pixora.component((context) => {
  return pixora.container(
    { x: 0, y: 0 },
    pixora.text({ text: 'Hello' }),
    pixora.button({ label: 'Click me', onPointerTap: () => {} }),
  );
}, 'myScene');
```

**Scene Definition**:

```ts
await pixora({
  scenes: [
    myScene, // Declarative
    { key: 'game', create: () => new GameScene() }, // Imperative
  ],
});
```

### Key Architectural Decisions

| Decision                            | Rationale                                                           |
| ----------------------------------- | ------------------------------------------------------------------- |
| Frozen PixoraNode objects           | Enables safe comparison, memoization, and debugging                 |
| String-based HostType               | Extensible—new types can be registered at runtime                   |
| Functional components               | Aligns with modern signal-based reactivity patterns                 |
| Hybrid scene support                | Allows complex game logic (imperative) with simple UI (declarative) |
| Scheduler-based updates             | Prevents frame drops from excessive reconciliation                  |
| `onPointerTap` instead of `onPress` | Standardizes event naming with PixiJS conventions                   |

## Consequences

Positive:

- **Reduced boilerplate**: Declarative scenes are 50-70% smaller than imperative equivalents
- **Automatic optimization**: Scheduler batches updates; reconciliation avoids unnecessary DOM/Pixi calls
- **Reactive by default**: Signal changes propagate automatically—no manual wiring
- **Best of both worlds**: Simple UI uses declarative; complex logic uses imperative
- **Developer experience**: Debug tools, warnings, and tree inspection aid debugging

Negative:

- **Learning curve**: Developers must understand the distinction between definition (node) and instance (mounted node)
- **Runtime overhead**: Reconciliation has a small cost; mitigated by scheduler batching
- **Debugging complexity**: Stack traces may be deeper due to runtime indirection

## Follow-up Rules

- Prefer declarative scenes for UI (menus, HUDs, overlays)
- Use imperative scenes for complex game logic (physics, collisions, AI)
- Register custom components via `pixora.component(fn, 'name')`
- Keep render functions pure—side effects belong in effects or imperative code
- Use `pixora.imperative()` only for embedding existing BaseNode instances
- For gameplay-heavy scenes, follow ADR 0011 and isolate dynamic entity collections inside a gameplay island such as `InPlay`

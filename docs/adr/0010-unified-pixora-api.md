# ADR 0010: Unified pixora API with Callable Function Properties

## Status

Accepted

## Context

The declarative runtime (ADR 0009) provides two ways to create nodes and scenes:

1. Direct imports from the library:

   ```ts
   import { container, box, text, button, scene } from 'pixora';
   ```

2. Using the `api` object:
   ```ts
   import { api as pixora } from 'pixora';
   pixora.container(...)
   ```

This creates inconsistency and requires users to understand multiple import patterns. The goal is to provide a single, intuitive entry point that works like other popular frameworks (e.g., `Vue.createApp()`, `Solid.createRoot()`).

## Decision

The `pixora` export will be a **callable function with properties** that provides both app creation and node factory methods:

```ts
import { pixora } from 'pixora';

// Create app - callable as function
const app = await pixora({
  mount: document.getElementById('app')!,
  initialScene: 'main',
  scenes: [...]
});

// Use node factories directly as properties
const tree = pixora.container(
  { x: 0, y: 0 },
  pixora.box({ backgroundColor: 0x000000, width: 100, height: 100 }),
  pixora.text({ text: 'Hello' }),
  pixora.button({ label: 'Click', onPointerTap: () => {} }),
  pixora.sprite({ texture: 'myTexture' })
);

// Create scenes
const myScene = pixora.scene({ key: 'game', render: () => tree });

// Create a component/render function
const MyComponent = pixora.component((ctx) => {
  return pixora.container({},
    pixora.text({ text: 'Hello' })
  );
});

// Use in scenes
const myScene = pixora.scene({ key: 'main', render: MyComponent });
```

### Available Properties on pixora

| Property                | Type                                  | Description                                |
| ----------------------- | ------------------------------------- | ------------------------------------------ |
| `pixora(options)`       | `(options) => Promise<PixoraRuntime>` | Creates and starts the app                 |
| `pixora.box`            | `typeof box`                          | Creates a box node                         |
| `pixora.button`         | `typeof button`                       | Creates a button node                      |
| `pixora.container`      | `typeof container`                    | Creates a container node                   |
| `pixora.keyedContainer` | `typeof keyedContainer`               | Creates a keyed container node             |
| `pixora.scene`          | `scene()`                             | Creates a scene definition                 |
| `pixora.sprite`         | `typeof sprite`                       | Creates a sprite node                      |
| `pixora.text`           | `typeof text`                         | Creates a text node                        |
| `pixora.component(fn)`  | `(ctx) => PixoraNode`                 | Creates a render function from a component |

## Consequences

### Positive

1. **Single Import**: Users only need `import { pixora } from 'pixora'`
2. **Intuitive API**: Reads naturally—`pixora.container()`, `pixora.scene()`, etc.
3. **Framework Familiarity**: Pattern matches other JS frameworks (callable with properties)
4. **Flexible Component Patterns**: `pixora.component(fn)` creates render functions for reuse across scenes
5. **Tree-shaking Friendly**: Individual exports (`box`, `container`, etc.) remain available for selective imports

### Negative

1. **Type Complexity**: Requires a custom function type (`PixoraFn`) with call signature + properties
2. **Slight Runtime Overhead**: Assigning properties to function at runtime (negligible)

## Alternatives Considered

1. **pixora.component() only** — Rejected, requires extra call to create nodes
2. **pixora.box() style** — Rejected, inconsistent with app creation pattern
3. **Separate named exports** — Rejected, creates import confusion (what to import?)

## Implementation

- Added `PixoraFn` type to `libs/pixora/src/runtime/pixora.ts`
- Implemented property assignments on the function object
- Exported `PixoraFn` type from `libs/pixora/src/index.ts`
- Refactored `apps/space-invaders` to use new pattern

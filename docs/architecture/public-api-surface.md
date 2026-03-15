# Public API Surface

This document defines the intended public API shape for Pixyn v0.

## Packaging rule

Consumers import only from `pixyn`.

Deep imports into private source files are not supported.

## Root export groups

The root package should expose named exports grouped by module domain.

### App

- `createPixynApp`
- `type PixynApp`
- `type PixynAppOptions`
- `type Viewport`

### Scenes

- `Scene`
- `createSceneManager`
- `type SceneManager`
- `type SceneDefinition`
- `type SceneKey`
- `type ScenePayload`

### State

- `signal`
- `computed`
- `effect`
- `createStore`
- `type Signal`
- `type ReadonlySignal`
- `type Store`
- `type Disposable`

### Events

- `createEventBus`
- `type EventBus`
- `type EventMap`

### Components

- `BaseNode`
- `BaseComponent`
- `InteractiveComponent`
- `ContainerNode`
- `SpriteNode`
- `TextNode`
- `Button`
- `Panel`

### Layout

- `layout`
- `type LayoutSpec`
- `type AnchorLayoutSpec`
- `type StackLayoutSpec`
- `type BreakpointRule`

### Input

- `bindInteractive`
- `type InteractionState`
- `type ButtonState`

### Animation

- `createTween`
- `createTransition`
- `type Tween`
- `type TweenOptions`

### Assets

- `createAssetRegistry`
- `type AssetRegistry`
- `type AssetManifest`
- `type AssetKey`

### Services

- `createServiceRegistry`
- `createServiceToken`
- `type ServiceRegistry`
- `type ServiceToken`

### Entities

- `Entity`
- `type EntityOptions`

## Stability rules

- Anything exported from the root package is considered public.
- Anything not exported from the root package is private.
- Experimental APIs must be marked in docs before they are published.
- Public types should be stable before the first external publish.

## API style rules

- Prefer named exports over default exports.
- Prefer explicit class or factory names over overloaded magic helpers.
- Prefer option objects over long positional parameter lists.
- Prefer typed payload maps over untyped string plus `unknown` patterns.

## Deferred decisions

The exact signatures may evolve during implementation, but the module groups above should remain stable unless an ADR replaces them.

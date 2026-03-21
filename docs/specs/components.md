# Components Spec

## Goal

Provide reusable visual building blocks on top of Pixi display objects.

## Component hierarchy

The MVP component model is built on three base abstractions.

### BaseNode

Owns a Pixi display object, child nodes, bindings, and disposal.

### BaseComponent<Props>

Extends `BaseNode` with props, setup hooks, and reusable construction patterns.

### InteractiveComponent<Props>

Extends `BaseComponent` with pointer state, enabled or disabled behavior, and click or tap actions.

## Built-in MVP components

- `ContainerNode`
- `SpriteNode`
- `TextNode`
- `Button`
- `Panel`

## Common capabilities

- own a root display object;
- add and remove children;
- bind reactive values to properties;
- participate in layout;
- expose disposal;
- forward interaction events when applicable.

## Prop model

Components accept plain option objects at construction time.

Example direction:

```ts
const playButton = new Button({
  id: 'play-button',
  label: 'Play',
  disabled: menuStore.select((state) => state.loading),
  onPress: () => eventBus.emit('menu.playRequested', undefined),
});
```

## Lifecycle rules

- component setup occurs during construction or explicit init;
- components attach to parent nodes through composition;
- all local bindings and listeners are disposed on destroy.

## Binding rules

- reactive bindings must be explicit;
- bindings may target visibility, position, alpha, text content, and similar properties;
- bindings must not hide expensive per-frame work behind innocuous APIs.

## MVP deliverables

- reusable button and panel components;
- text and sprite wrappers;
- container composition;
- local lifecycle cleanup;
- signal and store binding support for basic properties.

## Gameplay island pattern

For gameplay-heavy scenes, pixora components should be split between a stable scene shell and a fast-changing playfield island.

Recommended structure:

1. `GameSceneShell`
   - background
   - HUD
   - pause or game-over overlays
   - `InPlay`
2. `InPlay`
   - player
   - bullets
   - enemy bullets
   - enemies
   - power-ups

Rules:

- only `InPlay` should read high-frequency gameplay signals;
- dynamic entity nodes should be keyed by stable `id` values;
- one container per entity family is recommended when it improves layering or reconciliation clarity;
- `pixora.island()` should be preferred for hot gameplay rendering so the scene tree can stay stable while the island patches its own Pixi objects.

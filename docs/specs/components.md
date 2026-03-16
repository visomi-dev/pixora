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

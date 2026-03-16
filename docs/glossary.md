# Glossary

This glossary defines the terms used by pixora documents and later by the public API.

## Core runtime terms

- App: the top-level pixora runtime created by `createpixoraApp`.
- Application Context: the shared runtime object passed to scenes, services, and framework modules.
- Viewport: the current logical width, height, aspect ratio, orientation, and scale information.
- Ticker: the per-frame update source used to drive scene updates, tweens, and time-based logic.
- Disposable: an object with `dispose()` used to release subscriptions, listeners, or resources.

## Scene terms

- Scene: a top-level runtime unit that owns a root visual tree and part of the game flow.
- Overlay: a scene-like layer presented above another scene without replacing it.
- Active Scene: the scene currently receiving update and input events.
- Mounted Scene: a scene whose root container is attached to the application stage.
- Scene Key: the stable string identifier used to register and switch scenes.
- Scene Payload: typed data passed when entering a scene or overlay.

## Visual composition terms

- Node: the smallest framework-owned visual wrapper around a Pixi display object.
- Component: a reusable node abstraction that accepts props and can manage local bindings.
- Interactive Component: a component that handles pointer states and user actions.
- Visual Tree: the hierarchy of nodes mounted inside a scene or component.
- Entity: a gameplay-oriented visual object that combines a node, state, and behavior.

## Layout terms

- Layout Node: a declarative positioning rule attached to a node.
- Fixed Layout: explicit width, height, and position values.
- Anchor Layout: alignment against parent or viewport edges and centers.
- Stack Layout: ordered vertical or horizontal distribution of children.
- Layout Pass: a recalculation cycle that resolves sizes and positions.
- Breakpoint: a viewport rule used to switch layout values for compact or wide screens.

## Reactive terms

- Signal: a mutable value container that notifies subscribers when the value changes.
- Readonly Signal: a signal that can be read and subscribed to, but not written by consumers.
- Computed: a derived value that depends on one or more signals or stores.
- Effect: a reactive side effect that re-runs when its tracked dependencies change.
- Store: an object state container with snapshot reads, patching, and subscriptions.
- Selector: a derived read model computed from store or signal state.

## Events and services

- Event Bus: the typed publish/subscribe channel used for domain and UI events.
- Event Map: the TypeScript mapping between event names and payload shapes.
- Service: a long-lived runtime object registered in the application context.
- Service Registry: the typed lookup mechanism used to resolve services.
- Binding: a connection that syncs a reactive value into a node property, style, or behavior.

## Assets and animation

- Asset Key: the stable identifier used to register and load a texture, spritesheet, or bundle.
- Asset Manifest: the declarative list of assets needed by scenes or the app.
- Tween: a time-based interpolation between values.
- Transition: a coordinated enter, exit, or scene-change animation.

## Scope language

- MVP: the minimum feature set required to build the Space Invaders game with menu, gameplay, and game over screens.
- Framework Core: code inside `libs/pixora` that stays game-agnostic.
- Example App: code inside `apps/space-invaders` used to validate the framework with a realistic integration.

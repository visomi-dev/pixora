# MVP Scope

## Goal

Define the smallest framework feature set that can ship a convincing example app.

## In scope

- app bootstrap;
- shared application context;
- scene registration and switching;
- overlays;
- viewport and resize handling;
- typed event bus;
- lightweight signal and store runtime;
- service registry;
- built-in components: container, sprite, text, button, panel;
- layout strategies: fixed, anchor, stack;
- basic pointer input;
- simple tweens and transitions;
- basic asset registry;
- example app with menu, gameplay, pause overlay, and HUD.

## Out of scope

- visual editor;
- physics;
- networking;
- ECS framework;
- grid layout;
- audio system;
- developer tools UI;
- advanced animation timelines;
- scene serialization.

## MVP acceptance criteria

The MVP is ready when:

- the app starts and mounts an initial scene;
- at least two scenes can be switched through the manager;
- an overlay can be opened and closed;
- a reusable button works with hover, press, and disabled states;
- layout adapts between mobile and desktop widths;
- a reactive store updates UI without manual polling;
- events can be emitted and handled with TypeScript safety;
- scene cleanup removes listeners and bindings;
- the example app is built only with the public API of `pixyn`.

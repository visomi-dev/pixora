# Example App Spec

## Goal

Use `apps/example` as the first real consumer of Pixyn.

The example app is not marketing-only. It is the integration harness that proves the framework can build the intended MVP flows.

## Rules

- import from `pixyn` only;
- do not deep-import `libs/pixyn/src/...`;
- exercise scenes, overlays, layout, state, events, assets, and basic animation;
- remain small enough to iterate quickly.

## Required flows

### Main menu

- background art or color treatment;
- logo or title;
- primary buttons;
- responsive centered layout;
- transition into gameplay.

### Gameplay scene

- root play area;
- at least one moving or stateful entity;
- minimal HUD;
- event-driven UI updates.

### Pause overlay

- open and close on demand;
- stack above gameplay;
- block gameplay interaction while active;
- demonstrate overlay transitions.

## Suggested future folder structure

```txt
apps/example/src/
  main.ts
  app/
    bootstrap.ts
    assets.ts
    events.ts
    services/
    scenes/
      main-menu/
      gameplay/
      pause-overlay/
    ui/
```

## Success criteria

The example app proves that Pixyn can:

- start an initial scene;
- navigate between scenes;
- show an overlay;
- render reusable buttons and panels;
- react to state changes;
- adapt the layout to different viewport sizes.

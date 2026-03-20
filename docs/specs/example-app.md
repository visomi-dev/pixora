# Space Invaders Game Spec

## Goal

Use `apps/space-invaders` as the first real consumer of pixora.

The Space Invaders game is not marketing-only. It is the integration harness that proves the framework can build the intended MVP flows.

## Rules

- import from `pixora` only;
- do not deep-import `libs/pixora/src/...`;
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
- multiple enemy types with different behaviors;
- player ship with controls;
- bullets and collision detection;
- HUD with score, level, and lives;
- power-up system;
- combo scoring system;
- progressive difficulty.

The gameplay scene should follow the shell-plus-playfield split from ADR 0011:

- `GameSceneShell` owns background, HUD, overlays, and scene coordination;
- `InPlay` owns player, bullets, enemy bullets, enemies, and power-ups through `pixora.island()`;
- only `InPlay` reads the high-frequency gameplay signals;
- dynamic gameplay entities are keyed by stable `id` values.

### Game over / Victory

- display final score;
- high score tracking;
- restart option.

## Suggested folder structure

```txt
apps/space-invaders/src/
  main.ts
  app/
    space-invaders.ts
    space-invaders.css
    scenes/
      main-menu/
      game/
      game-over/
      victory/
```

## Success criteria

The Space Invaders game proves that pixora can:

- start an initial scene;
- navigate between scenes;
- render reusable buttons and panels;
- handle keyboard input;
- render multiple game entities;
- handle collision detection;
- react to state changes;
- adapt the layout to different viewport sizes;
- emit and handle custom events;
- persist data to localStorage.

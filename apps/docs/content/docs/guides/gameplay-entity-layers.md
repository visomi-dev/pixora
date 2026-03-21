---
title: Gameplay Entity Layers
description: Structure gameplay scenes with a stable shell and an in-play island
weight: 10
---

# Gameplay Entity Layers

Gameplay scenes do not behave like menus. HUD labels and overlays change occasionally, but bullets, enemies, and power-ups can change every frame.

Pixora's recommended pattern is to split those concerns into a stable shell and a focused gameplay island.

## Recommended structure

1. **GameSceneShell**
   - background
   - HUD
   - pause and game-over overlays
   - `InPlay`
2. **InPlay**
   - player
   - bullets
   - enemy bullets
   - enemies
   - power-ups

## Rules inside `InPlay`

- use keyed entities by `id`;
- keep one container per entity family when it helps layering or ownership;
- only this island should read the high-frequency gameplay signals.

## Why this split works

- the shell remains easy to read and reason about;
- keyed entity collections preserve mounted nodes across movement updates;
- the declarative scene tree stays stable while the gameplay island patches its own Pixi objects.

## Runtime recommendation

For gameplay-heavy declarative scenes, let the shell stay declarative and make the fast-changing playfield a `pixora.island()`.

```ts
import { pixora } from 'pixora';

function InPlay(context) {
  return pixora.island({
    context,
    key: 'in-play',
    setup: ({ root }) => {
      // create and patch Pixi objects directly here
    },
  });
}

function GameSceneShell(context, viewportWidth, viewportHeight) {
  return pixora.container(
    { x: 0, y: 0 },
    pixora.box({ backgroundColor: 0x0a0a1a, height: viewportHeight, width: viewportWidth, x: 0, y: 0 }),
    InPlay(context),
  );
}

export const gameScene = pixora.scene({
  key: 'game',
  render: (context) => {
    const viewport = context.viewport.get();

    return GameSceneShell(context, viewport.width, viewport.height);
  },
});
```

## When not to use it

If the whole scene truly changes as one unit every tick, `updateMode: 'frame'` can still be appropriate. The shell-plus-island split is for scenes where only part of the tree is hot.

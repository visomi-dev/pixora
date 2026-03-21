---
title: Islands
description: Create self-updating gameplay surfaces with pixora.island()
---

# Islands

Islands are Pixora's mechanism for creating **hot gameplay surfaces** — areas of your scene that update at high frequency (every frame) while the rest of the scene remains declarative and stable.

## When to use Islands

Most UI scenes (menus, settings, overlays) change rarely and fit the declarative model perfectly. But gameplay scenes often have objects that change every frame: bullets, enemies, particles, player position.

Rather than making the entire scene "hot", you can mark just the gameplay area as an island.

## Core Concept

An island is a **managed self-updating surface** that:

- Receives a `context` and a `key` for identity
- Runs a `setup` function that creates Pixi objects directly
- Returns those objects wrapped so Pixora can track and patch them
- Reads high-frequency signals only within its own boundary

## API

```typescript
function pixora.island(options: {
  context: Context;
  key: string;
  setup: (params: { root: Container }) => void;
}): IslandNode
```

### Parameters

| Parameter | Type                 | Description                                                 |
| --------- | -------------------- | ----------------------------------------------------------- |
| `context` | `Context`            | The runtime context passed to your scene's render function  |
| `key`     | `string`             | A unique identifier for this island within the scene        |
| `setup`   | `({ root }) => void` | Callback that creates and manipulates Pixi objects directly |

### Returns

`IslandNode` — a node you place inside your declarative scene tree.

## Usage

```typescript
import { pixora } from 'pixora';

function InPlay(context) {
  return pixora.island({
    context,
    key: 'in-play',
    setup: ({ root }) => {
      const player = new Player();
      const bullets = new Container();
      const enemies = new Container();

      root.addChild(player.display, bullets, enemies);
    },
  });
}

function GameSceneShell(context, viewportWidth, viewportHeight) {
  return pixora.container(
    { x: 0, y: 0 },
    pixora.box({ backgroundColor: 0x0a0a1a, height: viewportHeight, width: viewportWidth, x: 0, y: 0 }),
    pixora.text({ text: 'SCORE: 0', x: 10, y: 10 }),
    InPlay(context),
  );
}
```

## Rules for Islands

1. **Use keyed entities** — inside an island, use `pixora.keyedBox()` or similar keyed constructs by `id` to preserve mounted nodes across updates

2. **Only the island reads high-frequency signals** — signals that update every frame (player position, bullet positions, enemy health) should only be read inside the island's setup or in effects within the island's scope

3. **Island is a patch boundary** — Pixora patches the island's Pixi objects directly without re-evaluating the declarative shell

## Shell + Island Pattern

The recommended structure for gameplay scenes:

```
GameSceneShell
├── Background (declarative)
├── HUD (declarative, updates via events)
├── Pause overlay (declarative)
└── InPlay (island)
    ├── Player
    ├── Bullets
    ├── Enemies
    └── Power-ups
```

This keeps the shell easy to reason about while isolating the hot path.

## Without Islands

If the entire scene changes as one unit every tick, you might use `updateMode: 'frame'` instead. Islands are specifically for when **only part** of the tree is hot.

See [Gameplay Entity Layers](../guides/gameplay-entity-layers/) for a full example.

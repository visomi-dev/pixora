---
title: Components Module
description: Declarative component composition and keyed gameplay nodes
---

The Components module in Pixora is the declarative composition layer used by scenes and gameplay islands.

## Overview

Pixora components are plain functions that return `PixoraNode` trees.

- `pixora.component()` defines a reusable render function.
- call component functions directly from scenes or other components.
- use `pixora.island()` when a subtree should manage its own Pixi objects without changing the declarative scene tree.
- keyed host helpers such as `pixora.keyedBox()` keep dynamic collections stable across reconciliation.

## Example

```ts
import { pixora } from 'pixora';

const StatusBanner = pixora.component(({ label }: { label: string }) => {
  return pixora.text({ text: label, color: '#00ffaa', size: 18 });
});

const tree = pixora.container(
  { x: 0, y: 0 },
  StatusBanner({ label: 'READY' }),
  pixora.keyedBox('player', { backgroundColor: 0x00ffaa, width: 24, height: 12, x: 200, y: 320 }),
);
```

## Gameplay recommendation

For gameplay-heavy scenes:

- keep the scene shell focused on background, HUD, and overlays;
- move dynamic entities into an `InPlay` island;
- key every gameplay entity by `id`;
- let the island patch its own Pixi objects while the scene shell stays declarative.

## Related docs

- [Gameplay Entity Layers](../../guides/gameplay-entity-layers/)
- [Space Invaders Game](../../examples/space-invaders/)
- [Generated API Docs](../generated/)

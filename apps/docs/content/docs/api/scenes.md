---
title: Scenes Module
description: Scene management and transitions
---

The Scenes module is where Pixora's declarative-default workflow becomes tangible. Scenes describe what should render for a given game state, and the runtime handles transitions between them.

## Overview

Scenes typically map to the major states of your game:

- Title scene
- Game scene
- Menu scene
- Pause or overlay scene

## Creating Scenes

```typescript
import { layout, pixora } from 'pixora';

export const menuScene = pixora.scene({
  key: 'menu',
  render: (context) => {
    const viewport = context.viewport.get();

    return pixora.container(
      { x: 0, y: 0 },
      pixora.box({ backgroundColor: 0x0a0a1a, width: viewport.width, height: viewport.height }),
      pixora.container(
        {
          layout: layout.percent({ horizontal: 'center', vertical: 'center', width: 1 }),
        },
        pixora.button({
          label: 'Play',
          width: 220,
          height: 56,
          backgroundColor: 0x00ffaa,
          onPointerTap: () => void context.scenes.goTo('game'),
        }),
      ),
    );
  },
});
```

## Scene Transitions

```typescript
runtime.context.scenes.goTo('game');
```

You can also respond to scene lifecycle changes through runtime events:

```typescript
runtime.context.events.on('scene.changed', (payload) => {
  console.log(payload.nextScene);
});
```

## Imperative Compatibility

Pixora still exports `Scene` and `createSceneManager()` for migration scenarios or advanced imperative control. New examples and docs default to `pixora.scene()` because it keeps scene code closer to the UI tree and runtime state.

## API Reference

For complete API documentation, see the [Generated API Docs](../generated/).

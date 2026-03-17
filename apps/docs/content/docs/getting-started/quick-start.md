---
title: Quick Start
description: Build your first Pixora game in minutes
---

This tutorial walks through Pixora's declarative-default workflow: boot a runtime with `pixora()`, register scenes, and return node trees from pure render functions.

## Create Your Application

Every Pixora game starts with `pixora()` — an async factory that boots the renderer, loads assets, and returns a running runtime:

```typescript
import { pixora } from 'pixora';

const runtime = await pixora({
  backgroundColor: 0x1099bb,
  initialScene: 'main-menu',
  mount: document.querySelector('#stage')!,
  scenes: [mainMenuScene],
});

await runtime.start();
```

## Define a Scene

Scenes are created with `pixora.scene()`. Each scene has a `key` and a `render` function that returns a tree of nodes:

```typescript
import { layout, pixora } from 'pixora';

export const mainMenuScene = pixora.scene({
  key: 'main-menu',
  render: (context) => {
    const vp = context.viewport.get();

    return pixora.container(
      { x: 0, y: 0 },
      pixora.box({ backgroundColor: 0x0a0a1a, width: vp.width, height: vp.height }),
      pixora.container(
        {
          layout: layout.percent({ horizontal: 'center', vertical: 'center', width: 1 }),
        },
        pixora.container(
          {
            layout: layout.flex({ direction: 'vertical', justify: 'center', align: 'center', gap: 16 }),
          },
          pixora.text({ text: 'MY GAME', color: '#00ffaa', size: 72, weight: '900' }),
          pixora.button({
            label: 'START',
            backgroundColor: 0x00ffaa,
            width: 240,
            height: 56,
            onPointerTap: () => void context.scenes.goTo('game'),
          }),
        ),
      ),
    );
  },
});
```

## Layout System

Pixora includes a flexible layout system. Use `layout.flex()` for flow-based layouts and `layout.percent()` for percentage-based positioning:

```typescript
import { layout, pixora } from 'pixora';

// Flex layout — CSS-like flexbox
pixora.container(
  {
    layout: layout.flex({
      direction: 'vertical',  // or 'horizontal'
      justify: 'space-between',
      align: 'center',
      gap: 16,
      padding: 24,
    }),
  },
  pixora.text({ text: 'Top' }),
  pixora.text({ text: 'Bottom' }),
);

// Percent layout — positions relative to parent size
pixora.container(
  {
    layout: layout.percent({ horizontal: 'center', vertical: 'end' }),
  },
  pixora.button({ label: 'Footer Button', width: 200, height: 48 }),
);
```

## Text and Components

Text nodes accept direct style properties — no helper functions needed:

```typescript
pixora.text({
  text: 'SCORE: 1000',
  color: '#ffffff',
  size: 24,
  weight: 'bold',
  font: 'Orbitron, sans-serif',
});
```

## Handle Input

Use `createKeyboardInput` to poll keyboard state inside scene logic, or use pointer events on interactive elements for buttons and menus:

```typescript
import { createKeyboardInput, Keys, pixora } from 'pixora';

const keyboard = createKeyboardInput();

const gameScene = pixora.scene({
  key: 'game',
  render: (context) => {
    // Update loop runs every frame via the scheduler
    return pixora.container({ x: 0, y: 0 });
  },
});
```

## Complete Example

Here's a minimal but complete game setup:

```typescript
import { layout, pixora } from 'pixora';

const menuScene = pixora.scene({
  key: 'menu',
  render: (context) => {
    const vp = context.viewport.get();

    return pixora.container(
      { x: 0, y: 0 },
      pixora.box({ backgroundColor: 0x0a0a1a, width: vp.width, height: vp.height }),
      pixora.container(
        { layout: layout.percent({ horizontal: 'center', vertical: 'center', width: 1 }) },
        pixora.container(
          { layout: layout.flex({ direction: 'vertical', align: 'center', gap: 24 }) },
          pixora.text({ text: 'MY GAME', color: '#00ffaa', size: 64, weight: '900' }),
          pixora.button({
            label: 'PLAY',
            backgroundColor: 0x00ffaa,
            width: 220,
            height: 56,
            onPointerTap: () => void context.scenes.goTo('game'),
          }),
        ),
      ),
    );
  },
});

const runtime = await pixora({
  backgroundColor: 0x0a0a1a,
  initialScene: 'menu',
  mount: document.querySelector('#stage')!,
  scenes: [menuScene],
});

await runtime.start();
```

## Next Steps

- [API Reference](../../api/) - Explore all available APIs
- [Examples](../../examples/) - See complete examples built with the same runtime

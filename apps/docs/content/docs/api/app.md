---
title: App Module
description: Core application and game loop
---

The App module is the core of every Pixyn application, managing the game loop, rendering, and application lifecycle.

## Overview

The `PixynApp` class is the entry point for creating Pixyn applications. It handles:

- Canvas creation and management
- Game loop (ticker)
- Stage and scene management
- Resource cleanup

## Creating an Application

```typescript
import { PixynApp } from 'pixyn';

const app = new PixynApp({
  width: 800,
  height: 600,
  backgroundColor: 0x1099bb,
  resolution: window.devicePixelRatio || 1,
  autoDensity: true,
  antialias: true,
});

document.body.appendChild(app.view);

app.start();
```

## Configuration Options

| Option            | Type      | Default  | Description            |
| ----------------- | --------- | -------- | ---------------------- |
| `width`           | `number`  | 800      | Canvas width           |
| `height`          | `number`  | 600      | Canvas height          |
| `backgroundColor` | `number`  | 0x000000 | Background color (hex) |
| `resolution`      | `number`  | 1        | Resolution multiplier  |
| `autoDensity`     | `boolean` | false    | Auto density for HiDPI |
| `antialias`       | `boolean` | false    | Enable antialiasing    |

## Game Loop

The ticker manages the game loop:

```typescript
app.ticker.add((delta) => {
  // Update game logic
  entity.update(delta);
});
```

## Lifecycle Methods

- `start()` - Start the application
- `stop()` - Stop the application
- `destroy()` - Destroy and cleanup resources

## API Reference

For complete API documentation, see the [Generated API Docs](/docs/api/generated/).

---
title: App Module
description: Core application and game loop
---

The App module centers on `pixora()`, the declarative runtime factory. It boots Pixi, mounts the stage, wires scenes together, and returns a runtime you can start, stop, and destroy.

## Overview

The runtime returned by `pixora()` handles:

- Stage creation and mounting
- Scene registration and initial navigation
- Asset loading and runtime lifecycle
- Cleanup and teardown

## Creating an Application

```typescript
import { pixora } from 'pixora';

const runtime = await pixora({
  backgroundColor: 0x1099bb,
  initialScene: 'menu',
  mount: document.querySelector('#stage')!,
  scenes: [
    pixora.scene({
      key: 'menu',
      render: () => pixora.text({ text: 'Hello, Pixora!', color: '#ffffff', size: 32 }),
    }),
  ],
});

await runtime.start();
```

## Configuration Options

| Option            | Type                   | Description                                           |
| ----------------- | ---------------------- | ----------------------------------------------------- |
| `mount`           | `HTMLElement`          | Host element that receives the Pixi canvas            |
| `initialScene`    | `string`               | Scene key that becomes active after startup           |
| `scenes`          | `PixoraScene[]`        | Declarative or imperative scene definitions           |
| `backgroundColor` | `number`               | Default background color for the renderer             |
| `assets`          | `PixoraAssetsOptions`  | Fonts and other assets to preload before startup      |
| `autoStart`       | `boolean`              | Whether the runtime should start immediately          |

## Runtime Lifecycle

The returned runtime exposes explicit lifecycle methods:

```typescript
await runtime.start();
runtime.stop();
await runtime.destroy();
```

## Compatibility APIs

If you need lower-level control, Pixora still exports compatibility helpers such as `createPixoraApp()` for older imperative integrations. The declarative runtime remains the recommended default for new code.

## API Reference

For complete API documentation, see the [Generated API Docs](../generated/).

---
title: Input Module
description: Keyboard, mouse, and gamepad input
---

The Input module provides unified input handling for keyboard, mouse, and gamepad devices.

## Overview

Pixora's input system:

- Keyboard state tracking
- Mouse position and button handling
- Gamepad support
- Touch input support

## Keyboard Input

```typescript
import { Input, Keyboard } from 'pixora';

// Check key state
if (Input.keyboard.isDown(Keyboard.Space)) {
  // Jump!
}

// Listen for key events
Input.keyboard.on('keydown', (event) => {
  console.log('Key pressed:', event.code);
});
```

## Mouse Input

```typescript
import { Input, Mouse } from 'texyn';

// Get mouse position
const x = Input.mouse.x;
const y = Input.mouse.y;

// Check mouse buttons
if (Input.mouse.isDown(Mouse.LeftButton)) {
  // Fire!
}
```

## Gamepad Input

```typescript
import { Input, Gamepad } from 'pixora';

// Get gamepad
const gamepad = Input.gamepads[0];

if (gamepad) {
  const x = gamepad.axes[0];
  const y = gamepad.axes[1];

  if (gamepad.buttons[0].pressed) {
    // A button pressed
  }
}
```

## API Reference

For complete API documentation, see the [Generated API Docs](../generated/).

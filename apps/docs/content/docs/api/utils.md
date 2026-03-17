---
title: Utils Module
description: Utility functions and helpers
---

The Utils module provides common utility functions used throughout Pixora.

## Overview

Utility functions include:

- Math helpers
- Color utilities
- String helpers
- Object utilities

## Math Utilities

```typescript
import { MathUtils, Vec2, Color } from 'pixora';

// Clamp values
const clamped = MathUtils.clamp(150, 0, 100); // 100

// Lerp
const value = MathUtils.lerp(0, 100, 0.5); // 50

// Random
const random = MathUtils.randomRange(1, 10);
```

## Color Utilities

```typescript
import { Color } from 'pixora';

const color = new Color(0xff5500);

// Convert formats
color.toHex(); // "#ff5500"
color.toRgb(); // { r: 255, g: 85, b: 0 }
color.toRgba(); // { r: 255, g: 85, b: 0, a: 1 }

// Manipulate
color.lighten(0.2);
color.darken(0.1);
color.setAlpha(0.5);
```

## Vector Utilities

```typescript
import { Vec2 } from 'pixora';

const pos = new Vec2(100, 100);
pos.add(new Vec2(50, 50)); // { x: 150, y: 150 }
pos.sub(new Vec2(20, 30)); // { x: 80, y: 70 }
pos.normalize();
pos.length(); // distance from origin
pos.distanceTo(other); // distance to another vector
```

## API Reference

For complete API documentation, see the [Generated API Docs](../generated/).

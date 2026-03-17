---
title: Animation Module
description: Tween and sprite sheet animation system
---

The Animation module provides powerful animation capabilities including tweens and sprite sheet animations.

## Overview

Pixora's animation system is built around two main concepts:

- **Tweens**: Interpolate values over time with easing functions
- **Sprite Animations**: Play sprite sheet animations with frame control

## Tween

Create smooth animations using the Tween class:

```typescript
import { Tween, Easing } from 'pixora';

const tween = new Tween(entity.position)
  .to({ x: 400, y: 300 }, 1000, Easing.Quadratic.Out)
  .onComplete(() => {
    console.log('Animation complete!');
  })
  .start();
```

## Easing Functions

Available easing functions:

- `Easing.Linear`
- `Easing.Quadratic.In`, `Easing.Quadratic.Out`, `Easing.Quadratic.InOut`
- `Easing.Cubic.In`, `Easing.Cubic.Out`, `Easing.Cubic.InOut`
- `Easing.Elastic.In`, `Easing.Elastic.Out`
- And many more...

## Sprite Animation

Play sprite sheet animations:

```typescript
import { SpriteAnimation } from 'pixora';

const animation = new SpriteAnimation(sprite, {
  frames: 10,
  frameRate: 12,
  loop: true,
});

animation.play();
```

## API Reference

For complete API documentation, see the [Generated API Docs](../generated/).

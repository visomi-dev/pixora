---
title: Quick Start
description: Build your first Pixyn game in minutes
---

This tutorial will guide you through creating a simple game using Pixyn.

## Create Your Application

Every Pixyn game starts with creating an application instance:

```typescript
import { PixynApp } from 'pixyn';

const app = new PixynApp({
  width: 800,
  height: 600,
  backgroundColor: 0x1099bb,
  resolution: window.devicePixelRatio || 1,
  autoDensity: true,
});

document.body.appendChild(app.view);

app.start();
```

## Add Game Objects

Create game objects using the Entity system:

```typescript
import { Entity, SpriteComponent } from 'pixyn';

const player = new Entity('player');

// Add a sprite component
const sprite = player.addComponent(SpriteComponent, {
  texture: 'player.png',
  x: 100,
  y: 100,
});

// Add to scene
app.stage.addChild(player);
```

## Add Animation

Use the animation system to bring your game to life:

```typescript
import { Tween, Easing } from 'pixyn';

// Move player with tween
const tween = new Tween(player.position).to({ x: 400 }, 1000, Easing.Quadratic.Out).start();

app.ticker.add(() => {
  tween.update(app.ticker.elapsedMS);
});
```

## Handle Input

Pixyn provides a unified input system:

```typescript
import { Input, Keyboard } from 'pixyn';

// Listen for keyboard events
Input.keyboard.on('keydown', (event) => {
  if (event.code === Keyboard.Space) {
    // Jump action
  }
});
```

## Complete Example

Here's a complete example putting it all together:

```typescript
import { PixynApp, Entity, SpriteComponent, Tween, Easing, Input, Keyboard } from 'pixyn';

const app = new PixynApp({
  width: 800,
  height: 600,
  backgroundColor: 0x1099bb,
});

const player = new Entity('player');
player.addComponent(SpriteComponent, {
  texture: 'player.png',
  x: 100,
  y: 300,
});

app.stage.addChild(player);

// Move on arrow keys
Input.keyboard.on('keydown', (event) => {
  const speed = 10;
  switch (event.code) {
    case Keyboard.ArrowLeft:
      player.position.x -= speed;
      break;
    case Keyboard.ArrowRight:
      player.position.x += speed;
      break;
    case Keyboard.ArrowUp:
      player.position.y -= speed;
      break;
    case Keyboard.ArrowDown:
      player.position.y += speed;
      break;
  }
});

app.start();
```

## Next Steps

- [API Reference](/docs/api/) - Explore all available APIs
- [Examples](/docs/examples/) - See more complete examples

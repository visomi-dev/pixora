---
title: Components Module
description: Entity component system
---

The Components module provides the building blocks for game entities using a component-based architecture.

## Overview

Components are reusable pieces of data and behavior that can be attached to entities:

- **SpriteComponent**: Render sprites
- **TransformComponent**: Position, rotation, scale
- **PhysicsComponent**: Physics simulation
- **AnimationComponent**: Play animations
- Custom components

## Built-in Components

```typescript
import { Entity, SpriteComponent, TransformComponent } from 'pixora';

const entity = new Entity('player');
entity.addComponent(TransformComponent, { x: 100, y: 100 });
entity.addComponent(SpriteComponent, { texture: 'player.png' });
```

## Custom Components

Create custom components:

```typescript
import { Component } from 'pixora';

class HealthComponent extends Component {
  health = 100;
  maxHealth = 100;

  takeDamage(amount: number) {
    this.health = Math.max(0, this.health - amount);
    if (this.health === 0) {
      this.entity.destroy();
    }
  }

  heal(amount: number) {
    this.health = Math.min(this.maxHealth, this.health + amount);
  }
}

entity.addComponent(HealthComponent, { health: 100, maxHealth: 100 });
```

## API Reference

For complete API documentation, see the [Generated API Docs](../generated/).

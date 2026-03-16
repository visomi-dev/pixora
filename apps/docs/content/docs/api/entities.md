---
title: Entities Module
description: Game entity management
---

The Entities module provides the entity system for organizing game objects.

## Overview

Entities are the core objects in Pixyn's ECS architecture:

- Lightweight objects that hold components
- Identified by name or ID
- Can be queried and filtered

## Creating Entities

```typescript
import { Entity } from 'pixyn';

const player = new Entity('player');
```

## Entity Lifecycle

```typescript
// Initialize
player.onInit = () => {
  console.log('Entity initialized');
};

// Update each frame
player.onUpdate = (delta) => {
  player.position.x += player.velocity.x * delta;
};

// Cleanup
player.onDestroy = () => {
  console.log('Entity destroyed');
};
```

## Entity Queries

Find entities by components:

```typescript
import { World } from 'pixyn';

const enemies = World.query(EnemyComponent, TransformComponent);

for (const enemy of enemies) {
  // Process enemy
}
```

## API Reference

For complete API documentation, see the [Generated API Docs](/docs/api/generated/).

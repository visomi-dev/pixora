---
title: Events Module
description: Event handling system
---

The Events module provides a flexible event system for communication between game objects.

## Overview

Pixora's event system supports:

- Custom events
- Event bubbling
- One-time listeners
- Event priorities

## Creating and Dispatching Events

```typescript
import { EventDispatcher, GameEvent } from 'pixora';

const dispatcher = new EventDispatcher();

// Create custom event
const event = new GameEvent('playerDied', { score: 1000 });

// Dispatch
dispatcher.dispatch(event);
```

## Listening for Events

```typescript
// Listen for specific event
dispatcher.on('playerDied', (event) => {
  console.log('Player died with score:', event.data.score);
});

// One-time listener
dispatcher.once('levelComplete', () => {
  console.log('Level complete!');
});

// Remove listener
const handler = () => console.log('Event!');
dispatcher.on('event', handler);
dispatcher.off('event', handler);
```

## Global Events

Use the global event bus for application-wide events:

```typescript
import { Events } from 'pixora';

Events.on('game:start', () => {
  console.log('Game started!');
});
```

## API Reference

For complete API documentation, see the [Generated API Docs](../generated/).

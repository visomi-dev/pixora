---
title: State Module
description: Reactive state management
---

The State module provides reactive state management using signals.

## Overview

Pixora's state system:

- Reactive signals
- Computed values
- State persistence
- Undo/redo support

## Creating State

```typescript
import { signal, computed } from 'pixora';

// Create a signal
const score = signal(0);

// Create computed value
const isHighScore = computed(() => score() >= 1000);

// Update state
score.set(100);
score.update((s) => s + 10);
```

## Reactive Effects

Run code when state changes:

```typescript
import { effect } from 'pixora';

effect(() => {
  console.log('Score:', score());
});
```

## State Persistence

Persist state to storage:

```typescript
import { persist, StorageAdapter } from 'pixora';

const settings = persist(
  'settings',
  {
    sound: true,
    music: true,
    volume: 0.8,
  },
  new LocalStorageAdapter(),
);
```

## API Reference

For complete API documentation, see the [Generated API Docs](/docs/api/generated/).

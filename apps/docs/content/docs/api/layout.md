---
title: Layout Module
description: Layout and positioning system
---

The Layout module provides layout managers for arranging UI elements.

## Overview

Pixora's layout system includes:

- Anchor positioning
- Grid layouts
- Flexbox-like layouts
- Responsive layouts

## Anchor Positioning

Position elements relative to their parent:

```typescript
import { Anchor } from 'pixora';

sprite.anchor = {
  x: Anchor.Center,
  y: Anchor.Middle,
};
```

## Layout Containers

Use layout containers to arrange children:

```typescript
import { Container, GridLayout, FlexLayout } from 'pixora';

const container = new Container();
container.layout = new FlexLayout({
  direction: 'row',
  gap: 10,
  align: 'center',
});
```

## Responsive Layouts

Create responsive UI that adapts to screen size:

```typescript
import { ResponsiveLayout } from 'pixora';

const layout = new ResponsiveLayout({
  mobile: { direction: 'column' },
  tablet: { direction: 'row' },
  desktop: { direction: 'row', gap: 20 },
});
```

## API Reference

For complete API documentation, see the [Generated API Docs](/docs/api/generated/).

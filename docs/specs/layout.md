# Layout Spec

## Goal

Provide declarative responsive placement for scene and component nodes.

## MVP layout strategies

- `fixed`
- `anchor`
- `stack`

## Layout API direction

```ts
type AnchorLayoutSpec = {
  horizontal: 'start' | 'center' | 'end';
  vertical: 'start' | 'center' | 'end';
  offsetX?: number;
  offsetY?: number;
};

type StackLayoutSpec = {
  direction: 'horizontal' | 'vertical';
  align?: 'start' | 'center' | 'end';
  gap?: number;
  padding?: number;
};

type BreakpointRule = {
  minWidth?: number;
  maxWidth?: number;
  override: LayoutSpec;
};

type LayoutSpec = AnchorLayoutSpec | StackLayoutSpec;

const logoLayout = layout.anchor({
  horizontal: 'center',
  vertical: 'start',
  offsetY: 48,
});

const menuLayout = layout.stack({
  direction: 'vertical',
  align: 'center',
  gap: 16,
  padding: 24,
});
```

Breakpoint rules are simple viewport-based overrides applied to a base `LayoutSpec`.

## Fixed layout

Use fixed layout when exact coordinates or dimensions are intentional.

Fields may include:

- `x`
- `y`
- `width`
- `height`
- `scale`

## Anchor layout

Use anchor layout to align a node relative to its parent or the viewport.

Fields may include:

- `horizontal`: `start | center | end`
- `vertical`: `start | center | end`
- `offsetX`
- `offsetY`
- `relativeWidth`
- `relativeHeight`
- `padding`

## Stack layout

Use stack layout to distribute child nodes in order.

Fields may include:

- `direction`: `horizontal | vertical`
- `gap`
- `align`
- `padding`
- `fitContent`

## Layout resolution rules

- root scene layouts resolve against viewport bounds;
- child layouts resolve against parent content bounds;
- layout recalculates on viewport change or explicit invalidation;
- layout never mutates state outside node bounds and transforms.

## Breakpoints

The MVP supports simple breakpoint overrides for compact versus wide layouts.

The first implementation only needs enough for portrait mobile and wider desktop screens.

## MVP deliverables

- centered menu composition;
- top-aligned HUD;
- bottom-pinned buttons;
- vertical and horizontal stacks;
- reliable recalculation on resize.

# Input Spec

## Goal

Provide a thin abstraction over Pixi pointer interaction so buttons and interactive nodes behave consistently.

## Responsibilities

- normalize pointer over, out, down, up, and tap or click behavior;
- represent enabled, disabled, hovered, and pressed states;
- expose simple callbacks for interactive components;
- optionally forward UI events to the event bus.

## Interaction state

```ts
type ButtonState = 'idle' | 'hovered' | 'pressed' | 'disabled';

type InteractionState = {
  hovered: boolean;
  pressed: boolean;
  disabled: boolean;
};
```

## API direction

```ts
bindInteractive(node, {
  enabled: true,
  onHoverChange: (hovered) => {},
  onPressStart: () => {},
  onPressEnd: () => {},
  onPress: () => {},
});
```

## Behavior rules

- disabled nodes ignore press actions;
- hover feedback is optional and should not be required on touch-only devices;
- press callbacks fire only when the interaction completes in a valid state;
- input cleanup is automatic on node destroy.

## MVP deliverables

- button hover and pressed states;
- disabled buttons;
- click or tap handling;
- event forwarding for menu and overlay controls.

# Events Spec

## Goal

Provide typed transient communication between modules without direct coupling.

## Event model

The event bus is generic over an event map.

```ts
type EventMap = Record<string, unknown>;

type EventBus<Events extends EventMap> = {
  emit<K extends keyof Events>(event: K, payload: Events[K]): void;
  on<K extends keyof Events>(event: K, handler: (payload: Events[K]) => void): Disposable;
  once<K extends keyof Events>(event: K, handler: (payload: Events[K]) => void): Disposable;
  clear(): void;
};

declare function createEventBus<Events extends EventMap>(): EventBus<Events>;
```

## Naming rules

- use dot notation;
- namespace by domain or UI area;
- keep names stable and descriptive.

Examples:

- `scene.changed`
- `button.clicked`
- `menu.playRequested`
- `player.moved`
- `order.served`

## Behavior rules

- emit is synchronous in MVP;
- handlers run in subscription order;
- exceptions in handlers should surface clearly in development;
- once-handlers dispose themselves after the first invocation.

## Usage guidance

- use events for actions, notifications, and domain occurrences;
- do not use events to hold current state;
- prefer stores when consumers need the latest persistent value.

## MVP deliverables

- typed publish and subscribe;
- once subscriptions;
- disposable cleanup;
- clear event naming conventions in docs and example app.

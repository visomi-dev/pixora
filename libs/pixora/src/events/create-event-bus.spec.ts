import { vi } from 'vitest';

import { createEventBus } from './create-event-bus';

describe('createEventBus', () => {
  it('emits events to subscribers', () => {
    const bus = createEventBus<{
      test: { value: number };
    }>();
    const spy = vi.fn();

    bus.on('test', spy);
    bus.emit('test', { value: 42 });

    expect(spy).toHaveBeenCalledWith({ value: 42 });
  });

  it('supports one-time subscriptions', () => {
    const bus = createEventBus<{
      ping: undefined;
    }>();
    const spy = vi.fn();

    bus.once('ping', spy);
    bus.emit('ping', undefined);
    bus.emit('ping', undefined);

    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('allows subscription disposal', () => {
    const bus = createEventBus<{
      ping: undefined;
    }>();
    const spy = vi.fn();

    const sub = bus.on('ping', spy);
    sub.dispose();
    bus.emit('ping', undefined);

    expect(spy).not.toHaveBeenCalled();
  });
});

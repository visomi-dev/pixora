import { createEventBus } from './events/create-event-bus';
import { layout } from './layout/layout';
import { createStore, signal } from './state/signal';

describe('pixyn phase 1 scaffold', () => {
  it('updates signals synchronously', () => {
    const phase = signal('foundation');

    phase.set('phase-1');

    expect(phase.get()).toBe('phase-1');
  });

  it('emits typed events', () => {
    const bus = createEventBus<{
      'phase.changed': { step: string };
    }>();
    const seen: string[] = [];

    bus.on('phase.changed', (payload) => {
      seen.push(payload.step);
    });

    bus.emit('phase.changed', { step: 'package-foundation' });

    expect(seen).toEqual(['package-foundation']);
  });

  it('creates stores and layout specs', () => {
    const store = createStore({ ready: false });
    const stack = layout.stack({
      align: 'center',
      direction: 'vertical',
      gap: 16,
    });

    store.patch({ ready: true });

    expect(store.get().ready).toBe(true);
    expect(stack.type).toBe('stack');
  });
});

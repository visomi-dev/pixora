import { Container } from 'pixi.js';

import { bindInteractive } from './interaction';

describe('bindInteractive', () => {
  it('returns a disposable when called', () => {
    const container = new Container();
    const result = bindInteractive(container, {});
    expect(result).toBeDefined();
    expect(typeof result.dispose).toBe('function');
    container.destroy();
  });

  it('does not throw when called with empty config', () => {
    const container = new Container();
    expect(() => bindInteractive(container, {})).not.toThrow();
    container.destroy();
  });

  it('does not throw when called with disabled', () => {
    const container = new Container();
    expect(() => bindInteractive(container, { disabled: true })).not.toThrow();
    container.destroy();
  });

  it('dispose can be called', () => {
    const container = new Container();
    const binding = bindInteractive(container, {});
    expect(() => binding.dispose()).not.toThrow();
    container.destroy();
  });

  it('dispose is idempotent', () => {
    const container = new Container();
    const binding = bindInteractive(container, {});
    binding.dispose();
    expect(() => binding.dispose()).not.toThrow();
    container.destroy();
  });
});

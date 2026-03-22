import { Container } from 'pixi.js';

import { ScrollBox } from './scroll-box';

describe('ScrollBox', () => {
  it('creates a scroll box with default options', () => {
    const scrollBox = new ScrollBox();

    expect(scrollBox.displayObject).toBeInstanceOf(Container);
    expect(scrollBox.displayObject.eventMode).toBe('static');

    scrollBox.destroy();
  });

  it('creates a scroll box with explicit dimensions', () => {
    const scrollBox = new ScrollBox({ width: 200, height: 300 });

    expect(scrollBox.displayObject.width).toBe(200);
    expect(scrollBox.displayObject.height).toBe(300);

    scrollBox.destroy();
  });

  it('applies props via onPropsChanged', () => {
    const scrollBox = new ScrollBox({ width: 100, height: 100 });

    scrollBox.updateProps({ width: 200, height: 200 });

    expect(scrollBox.displayObject.width).toBe(200);
    expect(scrollBox.displayObject.height).toBe(200);

    scrollBox.destroy();
  });

  it('addChild does not throw', () => {
    const scrollBox = new ScrollBox({ width: 100, height: 100 });
    const child = { displayObject: new Container(), destroy: vi.fn(), children: new Set() } as unknown as Parameters<
      typeof scrollBox.addChild
    >[0];

    expect(() => scrollBox.addChild(child)).not.toThrow();
    scrollBox.destroy();
  });

  it('removeChild does not throw when child is in tracking', () => {
    const scrollBox = new ScrollBox({ width: 100, height: 100 });
    const child = { displayObject: new Container() } as Parameters<typeof scrollBox.addChild>[0];

    scrollBox.addChild(child);
    expect(() => scrollBox.removeChild(child)).not.toThrow();

    scrollBox.destroy();
  });

  it('removeChild returns early if child not found', () => {
    const scrollBox = new ScrollBox({ width: 100, height: 100 });
    const child = { displayObject: new Container() } as unknown as Parameters<typeof scrollBox.removeChild>[0];

    expect(() => scrollBox.removeChild(child)).not.toThrow();

    scrollBox.destroy();
  });
});

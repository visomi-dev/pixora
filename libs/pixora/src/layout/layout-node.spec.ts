import { Container } from 'pixi.js';

import { Layout } from './layout-node';

describe('Layout', () => {
  it('creates a layout with a target container', () => {
    const container = new Container();
    const layout = new Layout({ target: container });

    expect(layout.target).toBe(container);
    expect(layout.destroyed).toBe(false);

    layout.destroy();
    container.destroy();
  });

  it('has default style objects', () => {
    const container = new Container();
    const layout = new Layout({ target: container });

    expect(Layout.defaultStyle).toBeDefined();
    expect(Layout.defaultStyle.leaf).toBeDefined();
    expect(Layout.defaultStyle.container).toBeDefined();
    expect(Layout.defaultStyle.shared).toBeDefined();

    layout.destroy();
    container.destroy();
  });

  it('tracks modification count', () => {
    const container = new Container();
    const layout = new Layout({ target: container });

    expect(layout._modificationCount).toBe(0);

    layout.setStyle({});
    expect(layout._modificationCount).toBe(1);

    layout.setStyle({});
    expect(layout._modificationCount).toBe(2);

    layout.destroy();
    container.destroy();
  });

  it('setStyle marks layout as dirty', () => {
    const container = new Container();
    const layout = new Layout({ target: container });

    expect(layout._isDirty).toBe(false);

    layout.setStyle({ width: 100 });

    expect(layout._isDirty).toBe(true);

    layout.destroy();
    container.destroy();
  });

  it('setStyle marks forceUpdate when tracked style keys change', () => {
    const container = new Container();
    const layout = new Layout({ target: container });

    layout.setStyle({ borderRadius: 4 });

    expect(layout._forceUpdate).toBe(true);

    layout.destroy();
    container.destroy();
  });

  it('forceUpdate sets the forceUpdate flag', () => {
    const container = new Container();
    const layout = new Layout({ target: container });

    layout.forceUpdate();

    expect(layout._forceUpdate).toBe(true);

    layout.destroy();
    container.destroy();
  });

  it('invalidateRoot does not throw', () => {
    const container = new Container();
    const layout = new Layout({ target: container });

    expect(() => layout.invalidateRoot()).not.toThrow();

    layout.destroy();
    container.destroy();
  });

  it('destroy marks layout as destroyed', () => {
    const container = new Container();
    const layout = new Layout({ target: container });

    layout.destroy();

    expect(layout.destroyed).toBe(true);
    expect(layout._style).toBeNull();
    expect(layout._computedLayout).toBeNull();
    expect(layout._computedPixiLayout).toBeNull();

    container.destroy();
  });

  it('destroy is idempotent', () => {
    const container = new Container();
    const layout = new Layout({ target: container });

    layout.destroy();
    expect(() => layout.destroy()).not.toThrow();
  });

  it('style getter returns the current style', () => {
    const container = new Container();
    const layout = new Layout({ target: container });

    layout.setStyle({ width: 200 });

    expect(layout.style).toBeDefined();
    expect(layout.style.width).toBe(200);

    layout.destroy();
    container.destroy();
  });

  it('computedLayout and computedPixiLayout are accessible', () => {
    const container = new Container();
    const layout = new Layout({ target: container });

    expect(layout.computedLayout).toBeDefined();
    expect(layout.computedPixiLayout).toBeDefined();

    layout.destroy();
    container.destroy();
  });

  describe('getRoot', () => {
    it('returns target when has no parent', () => {
      const container = new Container();
      const layout = new Layout({ target: container });

      const root = layout.getRoot();

      expect(root).toBe(container);

      layout.destroy();
      container.destroy();
    });

    it('traverses up parent hierarchy when _layout exists', () => {
      const parentContainer = new Container();
      const childContainer = new Container();
      parentContainer.addChild(childContainer);

      const childLayout = new Layout({ target: childContainer });
      (parentContainer as any)._layout = new Layout({ target: parentContainer });
      childLayout.hasParent = true;

      const root = childLayout.getRoot();

      expect(root).toBe(parentContainer);

      childLayout.destroy();
      (parentContainer as any)._layout?.destroy();
      parentContainer.destroy();
      childContainer.destroy();
    });

    it('stops traversal when parent has no _layout', () => {
      const parentContainer = new Container();
      const childContainer = new Container();
      parentContainer.addChild(childContainer);

      const childLayout = new Layout({ target: childContainer });
      childLayout.hasParent = true;

      const root = childLayout.getRoot();

      expect(root).toBe(childContainer);

      childLayout.destroy();
      parentContainer.destroy();
      childContainer.destroy();
    });
  });

  describe('invalidateRoot', () => {
    it('marks root container as dirty when not destroyed', () => {
      const container = new Container() as any;
      const layout = new Layout({ target: container });

      layout.invalidateRoot();

      expect(container._isDirty).toBe(true);

      layout.destroy();
      container.destroy();
    });

    it('throws when called on destroyed layout with null target', () => {
      const container = new Container();
      const layout = new Layout({ target: container });
      layout.destroy();

      expect(() => layout.invalidateRoot()).toThrow();

      container.destroy();
    });
  });
});

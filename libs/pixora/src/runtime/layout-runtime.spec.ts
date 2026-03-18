import { Container } from 'pixi.js';

import { BaseNode } from '../components/base-node';
import { layout } from '../layout/layout';

import { runLayout } from './layout-runtime';

describe('runLayout', () => {
  const viewport = { aspectRatio: 2, height: 100, orientation: 'landscape' as const, width: 200 };

  const createMockContainer = (width = 0, height = 0): Container => {
    const container = new Container();

    Object.defineProperty(container, 'width', {
      configurable: true,
      get: () => width,
      set: (value) => {
        width = value;
      },
    });

    Object.defineProperty(container, 'height', {
      configurable: true,
      get: () => height,
      set: (value) => {
        height = value;
      },
    });

    return container;
  };

  it('resolves nested percent layouts against parent bounds', () => {
    const root = new BaseNode(createMockContainer());
    const parent = new BaseNode(createMockContainer());
    const child = new BaseNode(createMockContainer(40, 20));

    parent.layout = layout.percent({ height: 1, width: 1 });
    child.layout = layout.percent({ horizontal: 'center', vertical: 'center' });

    root.addChild(parent);
    parent.addChild(child);

    runLayout(root, viewport);

    expect(parent.displayObject.width).toBe(200);
    expect(parent.displayObject.height).toBe(100);
    expect(child.displayObject.x).toBe(80);
    expect(child.displayObject.y).toBe(40);
  });

  it('uses parent cross-axis size for auto-sized flex containers', () => {
    const root = new BaseNode(createMockContainer());
    const parent = new BaseNode(createMockContainer());
    const stack = new BaseNode(createMockContainer());
    const child = new BaseNode(createMockContainer(40, 20));

    parent.layout = layout.percent({ horizontal: 'center', vertical: 'center', width: 1 });
    stack.layout = layout.flex({ align: 'center', direction: 'vertical', gap: 10 });

    root.addChild(parent);
    parent.addChild(stack);
    stack.addChild(child);

    runLayout(root, viewport);

    expect(stack.displayObject.width).toBe(200);
    expect(stack.displayObject.height).toBe(20);
    expect(child.displayObject.x).toBe(80);
    expect(child.displayObject.y).toBe(0);
  });
});

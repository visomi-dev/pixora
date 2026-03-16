import { Container } from 'pixi.js';

import { BaseNode } from '../components/base-node';

import { applyLayout } from './apply-layout';
import { layout } from './layout';

describe('applyLayout', () => {
  const parentBounds = { height: 100, width: 200, x: 0, y: 0 };
  const viewport = { aspectRatio: 16 / 9, height: 720, orientation: 'landscape' as const, width: 1280 };

  const createMockContainer = (width: number, height: number): Container => {
    const container = new Container();
    Object.defineProperty(container, 'width', {
      get: () => width,
      set: (v) => {
        width = v;
      },
      configurable: true,
    });
    Object.defineProperty(container, 'height', {
      get: () => height,
      set: (v) => {
        height = v;
      },
      configurable: true,
    });
    return container;
  };

  describe('fixed layout', () => {
    it('applies exact coordinates and dimensions', () => {
      const node = new BaseNode(createMockContainer(10, 10));

      applyLayout(node, layout.fixed({ height: 40, scale: 2, width: 80, x: 10, y: 20 }), parentBounds, viewport);

      expect(node.displayObject.x).toBe(10);
      expect(node.displayObject.y).toBe(20);
      expect((node.displayObject as unknown as { width: number }).width).toBe(80);
      expect((node.displayObject as unknown as { height: number }).height).toBe(40);
      expect(node.displayObject.scale.x).toBe(2);
    });
  });

  describe('anchor layout', () => {
    it('centers within parent bounds', () => {
      const node = new BaseNode(createMockContainer(10, 10));

      applyLayout(node, layout.anchor({ horizontal: 'center', vertical: 'center' }), parentBounds, viewport);

      expect(node.displayObject.x).toBe(95);
      expect(node.displayObject.y).toBe(45);
    });

    it('anchors to the end with offsets', () => {
      const node = new BaseNode(createMockContainer(10, 10));

      applyLayout(
        node,
        layout.anchor({ horizontal: 'end', offsetX: -5, offsetY: 5, vertical: 'end' }),
        parentBounds,
        viewport,
      );

      expect(node.displayObject.x).toBe(185);
      expect(node.displayObject.y).toBe(95);
    });

    it('resolves relative sizes', () => {
      const node = new BaseNode(createMockContainer(10, 10));

      applyLayout(
        node,
        layout.anchor({ horizontal: 'start', relativeHeight: 0.5, relativeWidth: 1, vertical: 'start' }),
        parentBounds,
        viewport,
      );

      expect((node.displayObject as unknown as { width: number }).width).toBe(200);
      expect((node.displayObject as unknown as { height: number }).height).toBe(50);
    });
  });

  describe('stack layout', () => {
    it('distributes children vertically', () => {
      const node = new BaseNode(createMockContainer(50, 50));
      const child1 = new BaseNode(createMockContainer(50, 20));
      const child2 = new BaseNode(createMockContainer(60, 30));

      node.addChild(child1);
      node.addChild(child2);

      applyLayout(
        node,
        layout.stack({ align: 'start', direction: 'vertical', gap: 10, padding: 5 }),
        parentBounds,
        viewport,
      );

      expect(child1.displayObject.y).toBe(5);
      expect(child2.displayObject.y).toBe(35);
    });

    it('fits content automatically', () => {
      const node = new BaseNode(createMockContainer(0, 0));
      const child = new BaseNode(createMockContainer(40, 40));
      node.addChild(child);

      applyLayout(
        node,
        layout.stack({ direction: 'horizontal', fitContent: true, padding: 10 }),
        parentBounds,
        viewport,
      );

      expect((node.displayObject as unknown as { width: number }).width).toBe(60);
      expect((node.displayObject as unknown as { height: number }).height).toBe(60);
    });
  });

  describe('breakpoints', () => {
    it('applies override when viewport matches', () => {
      const node = new BaseNode(createMockContainer(10, 10));

      applyLayout(
        node,
        {
          ...layout.fixed({ width: 100 }),
          breakpoints: [
            {
              minWidth: 1000,
              override: layout.fixed({ width: 200 }),
            },
          ],
        },
        parentBounds,
        viewport,
      );

      expect((node.displayObject as unknown as { width: number }).width).toBe(200);
    });
  });
});

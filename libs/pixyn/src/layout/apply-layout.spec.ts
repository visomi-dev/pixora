import { applyLayout } from './apply-layout';
import { layout } from './layout';

import { Container } from 'pixi.js';

import { BaseNode } from '../components/base-node';

describe('applyLayout', () => {
  let node: BaseNode;
  const parentBounds = { height: 100, width: 200, x: 0, y: 0 };
  const viewport = { aspectRatio: 16 / 9, height: 720, orientation: 'landscape' as const, width: 1280 };

  beforeEach(() => {
    node = new BaseNode(new Container());
    node.displayObject.width = 10;
    node.displayObject.height = 10;
  });

  describe('fixed layout', () => {
    it('applies exact coordinates and dimensions', () => {
      applyLayout(node, layout.fixed({ height: 40, scale: 2, width: 80, x: 10, y: 20 }), parentBounds, viewport);

      expect(node.displayObject.x).toBe(10);
      expect(node.displayObject.y).toBe(20);
      expect(node.displayObject.width).toBe(80);
      expect(node.displayObject.height).toBe(40);
      expect(node.displayObject.scale.x).toBe(2);
    });
  });

  describe('anchor layout', () => {
    it('centers within parent bounds', () => {
      applyLayout(node, layout.anchor({ horizontal: 'center', vertical: 'center' }), parentBounds, viewport);

      // parent width 200, node width 10 -> (200 - 10) / 2 = 95
      // parent height 100, node height 10 -> (100 - 10) / 2 = 45
      expect(node.displayObject.x).toBe(95);
      expect(node.displayObject.y).toBe(45);
    });

    it('anchors to the end with offsets', () => {
      applyLayout(
        node,
        layout.anchor({ horizontal: 'end', offsetX: -5, offsetY: 5, vertical: 'end' }),
        parentBounds,
        viewport,
      );

      // x = 200 - 10 - 5 = 185
      // y = 100 - 10 + 5 = 95
      expect(node.displayObject.x).toBe(185);
      expect(node.displayObject.y).toBe(95);
    });

    it('resolves relative sizes', () => {
      applyLayout(
        node,
        layout.anchor({ horizontal: 'start', relativeHeight: 0.5, relativeWidth: 1, vertical: 'start' }),
        parentBounds,
        viewport,
      );

      expect(node.displayObject.width).toBe(200); // 100% of parent width
      expect(node.displayObject.height).toBe(50); // 50% of parent height
    });
  });

  describe('stack layout', () => {
    it('distributes children vertically', () => {
      const child1 = new BaseNode(new Container());
      const child2 = new BaseNode(new Container());
      child1.displayObject.height = 20;
      child2.displayObject.height = 30;
      child1.displayObject.width = 50;
      child2.displayObject.width = 60;

      node.addChild(child1);
      node.addChild(child2);

      applyLayout(
        node,
        layout.stack({ align: 'start', direction: 'vertical', gap: 10, padding: 5 }),
        parentBounds,
        viewport,
      );

      // padding 5 -> child1 y = 5
      // child1 height 20 + gap 10 -> child2 y = 35
      expect(child1.displayObject.y).toBe(5);
      expect(child2.displayObject.y).toBe(35);
    });

    it('fits content automatically', () => {
      const child = new BaseNode(new Container());
      child.displayObject.width = 40;
      child.displayObject.height = 40;
      node.addChild(child);

      applyLayout(
        node,
        layout.stack({ direction: 'horizontal', fitContent: true, padding: 10 }),
        parentBounds,
        viewport,
      );

      // width: padding 10 + child 40 + padding 10 = 60
      // height: maxCrossSize 40 + padding 20 = 60
      expect(node.displayObject.width).toBe(60);
      expect(node.displayObject.height).toBe(60);
    });
  });

  describe('breakpoints', () => {
    it('applies override when viewport matches', () => {
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
        viewport, // viewport width is 1280
      );

      expect(node.displayObject.width).toBe(200);
    });
  });
});

import { Container, Sprite, Text } from 'pixi.js';
import { vi } from 'vitest';

import { Box } from '../components/box';
import { Button } from '../components/button';
import { ContainerNode } from '../components/container-node';
import { SpriteNode } from '../components/sprite-node';
import { TextNode } from '../components/text-node';
import { layout } from '../layout/layout';
import * as layoutRuntime from './layout-runtime';

import { applyCommonProps, createHostTypeRegistry } from './host-types';

describe('createHostTypeRegistry', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns a registry with all five host types', () => {
    const registry = createHostTypeRegistry();

    expect(registry.container).toBeDefined();
    expect(registry.text).toBeDefined();
    expect(registry.sprite).toBeDefined();
    expect(registry.box).toBeDefined();
    expect(registry.button).toBeDefined();
  });

  describe('container descriptor', () => {
    it('creates a ContainerNode', () => {
      const registry = createHostTypeRegistry();
      const node = registry.container.create({});

      expect(node).toBeInstanceOf(ContainerNode);
      expect(node.displayObject).toBeInstanceOf(Container);
    });

    it('applies common props on create', () => {
      const registry = createHostTypeRegistry();
      const node = registry.container.create({ x: 10, y: 20, alpha: 0.5 });

      expect(node.displayObject.x).toBe(10);
      expect(node.displayObject.y).toBe(20);
      expect(node.displayObject.alpha).toBe(0.5);
    });
  });

  describe('text descriptor', () => {
    it('creates a TextNode', () => {
      const registry = createHostTypeRegistry();
      const node = registry.text.create({ text: 'Hello' });

      expect(node).toBeInstanceOf(TextNode);
      expect(node.displayObject).toBeInstanceOf(Text);
      expect((node.displayObject as Text).text).toBe('Hello');
    });

    it('applies layout props to text nodes', () => {
      const setLayoutSpecSpy = vi.spyOn(layoutRuntime, 'setLayoutSpec');
      const registry = createHostTypeRegistry();
      const layoutSpec = layout.anchor({ horizontal: 'center', vertical: 'center' });
      const node = registry.text.create({
        layout: layoutSpec,
        text: 'Hello',
      });

      expect(setLayoutSpecSpy).toHaveBeenCalledWith(node, layoutSpec);
    });
  });

  describe('sprite descriptor', () => {
    it('creates a SpriteNode', () => {
      const registry = createHostTypeRegistry();
      const node = registry.sprite.create({});

      expect(node).toBeInstanceOf(SpriteNode);
      expect(node.displayObject).toBeInstanceOf(Sprite);
    });
  });

  describe('box descriptor', () => {
    it('creates a Box', () => {
      const registry = createHostTypeRegistry();
      const node = registry.box.create({ width: 100, height: 50 });

      expect(node).toBeInstanceOf(Box);
      expect(node.displayObject).toBeInstanceOf(Container);
    });
  });

  describe('button descriptor', () => {
    it('creates a Button', () => {
      const registry = createHostTypeRegistry();
      const node = registry.button.create({ label: 'Click' });

      expect(node).toBeInstanceOf(Button);
    });

    it('applies layout props to button nodes', () => {
      const setLayoutSpecSpy = vi.spyOn(layoutRuntime, 'setLayoutSpec');
      const registry = createHostTypeRegistry();
      const layoutSpec = layout.anchor({ horizontal: 'center', vertical: 'center' });
      const node = registry.button.create({
        label: 'Click',
        layout: layoutSpec,
        width: 120,
      });

      expect(setLayoutSpecSpy).toHaveBeenCalledWith(node, layoutSpec);
    });
  });
});

describe('applyCommonProps', () => {
  it('applies x and y', () => {
    const c = new Container();

    applyCommonProps(c, { x: 50, y: 100 });

    expect(c.x).toBe(50);
    expect(c.y).toBe(100);
  });

  it('applies alpha', () => {
    const c = new Container();

    applyCommonProps(c, { alpha: 0.3 });

    expect(c.alpha).toBeCloseTo(0.3);
  });

  it('applies visible', () => {
    const c = new Container();

    applyCommonProps(c, { visible: false });

    expect(c.visible).toBe(false);
  });

  it('applies numeric scale', () => {
    const c = new Container();

    applyCommonProps(c, { scale: 2 });

    expect(c.scale.x).toBe(2);
    expect(c.scale.y).toBe(2);
  });

  it('applies object scale', () => {
    const c = new Container();

    applyCommonProps(c, { scale: { x: 1.5, y: 2.5 } });

    expect(c.scale.x).toBe(1.5);
    expect(c.scale.y).toBe(2.5);
  });

  it('does not modify undefined props', () => {
    const c = new Container();

    c.x = 99;
    applyCommonProps(c, {});

    expect(c.x).toBe(99);
  });
});

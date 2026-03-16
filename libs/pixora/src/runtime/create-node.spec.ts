import { box, button, container, keyedContainer, sprite, text } from './create-node';

describe('node factories', () => {
  describe('container', () => {
    it('creates a container node with default props', () => {
      const node = container();

      expect(node.type).toBe('container');
      expect(node.props).toEqual({});
      expect(node.children).toEqual([]);
      expect(node.key).toBeUndefined();
    });

    it('creates a container node with props and children', () => {
      const child = text({ text: 'hello' });
      const node = container({ x: 10, y: 20 }, child, 'raw text');

      expect(node.type).toBe('container');
      expect(node.props).toEqual({ x: 10, y: 20 });
      expect(node.children).toHaveLength(2);
      expect(node.children[0]).toBe(child);
      expect(node.children[1]).toBe('raw text');
    });

    it('produces frozen objects', () => {
      const node = container();

      expect(Object.isFrozen(node)).toBe(true);
      expect(Object.isFrozen(node.children)).toBe(true);
    });
  });

  describe('keyedContainer', () => {
    it('creates a container node with a key', () => {
      const node = keyedContainer('item-1', { x: 5 });

      expect(node.type).toBe('container');
      expect(node.key).toBe('item-1');
      expect(node.props).toEqual({ x: 5 });
    });

    it('supports numeric keys', () => {
      const node = keyedContainer(0);

      expect(node.key).toBe(0);
    });
  });

  describe('text', () => {
    it('creates a text node', () => {
      const node = text({ text: 'Hello World' });

      expect(node.type).toBe('text');
      expect(node.props).toEqual({ text: 'Hello World' });
      expect(node.children).toEqual([]);
    });

    it('creates a text node with style', () => {
      const node = text({ text: 'styled', style: { fontSize: 24 } });

      expect(node.props).toEqual({ text: 'styled', style: { fontSize: 24 } });
    });
  });

  describe('sprite', () => {
    it('creates a sprite node with default props', () => {
      const node = sprite();

      expect(node.type).toBe('sprite');
      expect(node.props).toEqual({});
      expect(node.children).toEqual([]);
    });

    it('creates a sprite node with position', () => {
      const node = sprite({ x: 100, y: 200 });

      expect(node.props).toEqual({ x: 100, y: 200 });
    });
  });

  describe('box', () => {
    it('creates a box node with props', () => {
      const node = box({ width: 100, height: 50, backgroundColor: 0xff0000 });

      expect(node.type).toBe('box');
      expect(node.props).toEqual({ width: 100, height: 50, backgroundColor: 0xff0000 });
    });

    it('creates a box node with children', () => {
      const child = text({ text: 'inside' });
      const node = box({ width: 100, height: 50 }, child);

      expect(node.children).toHaveLength(1);
      expect(node.children[0]).toBe(child);
    });
  });

  describe('button', () => {
    it('creates a button node', () => {
      const onPress = () => undefined;
      const node = button({ label: 'Click', onPress });

      expect(node.type).toBe('button');
      expect(node.props).toEqual({ label: 'Click', onPress });
      expect(node.children).toEqual([]);
    });

    it('creates a button node with full props', () => {
      const node = button({
        backgroundColor: 0x00ff00,
        disabled: true,
        height: 48,
        label: 'Submit',
        radius: 8,
        width: 120,
      });

      expect(node.props).toEqual({
        backgroundColor: 0x00ff00,
        disabled: true,
        height: 48,
        label: 'Submit',
        radius: 8,
        width: 120,
      });
    });
  });
});

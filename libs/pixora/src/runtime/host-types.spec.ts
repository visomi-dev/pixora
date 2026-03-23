import { Container, Sprite, Text } from 'pixi.js';

import { ContainerNode } from '../components/container-node';
import { SpriteNode } from '../components/sprite-node';
import { TextNode } from '../components/text-node';

import { createHostTypeRegistry } from './host-types';

describe('createHostTypeRegistry', () => {
  it('creates container, text, and sprite descriptors', () => {
    const registry = createHostTypeRegistry();

    expect(registry.container).toBeDefined();
    expect(registry.text).toBeDefined();
    expect(registry.sprite).toBeDefined();
  });

  it('creates a styled container node', () => {
    const node = createHostTypeRegistry().container.create({
      label: 'MenuContainer',
      style: { backgroundColor: 0xff0000, cursor: 'pointer', opacity: 0.5 },
    });

    expect(node).toBeInstanceOf(ContainerNode);
    expect(node.displayObject).toBeInstanceOf(Container);
    expect(node.displayObject.alpha).toBe(0.5);
    expect(node.displayObject.cursor).toBe('pointer');
    expect(node.displayObject.label).toBe('MenuContainer');
  });

  it('creates a text node with content', () => {
    const node = createHostTypeRegistry().text.create({ content: 'Hello', style: { color: '#fff' } });

    expect(node).toBeInstanceOf(TextNode);
    expect(node.displayObject).toBeInstanceOf(Text);
    expect((node.displayObject as Text).text).toBe('Hello');
  });

  it('creates a sprite node', () => {
    const node = createHostTypeRegistry().sprite.create({ asset: '/ship.png' });

    expect(node).toBeInstanceOf(SpriteNode);
    expect(node.displayObject).toBeInstanceOf(Sprite);
  });
});

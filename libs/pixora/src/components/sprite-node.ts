import { Sprite, Texture } from 'pixi.js';

import { BaseNode } from './base-node';

export type SpriteNodeOptions = {
  texture?: Texture;
};

export class SpriteNode extends BaseNode<Sprite> {
  constructor(options: SpriteNodeOptions = {}) {
    super(new Sprite(options.texture ?? Texture.EMPTY));
  }
}

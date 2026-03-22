import { Sprite, Texture } from 'pixi.js';

import { BaseNode } from './base-node';

export type SpriteNodeOptions = {
  alpha?: number;
  texture?: Texture;
  x?: number;
  y?: number;
};

export class SpriteNode extends BaseNode<Sprite> {
  constructor(options: SpriteNodeOptions = {}) {
    super(new Sprite(options.texture ?? Texture.EMPTY));
  }

  updateProps(next: Partial<SpriteNodeOptions>): this {
    if (next.texture !== undefined) {
      this.displayObject.texture = next.texture;
    }
    if (next.alpha !== undefined) {
      this.displayObject.alpha = next.alpha;
    }
    if (next.x !== undefined) {
      this.displayObject.x = next.x;
    }
    if (next.y !== undefined) {
      this.displayObject.y = next.y;
    }
    return this;
  }
}

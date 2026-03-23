import { Sprite, Texture } from 'pixi.js';

import { BaseComponent } from './base-component';

import type { PixoraStyle } from '../layout/layout-types';

export type SpriteNodeOptions = {
  asset?: string;
  style?: PixoraStyle;
  texture?: Texture;
};

export class SpriteNode extends BaseComponent<SpriteNodeOptions, Sprite> {
  constructor(options: SpriteNodeOptions = {}) {
    super(new Sprite(resolveTexture(options)), options);
    this.onPropsChanged();
  }

  protected override onPropsChanged(): void {
    this.displayObject.texture = resolveTexture(this.props);
    this.displayObject.alpha = this.props.style?.opacity ?? 1;
    this.displayObject.visible = this.props.style?.visible ?? true;
  }
}

function resolveTexture(options: SpriteNodeOptions): Texture {
  if (options.texture) {
    return options.texture;
  }

  if (options.asset) {
    return Texture.from(options.asset);
  }

  return Texture.EMPTY;
}

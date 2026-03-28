import { Text, type TextStyleOptions } from 'pixi.js';

import { BaseComponent } from './base-component';

import type { PixoraStyle } from '../layout/layout-types';

export type TextNodeOptions = {
  content: string;
  style?: PixoraStyle;
};

export class TextNode extends BaseComponent<TextNodeOptions, Text> {
  constructor(options: TextNodeOptions) {
    super(
      new Text({
        style: buildTextStyle(options.style),
        text: options.content,
        resolution: 2,
      }),
      options,
    );
  }

  setContent(content: string): this {
    this.props = { ...this.props, content };
    this.displayObject.text = content;

    return this;
  }

  protected override onPropsChanged(): void {
    this.displayObject.text = this.props.content;
    this.displayObject.style = buildTextStyle(this.props.style);
    this.displayObject.alpha = this.props.style?.opacity ?? 1;
    this.displayObject.visible = this.props.style?.visible ?? true;
  }
}

function buildTextStyle(style: PixoraStyle | undefined): Partial<TextStyleOptions> {
  return {
    align: style?.align,
    fill: style?.color,
    fontFamily: style?.fontFamily,
    fontSize: style?.fontSize,
    fontWeight: style?.fontWeight as TextStyleOptions['fontWeight'] | undefined,
  };
}

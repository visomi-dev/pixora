import { Text, type TextStyleOptions } from 'pixi.js';

import { BaseComponent } from './base-component';

export type TextNodeOptions = {
  style?: Partial<TextStyleOptions>;
  text: string;
};

export class TextNode extends BaseComponent<TextNodeOptions, Text> {
  constructor(options: TextNodeOptions) {
    super(
      new Text({
        style: options.style,
        text: options.text,
        resolution: 2,
      }),
      options,
    );
  }

  setText(text: string): this {
    this.props = { ...this.props, text };
    this.displayObject.text = text;

    return this;
  }

  protected override onPropsChanged(): void {
    this.displayObject.text = this.props.text;
  }
}

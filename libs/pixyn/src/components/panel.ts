import { Container, Graphics } from 'pixi.js';

import { BaseComponent } from './base-component';

export type PanelOptions = {
  alpha?: number;
  backgroundColor?: number;
  height?: number;
  radius?: number;
  width?: number;
};

export class Panel extends BaseComponent<PanelOptions, Container> {
  private readonly background = new Graphics();

  constructor(options: PanelOptions = {}) {
    super(new Container(), options);
    this.displayObject.addChild(this.background);
    this.onPropsChanged();
  }

  protected override onPropsChanged(): void {
    this.displayObject.alpha = this.props.alpha ?? 1;

    const width = this.props.width ?? 0;
    const height = this.props.height ?? 0;
    const radius = this.props.radius ?? 0;
    const backgroundColor = this.props.backgroundColor ?? 0xffffff;

    this.background.clear();

    if (width > 0 && height > 0) {
      if (radius > 0) {
        this.background.roundRect(0, 0, width, height, radius);
      } else {
        this.background.rect(0, 0, width, height);
      }

      this.background.fill(backgroundColor);
    }
  }
}

import { Container, Graphics, Rectangle } from 'pixi.js';

import { BaseComponent } from './base-component';

import type { PixoraStyle } from '../layout/layout-types';

type ContainerNodeOptions = {
  style?: PixoraStyle;
};

export class ContainerNode extends BaseComponent<ContainerNodeOptions, Container> {
  private readonly background = new Graphics();

  constructor(options: ContainerNodeOptions = {}) {
    super(new Container(), options);
    this.installSizeAccessors();
    this.displayObject.addChild(this.background);
    this.onPropsChanged();
  }

  override addChild(child: import('./base-node').BaseNode): this {
    this.children.add(child);
    this.displayObject.addChild(child.displayObject);

    return this;
  }

  protected override onPropsChanged(): void {
    this.displayObject.alpha = this.props.style?.opacity ?? 1;
    this.displayObject.visible = this.props.style?.visible ?? true;
    this.redrawBackground();
  }

  override setLayoutSize(width: number, height: number): this {
    super.setLayoutSize(width, height);
    this.redrawBackground();

    return this;
  }

  protected override applyLayoutSize(width: number, height: number): void {
    this.displayObject.boundsArea = new Rectangle(0, 0, width, height);
    this.displayObject.hitArea = new Rectangle(0, 0, width, height);
  }

  private installSizeAccessors(): void {
    Object.defineProperty(this.displayObject, 'width', {
      configurable: true,
      get: () => this.layoutWidth ?? this.displayObject.getLocalBounds().width,
      set: (value: number) => {
        this.setLayoutSize(value, this.getLayoutHeight());
      },
    });

    Object.defineProperty(this.displayObject, 'height', {
      configurable: true,
      get: () => this.layoutHeight ?? this.displayObject.getLocalBounds().height,
      set: (value: number) => {
        this.setLayoutSize(this.getLayoutWidth(), value);
      },
    });
  }

  private redrawBackground(): void {
    const backgroundColor = this.props.style?.backgroundColor;
    const borderRadius = this.props.style?.borderRadius ?? 0;
    const width = this.getLayoutWidth();
    const height = this.getLayoutHeight();

    this.background.clear();

    if (width <= 0 || height <= 0) {
      return;
    }

    if (borderRadius > 0) {
      this.background.roundRect(0, 0, width, height, borderRadius);
    } else {
      this.background.rect(0, 0, width, height);
    }

    this.background.fill(
      backgroundColor === undefined ? { alpha: 0, color: 0xffffff } : { alpha: 1, color: backgroundColor },
    );
  }
}

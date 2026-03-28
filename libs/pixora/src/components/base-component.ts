import { BaseNode } from './base-node';

import type { Container } from 'pixi.js';


export class BaseComponent<
  Props extends object,
  TDisplayObject extends Container = Container,
> extends BaseNode<TDisplayObject> {
  constructor(
    displayObject: TDisplayObject,
    protected props: Props,
  ) {
    super(displayObject);
  }

  getProps(): Props {
    return this.props;
  }

  updateProps(next: Partial<Props>): this {
    this.props = { ...this.props, ...next };
    this.onPropsChanged();

    return this;
  }

  protected onPropsChanged(): void {
    return;
  }
}

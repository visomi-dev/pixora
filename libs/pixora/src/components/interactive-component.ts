import type { Container } from 'pixi.js';

import { bindInteractive, type BindInteractiveOptions } from '../input/bind-interactive';
import type { Disposable } from '../utils/disposable';

import { BaseComponent } from './base-component';

type InteractiveProps = {
  disabled?: boolean;
};

export class InteractiveComponent<
  Props extends InteractiveProps,
  TDisplayObject extends Container = Container,
> extends BaseComponent<Props, TDisplayObject> {
  private interactionBinding?: Disposable;

  setDisabled(disabled: boolean): this {
    this.props = { ...this.props, disabled };
    this.displayObject.eventMode = disabled ? 'none' : 'static';
    this.displayObject.cursor = disabled ? 'default' : 'pointer';
    this.displayObject.alpha = disabled ? 0.5 : 1;

    return this;
  }

  protected bindInteraction(options: Omit<BindInteractiveOptions, 'enabled'>): void {
    this.interactionBinding?.dispose();
    this.interactionBinding = this.addDisposable(
      bindInteractive(this.displayObject, {
        ...options,
        enabled: !this.props.disabled,
      }),
    );
  }

  protected override onPropsChanged(): void {
    this.setDisabled(this.props.disabled ?? false);
  }
}

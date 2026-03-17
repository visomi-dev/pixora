import type { Container } from 'pixi.js';

import type { Disposable } from '../utils/disposable';
import type { LayoutStyles } from '../layout/layout-types';
import type { LayoutSpec } from '../layout/layout';
import { setLayoutSpec, setLayoutStyles, markSubtreeLayoutDirty, getLayoutStyles } from '../runtime/layout-runtime';

export class BaseNode<TDisplayObject extends Container = Container> implements Disposable {
  protected readonly children = new Set<BaseNode>();
  protected readonly disposables = new Set<Disposable>();
  protected _layout: LayoutStyles | LayoutSpec | null = null;

  constructor(public readonly displayObject: TDisplayObject) {}

  get layout(): LayoutStyles | LayoutSpec | null {
    return this._layout;
  }

  set layout(value: LayoutStyles | LayoutSpec | null) {
    if (this._layout === value) {
      return;
    }

    this._layout = value;

    if (value && typeof value === 'object' && 'type' in value) {
      setLayoutSpec(this, value as LayoutSpec);
    } else if (value && typeof value === 'object') {
      setLayoutStyles(this, value as LayoutStyles);
    } else {
      setLayoutSpec(this, null);
      setLayoutStyles(this, null);
    }

    markSubtreeLayoutDirty(this);
  }

  get layoutStyles(): LayoutStyles | null {
    return getLayoutStyles(this);
  }

  addChild(child: BaseNode): this {
    this.children.add(child);
    this.displayObject.addChild(child.displayObject);

    return this;
  }

  addDisposable(disposable: Disposable): Disposable {
    this.disposables.add(disposable);

    return disposable;
  }

  destroy(): void {
    for (const child of this.children) {
      child.destroy();
    }

    for (const disposable of this.disposables) {
      disposable.dispose();
    }

    this.children.clear();
    this.disposables.clear();
    this.displayObject.destroy({ children: true });
  }

  dispose(): void {
    this.destroy();
  }

  getChildren(): readonly BaseNode[] {
    return Array.from(this.children);
  }

  removeChild(child: BaseNode): this {
    if (!this.children.has(child)) {
      return this;
    }

    this.children.delete(child);
    this.displayObject.removeChild(child.displayObject);

    return this;
  }

  setVisible(visible: boolean): this {
    this.displayObject.visible = visible;

    return this;
  }
}

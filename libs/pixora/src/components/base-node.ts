import { setLayoutSpec, setLayoutStyles, markSubtreeLayoutDirty, getLayoutStyles } from '../runtime/layout-runtime';
import { applyPixiLayout } from '../layout/translate-to-pixi-layout';

import type { Container } from 'pixi.js';
import type { Disposable } from '../utils/disposable';
import type { LayoutStyles } from '../layout/layout-types';
import type { LayoutSpec } from '../layout/layout';

export class BaseNode<TDisplayObject extends Container = Container> implements Disposable {
  protected readonly children = new Set<BaseNode>();
  protected readonly disposables = new Set<Disposable>();
  protected _layout: LayoutStyles | LayoutSpec | null = null;
  protected layoutWidth: number | null = null;
  protected layoutHeight: number | null = null;

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
      applyPixiLayout(this.displayObject, null);
    } else if (value && typeof value === 'object') {
      setLayoutStyles(this, value as LayoutStyles);
      applyPixiLayout(this.displayObject, value as LayoutStyles);
    } else {
      setLayoutSpec(this, null);
      setLayoutStyles(this, null);
      applyPixiLayout(this.displayObject, null);
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

  getLayoutHeight(): number {
    return this.layoutHeight ?? this.displayObject.height;
  }

  getLayoutWidth(): number {
    return this.layoutWidth ?? this.displayObject.width;
  }

  setLayoutPosition(x: number, y: number): this {
    this.displayObject.x = x;
    this.displayObject.y = y;

    return this;
  }

  setLayoutSize(width: number, height: number): this {
    this.layoutWidth = width;
    this.layoutHeight = height;
    this.applyLayoutSize(width, height);

    return this;
  }

  protected applyLayoutSize(width: number, height: number): void {
    this.displayObject.width = width;
    this.displayObject.height = height;
  }

  setVisible(visible: boolean): this {
    this.displayObject.visible = visible;

    return this;
  }
}

import type { Container } from 'pixi.js';

import type { Disposable } from '../utils/disposable';

export class BaseNode<TDisplayObject extends Container = Container> implements Disposable {
  protected readonly children = new Set<BaseNode>();
  protected readonly disposables = new Set<Disposable>();

  constructor(public readonly displayObject: TDisplayObject) {}

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

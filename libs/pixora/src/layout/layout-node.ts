import type { Container } from 'pixi.js';
import type { ComputedLayout, ComputedPixiLayout } from './computed-layout';
import type { LayoutStyles } from './layout-types';

export type LayoutOptions = {
  target: Container;
};

export class Layout {
  public static defaultStyle: { container: LayoutStyles; leaf: LayoutStyles; shared: LayoutStyles } = {
    leaf: {
      width: 'intrinsic',
      height: 'intrinsic',
    },
    container: {
      width: 'auto',
      height: 'auto',
    },
    shared: {
      transformOrigin: '50%',
      objectPosition: 'center',
      flexShrink: 1,
      flexDirection: 'row',
      alignContent: 'stretch',
      flexWrap: 'nowrap',
      overflow: 'visible',
    },
  };

  public readonly target: Container;
  public destroyed = false;
  public _isDirty = false;
  public _forceUpdate = false;
  public hasParent = false;
  public _modificationCount = 0;

  public _computedPixiLayout: Required<ComputedPixiLayout> = {
    x: 0,
    y: 0,
    offsetX: 0,
    offsetY: 0,
    scaleX: 1,
    scaleY: 1,
    originX: 0,
    originY: 0,
  };

  public _computedLayout: ComputedLayout = {
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    width: 0,
    height: 0,
  };

  public _style: LayoutStyles = {};

  protected _trackedStyleKeys: (keyof LayoutStyles)[] = [
    'borderRadius',
    'borderWidth',
    'backgroundColor',
    'objectFit',
    'objectPosition',
    'transformOrigin',
    'isLeaf',
  ];

  constructor({ target }: LayoutOptions) {
    this.target = target;
  }

  public get style(): Readonly<LayoutStyles> {
    return this._style;
  }

  public get computedLayout(): Readonly<ComputedLayout> {
    return this._computedLayout;
  }

  public get computedPixiLayout(): Readonly<Required<ComputedPixiLayout>> {
    return this._computedPixiLayout;
  }

  public get realX(): number {
    return this.target.localTransform.tx;
  }

  public get realY(): number {
    return this.target.localTransform.ty;
  }

  public get realScaleX(): number {
    return this.target.localTransform.a;
  }

  public get realScaleY(): number {
    return this.target.localTransform.d;
  }

  public setStyle(style: Partial<LayoutStyles>): void {
    const mergedStyle = { ...this._style, ...style };
    const hasTrackedChanges = this._trackedStyleKeys.some(
      (key) => style[key] !== undefined && style[key] !== this._style[key],
    );

    this._style = mergedStyle;

    if (hasTrackedChanges) {
      this._forceUpdate = true;
    }

    this._isDirty = true;
    this._modificationCount++;
  }

  public invalidateRoot(start?: Container): void {
    const root = this.getRoot(start);
    if ((root as unknown as Layout).destroyed) return;

    (root as unknown as Layout)._isDirty = true;
    this._modificationCount++;
  }

  public forceUpdate(): void {
    this._forceUpdate = true;
  }

  public getRoot(start?: Container): Container {
    let root: Container | null = start || this.target;

    while (root?.parent) {
      const parent = root.parent as unknown as { _layout?: Layout };
      if (!parent._layout) break;
      root = root.parent;
    }

    return root!;
  }

  public destroy(): void {
    if (this.destroyed) return;
    this.destroyed = true;
    this._style = null!;
    this._computedPixiLayout = null!;
    this._computedLayout = null!;
    (this as unknown as { target: null }).target = null!;
    this.hasParent = false;
  }
}

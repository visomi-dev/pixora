import { Container, Graphics, FederatedPointerEvent, FederatedWheelEvent } from 'pixi.js';

import { BaseComponent } from './base-component';

export type ScrollBoxOptions = {
  height?: number;
  width?: number;
};

export class ScrollBox extends BaseComponent<ScrollBoxOptions, Container> {
  private readonly maskGraphic = new Graphics();
  private readonly hitAreaGraphic = new Graphics();
  private readonly inner = new Container();
  private startY = 0;
  private scrollY = 0;
  private isDragging = false;
  private maxScrollY = 0;

  constructor(options: ScrollBoxOptions = {}) {
    super(new Container(), options);

    this.displayObject.addChild(this.hitAreaGraphic);
    this.displayObject.addChild(this.inner);
    this.displayObject.addChild(this.maskGraphic);
    this.inner.mask = this.maskGraphic;

    this.displayObject.eventMode = 'static';
    this.displayObject.on('pointerdown', this.onPointerDown, this);
    this.displayObject.on('pointerup', this.onPointerUp, this);
    this.displayObject.on('pointerupoutside', this.onPointerUp, this);
    this.displayObject.on('pointermove', this.onPointerMove, this);
    this.displayObject.on('wheel', this.onWheel, this);

    this.onPropsChanged();
  }

  override addChild(child: import('./base-node').BaseNode): this {
    // We add to our tracking set
    this.children.add(child);
    // But append to the inner container instead of the main displayObject
    this.inner.addChild(child.displayObject);
    return this;
  }

  override removeChild(child: import('./base-node').BaseNode): this {
    if (!this.children.has(child)) return this;
    this.children.delete(child);
    this.inner.removeChild(child.displayObject);
    return this;
  }

  private onPointerDown(e: FederatedPointerEvent): void {
    this.isDragging = true;
    this.startY = e.global.y - this.scrollY;
  }

  private onPointerUp(): void {
    this.isDragging = false;
  }

  private onPointerMove(e: FederatedPointerEvent): void {
    if (!this.isDragging) return;
    this.updateScroll(e.global.y - this.startY);
  }

  private onWheel(e: FederatedWheelEvent): void {
    this.updateScroll(this.scrollY - e.deltaY);
  }

  private updateScroll(newY: number): void {
    this.calculateMaxScroll();
    this.scrollY = Math.min(0, Math.max(newY, this.maxScrollY));
    this.inner.y = this.scrollY;
  }

  private calculateMaxScroll(): void {
    const contentHeight = this.inner.height;
    const viewHeight = this.props.height ?? 0;
    this.maxScrollY = Math.min(0, viewHeight - contentHeight);
  }

  protected override onPropsChanged(): void {
    const w = this.props.width ?? 0;
    const h = this.props.height ?? 0;

    this.maskGraphic.clear();
    this.maskGraphic.rect(0, 0, w, h);
    this.maskGraphic.fill(0xffffff);

    this.hitAreaGraphic.clear();
    this.hitAreaGraphic.rect(0, 0, w, h);
    this.hitAreaGraphic.fill({ color: 0x000000, alpha: 0.001 });
  }
}

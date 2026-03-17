import type { LayoutStyles } from './layout-types';

export type ComputedLayout = {
  left: number;
  right: number;
  top: number;
  bottom: number;
  width: number;
  height: number;
};

export type ComputedPixiLayout = {
  x: number;
  y: number;
  offsetX: number;
  offsetY: number;
  scaleX: number;
  scaleY: number;
  originX?: number;
  originY?: number;
};

export type LayoutBounds = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type FlexItemData = {
  style: LayoutStyles;
  computed: ComputedLayout;
};

export type FlexLine = {
  items: FlexItemData[];
  mainStart: number;
  mainEnd: number;
  crossStart: number;
  crossEnd: number;
};

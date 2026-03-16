export type BreakpointRule = {
  maxWidth?: number;
  minWidth?: number;
  override: LayoutSpec;
};

export type SizeMode = 'auto' | 'content' | 'fill' | 'fixed' | 'percent';

export type FixedLayoutSpec = {
  breakpoints?: readonly BreakpointRule[];
  height?: number;
  scale?: number;
  type: 'fixed';
  width?: number;
  x?: number;
  y?: number;
};

export type AnchorLayoutSpec = {
  breakpoints?: readonly BreakpointRule[];
  horizontal: 'center' | 'end' | 'start';
  offsetX?: number;
  offsetY?: number;
  relativeHeight?: number;
  relativeWidth?: number;
  type: 'anchor';
  vertical: 'center' | 'end' | 'start';
};

export type StackLayoutSpec = {
  align?: 'center' | 'end' | 'start';
  breakpoints?: readonly BreakpointRule[];
  direction: 'horizontal' | 'vertical';
  fitContent?: boolean;
  gap?: number;
  padding?: number;
  type: 'stack';
};

export type AutoLayoutSpec = {
  breakpoints?: readonly BreakpointRule[];
  height?: SizeMode;
  type: 'auto';
  width?: SizeMode;
};

export type PercentLayoutSpec = {
  breakpoints?: readonly BreakpointRule[];
  height?: number;
  horizontal?: 'center' | 'end' | 'start';
  offsetX?: number;
  offsetY?: number;
  type: 'percent';
  vertical?: 'center' | 'end' | 'start';
  width?: number;
};

export type LayoutSpec = AnchorLayoutSpec | AutoLayoutSpec | FixedLayoutSpec | PercentLayoutSpec | StackLayoutSpec;

export const layout = {
  anchor(spec: Omit<AnchorLayoutSpec, 'type'>): AnchorLayoutSpec {
    return {
      ...spec,
      type: 'anchor',
    };
  },
  auto(spec: Omit<AutoLayoutSpec, 'type'>): AutoLayoutSpec {
    return {
      ...spec,
      type: 'auto',
    };
  },
  fixed(spec: Omit<FixedLayoutSpec, 'type'>): FixedLayoutSpec {
    return {
      ...spec,
      type: 'fixed',
    };
  },
  percent(spec: Omit<PercentLayoutSpec, 'type'>): PercentLayoutSpec {
    return {
      ...spec,
      type: 'percent',
    };
  },
  stack(spec: Omit<StackLayoutSpec, 'type'>): StackLayoutSpec {
    return {
      ...spec,
      type: 'stack',
    };
  },
};

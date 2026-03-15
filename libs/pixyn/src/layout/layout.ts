export type BreakpointRule = {
  maxWidth?: number;
  minWidth?: number;
  override: LayoutSpec;
};

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

export type LayoutSpec = AnchorLayoutSpec | FixedLayoutSpec | StackLayoutSpec;

export const layout = {
  anchor(spec: Omit<AnchorLayoutSpec, 'type'>): AnchorLayoutSpec {
    return {
      ...spec,
      type: 'anchor',
    };
  },
  fixed(spec: Omit<FixedLayoutSpec, 'type'>): FixedLayoutSpec {
    return {
      ...spec,
      type: 'fixed',
    };
  },
  stack(spec: Omit<StackLayoutSpec, 'type'>): StackLayoutSpec {
    return {
      ...spec,
      type: 'stack',
    };
  },
};

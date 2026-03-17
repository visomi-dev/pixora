export type NumberValue = number | `${number}%`;

export type PositionKeyword = 'center' | 'top' | 'bottom' | 'left' | 'right';

type TwoValuePosition =
  | `${NumberValue} ${NumberValue}`
  | `${PositionKeyword} ${PositionKeyword}`
  | `${PositionKeyword} ${NumberValue}`
  | `${NumberValue} ${PositionKeyword}`;

type EdgeOffsetValue = `${PositionKeyword} ${NumberValue} ${PositionKeyword} ${NumberValue}`;

type SingleValue = PositionKeyword | NumberValue;

export type PositionSpecifier = SingleValue | TwoValuePosition | EdgeOffsetValue;

export type JustifyContent = 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly';

export type AlignItems = 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'baseline';

export type AlignSelf = 'auto' | AlignItems;

export type AlignContent =
  | 'flex-start'
  | 'flex-end'
  | 'center'
  | 'stretch'
  | 'space-between'
  | 'space-around'
  | 'space-evenly';

export type FlexDirection = 'row' | 'column' | 'row-reverse' | 'column-reverse';

export type FlexWrap = 'nowrap' | 'wrap' | 'wrap-reverse';

export type Position = 'absolute' | 'relative' | 'static';

export type Display = 'none' | 'flex' | 'contents';

export type BoxSizing = 'border-box' | 'content-box';

export type Overflow = 'visible' | 'hidden' | 'scroll';

export type ObjectFit = 'fill' | 'contain' | 'cover' | 'none' | 'scale-down';

export type Direction = 'ltr' | 'rtl';

export type LayoutStyles = {
  alignContent?: AlignContent;
  alignItems?: AlignItems;
  alignSelf?: AlignSelf;
  aspectRatio?: number;

  bottom?: NumberValue;
  left?: NumberValue;
  right?: NumberValue;
  top?: NumberValue;
  start?: NumberValue;
  end?: NumberValue;

  boxSizing?: BoxSizing;
  direction?: Direction;
  display?: Display;

  flex?: number;
  flexBasis?: NumberValue | 'auto';
  flexDirection?: FlexDirection;
  flexGrow?: number;
  flexShrink?: number;
  flexWrap?: FlexWrap;

  rowGap?: number;
  columnGap?: number;
  gap?: number;

  justifyContent?: JustifyContent;

  margin?: NumberValue | 'auto';
  marginBottom?: NumberValue | 'auto';
  marginEnd?: NumberValue | 'auto';
  marginLeft?: NumberValue | 'auto';
  marginRight?: NumberValue | 'auto';
  marginStart?: NumberValue | 'auto';
  marginTop?: NumberValue | 'auto';
  marginInline?: NumberValue | 'auto';
  marginBlock?: NumberValue | 'auto';

  width?: NumberValue | 'auto' | 'intrinsic';
  height?: NumberValue | 'auto' | 'intrinsic';
  maxWidth?: NumberValue;
  maxHeight?: NumberValue;
  minWidth?: NumberValue;
  minHeight?: NumberValue;

  overflow?: Overflow;

  padding?: NumberValue;
  paddingBottom?: NumberValue;
  paddingEnd?: NumberValue;
  paddingLeft?: NumberValue;
  paddingRight?: NumberValue;
  paddingStart?: NumberValue;
  paddingTop?: NumberValue;
  paddingInline?: NumberValue;
  paddingBlock?: NumberValue;

  inset?: NumberValue;
  insetBlock?: NumberValue;
  insetInline?: NumberValue;

  position?: Position;

  borderRadius?: number;
  borderWidth?: number;
  borderTopWidth?: number;
  borderRightWidth?: number;
  borderBottomWidth?: number;
  borderLeftWidth?: number;

  backgroundColor?: number | string;

  transformOrigin?: PositionSpecifier;
  objectFit?: ObjectFit;
  objectPosition?: PositionSpecifier;

  isLeaf?: boolean;
  applySizeDirectly?: boolean;

  debug?: boolean;
  debugHeat?: boolean;
  debugDrawMargin?: boolean;
  debugDrawPadding?: boolean;
  debugDrawBorder?: boolean;
  debugDrawFlex?: boolean;
  debugDrawContent?: boolean;
};

export type FlexItemStyle = {
  alignSelf?: AlignSelf;
  flexGrow?: number;
  flexShrink?: number;
  flexBasis?: NumberValue | 'auto';
  marginTop?: NumberValue | 'auto';
  marginBottom?: NumberValue | 'auto';
  marginLeft?: NumberValue | 'auto';
  marginRight?: NumberValue | 'auto';
  marginStart?: NumberValue | 'auto';
  marginEnd?: NumberValue | 'auto';
  margin?: NumberValue | 'auto';
  width?: NumberValue | 'auto' | 'intrinsic';
  height?: NumberValue | 'auto' | 'intrinsic';
  minWidth?: NumberValue;
  minHeight?: NumberValue;
  maxWidth?: NumberValue;
  maxHeight?: NumberValue;
  position?: Position;
  top?: NumberValue;
  bottom?: NumberValue;
  left?: NumberValue;
  right?: NumberValue;
};

export type FlexContainerStyle = {
  alignContent?: AlignContent;
  alignItems?: AlignItems;
  direction?: Direction;
  display?: Display;
  flexDirection?: FlexDirection;
  flexWrap?: FlexWrap;
  justifyContent?: JustifyContent;
  rowGap?: number;
  columnGap?: number;
  gap?: number;
  width?: NumberValue | 'auto' | 'intrinsic';
  height?: NumberValue | 'auto' | 'intrinsic';
  maxWidth?: NumberValue;
  maxHeight?: NumberValue;
  minWidth?: NumberValue;
  minHeight?: NumberValue;
  padding?: NumberValue;
  paddingTop?: NumberValue;
  paddingBottom?: NumberValue;
  paddingLeft?: NumberValue;
  paddingRight?: NumberValue;
  paddingStart?: NumberValue;
  paddingEnd?: NumberValue;
  paddingInline?: NumberValue;
  paddingBlock?: NumberValue;
  margin?: NumberValue | 'auto';
  marginTop?: NumberValue | 'auto';
  marginBottom?: NumberValue | 'auto';
  boxSizing?: BoxSizing;
  overflow?: Overflow;
};

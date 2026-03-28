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

export type PixoraStyle = {
  align?: 'left' | 'center' | 'right' | 'justify';
  alignContent?: AlignContent;
  alignItems?: AlignItems;
  alignSelf?: AlignSelf;
  aspectRatio?: number;
  backgroundColor?: number | string;
  borderWidth?: number;
  borderRadius?: number;
  bottom?: NumberValue;
  boxSizing?: BoxSizing;
  color?: string;
  columnGap?: number;
  cursor?: string;
  direction?: Direction;
  display?: Display;
  end?: NumberValue;
  flex?: number;
  flexBasis?: NumberValue | 'auto';
  flexDirection?: FlexDirection;
  flexGrow?: number;
  flexShrink?: number;
  flexWrap?: FlexWrap;
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: string;
  gap?: number;
  height?: NumberValue | 'auto' | 'intrinsic';
  inset?: NumberValue;
  insetBlock?: NumberValue;
  insetInline?: NumberValue;
  justifyContent?: JustifyContent;
  left?: NumberValue;
  margin?: NumberValue | 'auto';
  marginBlock?: NumberValue | 'auto';
  marginBottom?: NumberValue | 'auto';
  marginEnd?: NumberValue | 'auto';
  marginInline?: NumberValue | 'auto';
  marginLeft?: NumberValue | 'auto';
  marginRight?: NumberValue | 'auto';
  marginStart?: NumberValue | 'auto';
  marginTop?: NumberValue | 'auto';
  maxHeight?: NumberValue;
  maxWidth?: NumberValue;
  minHeight?: NumberValue;
  minWidth?: NumberValue;
  objectFit?: ObjectFit;
  objectPosition?: PositionSpecifier;
  opacity?: number;
  overflow?: Overflow;
  padding?: NumberValue;
  paddingBlock?: NumberValue;
  paddingBottom?: NumberValue;
  paddingEnd?: NumberValue;
  paddingInline?: NumberValue;
  paddingLeft?: NumberValue;
  paddingRight?: NumberValue;
  paddingStart?: NumberValue;
  paddingTop?: NumberValue;
  position?: Position;
  right?: NumberValue;
  rowGap?: number;
  start?: NumberValue;
  top?: NumberValue;
  transformOrigin?: PositionSpecifier;
  isLeaf?: boolean;
  visible?: boolean;
  width?: NumberValue | 'auto' | 'intrinsic';
};

export type LayoutStyles = PixoraStyle;

export type FlexItemStyle = Pick<
  PixoraStyle,
  | 'alignSelf'
  | 'bottom'
  | 'flexBasis'
  | 'flexGrow'
  | 'flexShrink'
  | 'height'
  | 'left'
  | 'margin'
  | 'marginBottom'
  | 'marginEnd'
  | 'marginLeft'
  | 'marginRight'
  | 'marginStart'
  | 'marginTop'
  | 'maxHeight'
  | 'maxWidth'
  | 'minHeight'
  | 'minWidth'
  | 'position'
  | 'right'
  | 'top'
  | 'width'
>;

export type FlexContainerStyle = Pick<
  PixoraStyle,
  | 'alignContent'
  | 'alignItems'
  | 'boxSizing'
  | 'columnGap'
  | 'direction'
  | 'display'
  | 'flexDirection'
  | 'flexWrap'
  | 'gap'
  | 'height'
  | 'justifyContent'
  | 'margin'
  | 'marginBottom'
  | 'marginTop'
  | 'maxHeight'
  | 'maxWidth'
  | 'minHeight'
  | 'minWidth'
  | 'overflow'
  | 'padding'
  | 'paddingBlock'
  | 'paddingBottom'
  | 'paddingEnd'
  | 'paddingInline'
  | 'paddingLeft'
  | 'paddingRight'
  | 'paddingStart'
  | 'paddingTop'
  | 'rowGap'
  | 'width'
>;

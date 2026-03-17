import type { Container } from 'pixi.js';

import type { LayoutStyles } from './layout-types';
import type { ComputedLayout } from './computed-layout';

export type FlexNode = {
  style: LayoutStyles;
  computed: ComputedLayout;
  children: FlexNode[];
  target: Container;
  isDirty: boolean;
};

export type FlexLine = {
  items: FlexNode[];
  mainStart: number;
  mainEnd: number;
  crossStart: number;
  crossEnd: number;
};

export type LayoutContext = {
  width: number;
  height: number;
  x: number;
  y: number;
};

const DEFAULT_STYLE: LayoutStyles = {
  display: 'flex',
  flexDirection: 'row',
  flexWrap: 'nowrap',
  justifyContent: 'flex-start',
  alignItems: 'stretch',
  alignContent: 'stretch',
  flexGrow: 0,
  flexShrink: 1,
  flexBasis: 'auto',
  width: 'auto',
  height: 'auto',
  position: 'relative',
  marginTop: 0,
  marginBottom: 0,
  marginLeft: 0,
  marginRight: 0,
  paddingTop: 0,
  paddingBottom: 0,
  paddingLeft: 0,
  paddingRight: 0,
};

export class FlexEngine {
  private root: FlexNode | null = null;
  private context: LayoutContext = { width: 0, height: 0, x: 0, y: 0 };

  setRoot(node: FlexNode): void {
    this.root = node;
  }

  setContext(context: Partial<LayoutContext>): void {
    this.context = { ...this.context, ...context };
  }

  calculateLayout(): void {
    if (!this.root) return;

    this.calculateNodeLayout(this.root, this.context.width, this.context.height, this.context.x, this.context.y);
  }

  private calculateNodeLayout(
    node: FlexNode,
    parentWidth: number,
    parentHeight: number,
    parentX: number,
    parentY: number,
  ): void {
    const style = { ...DEFAULT_STYLE, ...node.style };
    const isContainer = style.display === 'flex';

    if (!isContainer || style.position === 'absolute') {
      this.calculateAbsoluteLayout(node, parentWidth, parentHeight, parentX, parentY);
      return;
    }

    const paddingLeft = typeof style.paddingLeft === 'number' ? style.paddingLeft : 0;
    const paddingRight = typeof style.paddingRight === 'number' ? style.paddingRight : 0;
    const paddingTop = typeof style.paddingTop === 'number' ? style.paddingTop : 0;
    const paddingBottom = typeof style.paddingBottom === 'number' ? style.paddingBottom : 0;
    const paddingX = paddingLeft + paddingRight;
    const paddingY = paddingTop + paddingBottom;

    const availableWidth = this.resolveDimension(style.width, parentWidth) ?? parentWidth - paddingX;
    const availableHeight = this.resolveDimension(style.height, parentHeight) ?? parentHeight - paddingY;

    const children = node.children.filter((child) => {
      const childStyle = { ...DEFAULT_STYLE, ...child.style };
      return childStyle.display !== 'none';
    });

    if (children.length === 0) {
      this.applyContainerSize(node, availableWidth, availableHeight);
      node.computed.width = availableWidth;
      node.computed.height = availableHeight;
      node.computed.left = parentX;
      node.computed.top = parentY;
      return;
    }

    const isRow = style.flexDirection === 'row' || style.flexDirection === 'row-reverse';
    const mainSize = isRow ? availableWidth : availableHeight;
    const crossSize = isRow ? availableHeight : availableWidth;

    const gap = style.gap ?? style.rowGap ?? style.columnGap ?? 0;

    const lines = this.calculateFlexLines(children, mainSize, crossSize, gap, style.flexWrap);

    for (const line of lines) {
      this.calculateLineLayout(line, mainSize, crossSize, gap, style, isRow);
    }

    const totalMainSize = lines.reduce((sum, line) => {
      return isRow ? Math.max(sum, line.mainEnd - line.mainStart) : Math.max(sum, line.mainEnd - line.mainStart);
    }, 0);

    const totalCrossSize = lines.reduce((sum, line) => sum + (line.crossEnd - line.crossStart), 0);

    let containerMainSize = availableWidth;
    let containerCrossSize = availableHeight;

    if (style.width === 'auto' || style.width === 'intrinsic') {
      containerMainSize = totalMainSize + paddingX;
    }
    if (style.height === 'auto' || style.height === 'intrinsic') {
      containerCrossSize = totalCrossSize + paddingY;
    }

    node.computed.width = isRow ? containerMainSize : containerCrossSize;
    node.computed.height = isRow ? containerCrossSize : containerMainSize;
    node.computed.left = parentX;
    node.computed.top = parentY;

    let lineMainStart = isRow ? parentX + paddingLeft : parentY + paddingTop;
    const lineCrossStart = isRow ? parentY + paddingTop : parentX + paddingLeft;

    for (const line of lines) {
      const mainPos = lineMainStart;
      const crossPos = lineCrossStart;

      for (const item of line.items) {
        const itemStyle = { ...DEFAULT_STYLE, ...item.style };
        const isReverse = isRow ? style.flexDirection === 'row-reverse' : style.flexDirection === 'column-reverse';
        const _mainPos = mainPos;

        if (isRow) {
          item.computed.left = isReverse ? _mainPos - item.computed.width : _mainPos;
          item.computed.top = crossPos;
        } else {
          item.computed.left = crossPos;
          item.computed.top = isReverse ? _mainPos - item.computed.height : _mainPos;
        }

        this.applyTransforms(item, itemStyle);
      }

      lineMainStart += isRow ? line.mainEnd - line.mainStart : line.crossEnd - line.crossStart;
    }
  }

  private calculateFlexLines(
    children: FlexNode[],
    mainSize: number,
    _crossSize: number,
    gap: number,
    flexWrap: LayoutStyles['flexWrap'],
  ): FlexLine[] {
    const lines: FlexLine[] = [];
    let currentLine: FlexLine | null = null;
    let currentMainSize = 0;

    for (const child of children) {
      const childStyle = { ...DEFAULT_STYLE, ...child.style };
      const childMainSize = this.getChildMainSize(child, childStyle);

      if (flexWrap === 'nowrap') {
        if (!currentLine) {
          currentLine = { items: [], mainStart: 0, mainEnd: 0, crossStart: 0, crossEnd: 0 };
          lines.push(currentLine);
        }
        currentLine.items.push(child);
        currentMainSize += childMainSize;
      } else {
        if (!currentLine) {
          currentLine = { items: [], mainStart: 0, mainEnd: 0, crossStart: 0, crossEnd: 0 };
          lines.push(currentLine);
        }

        if (currentMainSize + childMainSize + gap > mainSize && currentLine.items.length > 0) {
          currentLine = { items: [], mainStart: 0, mainEnd: 0, crossStart: 0, crossEnd: 0 };
          lines.push(currentLine);
          currentMainSize = 0;
        }

        currentLine.items.push(child);
        currentMainSize += childMainSize + (currentLine.items.length > 1 ? gap : 0);
      }
    }

    for (const line of lines) {
      line.mainStart = 0;
      line.mainEnd =
        line.items.reduce((sum, item) => {
          const style = { ...DEFAULT_STYLE, ...item.style };
          const size = this.getChildMainSize(item, style);
          return sum + size;
        }, 0) +
        gap * Math.max(0, line.items.length - 1);

      line.crossStart = 0;
      line.crossEnd = Math.max(
        ...line.items.map((item) => {
          const style = { ...DEFAULT_STYLE, ...item.style };
          return this.getChildCrossSize(item, style);
        }),
      );
    }

    return lines;
  }

  private calculateLineLayout(
    line: FlexLine,
    _mainSize: number,
    _crossSize: number,
    _gap: number,
    containerStyle: LayoutStyles,
    isRow: boolean,
  ): void {
    const items = line.items;
    const alignItems = containerStyle.alignItems ?? 'stretch';

    for (const item of items) {
      const itemStyle = { ...DEFAULT_STYLE, ...item.style };
      const alignSelf = itemStyle.alignSelf ?? alignItems;

      const itemMainSize = this.getChildMainSize(item, itemStyle);
      const itemCrossSize = this.getChildCrossSize(item, itemStyle);

      if (alignSelf === 'stretch') {
        item.computed[isRow ? 'width' : 'height'] = line.crossEnd - line.crossStart;
      }

      if (isRow) {
        item.computed.width = itemMainSize;
        item.computed.height = itemCrossSize;
      } else {
        item.computed.width = itemCrossSize;
        item.computed.height = itemMainSize;
      }
    }
  }

  private getChildMainSize(child: FlexNode, style: LayoutStyles): number {
    const isRow = style.flexDirection === 'row' || style.flexDirection === 'row-reverse';
    const flexBasis = style.flexBasis ?? 'auto';

    if (flexBasis !== 'auto') {
      return typeof flexBasis === 'number' ? flexBasis : 0;
    }

    if (style.width !== undefined && style.width !== 'auto') {
      return typeof style.width === 'number' ? style.width : 0;
    }
    if (style.height !== undefined && style.height !== 'auto') {
      return typeof style.height === 'number' ? style.height : 0;
    }

    return child.computed[isRow ? 'width' : 'height'] ?? 0;
  }

  private getChildCrossSize(child: FlexNode, style: LayoutStyles): number {
    const isRow = style.flexDirection === 'row' || style.flexDirection === 'row-reverse';

    if (isRow) {
      return style.height !== undefined && typeof style.height === 'number'
        ? style.height
        : (child.computed.height ?? 0);
    }
    return style.width !== undefined && typeof style.width === 'number' ? style.width : (child.computed.width ?? 0);
  }

  private calculateAbsoluteLayout(
    node: FlexNode,
    parentWidth: number,
    parentHeight: number,
    parentX: number,
    parentY: number,
  ): void {
    const style = { ...DEFAULT_STYLE, ...node.style };

    const width = this.resolveDimension(style.width, parentWidth) ?? node.computed.width ?? 0;
    const height = this.resolveDimension(style.height, parentHeight) ?? node.computed.height ?? 0;

    let x = parentX;
    let y = parentY;

    if (style.left !== undefined) {
      const resolved = this.resolveNumberValue(style.left, parentWidth);
      x = parentX + resolved;
    }
    if (style.right !== undefined) {
      const resolved = this.resolveNumberValue(style.right, parentWidth);
      x = parentX + parentWidth - width - resolved;
    }
    if (style.top !== undefined) {
      const resolved = this.resolveNumberValue(style.top, parentHeight);
      y = parentY + resolved;
    }
    if (style.bottom !== undefined) {
      const resolved = this.resolveNumberValue(style.bottom, parentHeight);
      y = parentY + parentHeight - height - resolved;
    }

    node.computed.width = width;
    node.computed.height = height;
    node.computed.left = x;
    node.computed.top = y;
  }

  private applyContainerSize(node: FlexNode, width: number, height: number): void {
    const style = { ...DEFAULT_STYLE, ...node.style };

    if (style.width === 'auto' || style.width === 'intrinsic') {
      const childrenWidth = node.children.reduce((sum, child) => sum + child.computed.width, 0);
      node.computed.width = Math.max(width, childrenWidth);
    }
    if (style.height === 'auto' || style.height === 'intrinsic') {
      const childrenHeight = node.children.reduce((sum, child) => sum + child.computed.height, 0);
      node.computed.height = Math.max(height, childrenHeight);
    }
  }

  private applyTransforms(node: FlexNode, _style: LayoutStyles): void {
    const containerWidth = node.computed.width;
    const containerHeight = node.computed.height;

    if (containerWidth === 0 || containerHeight === 0) {
      return;
    }
  }

  private resolveDimension(value: LayoutStyles['width'] | LayoutStyles['height'], parentSize: number): number | null {
    if (value === undefined || value === 'auto' || value === 'intrinsic') {
      return null;
    }
    return this.resolveNumberValue(value as string | number, parentSize);
  }

  private resolveNumberValue(value: string | number | undefined, parentSize: number): number {
    if (value === undefined) return 0;
    if (typeof value === 'number') return value;
    if (typeof value === 'string' && value.endsWith('%')) {
      return (parseFloat(value) / 100) * parentSize;
    }
    return parseFloat(value) || 0;
  }
}

export const flexEngine = new FlexEngine();

import { normalizeLayoutStyle, resolveDimension, resolveNumberValue } from './normalize-style';

import type { Container } from 'pixi.js';
import type { ComputedLayout } from './computed-layout';
import type { LayoutStyles, PositionSpecifier } from './layout-types';
import type { BaseNode } from '../components/base-node';

export type FlexNode = {
  style: LayoutStyles;
  computed: ComputedLayout;
  children: FlexNode[];
  hostNode: BaseNode;
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
    const style = normalizeLayoutStyle({ ...DEFAULT_STYLE, ...node.style });
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

    const availableWidth = resolveDimension(style.width, parentWidth) ?? parentWidth - paddingX;
    const availableHeight = resolveDimension(style.height, parentHeight) ?? parentHeight - paddingY;

    const children = node.children.filter((child) => {
      const childStyle = normalizeLayoutStyle({ ...DEFAULT_STYLE, ...child.style });
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
      this.calculateLineLayout(line, style, isRow, mainSize, gap);
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
    this.applyTransforms(node, style);

    const alignItems = style.alignItems ?? 'stretch';
    const alignContent = style.alignContent ?? 'stretch';
    const isReverse = style.flexDirection === 'row-reverse' || style.flexDirection === 'column-reverse';
    const containerInnerCrossSize = isRow ? containerCrossSize - paddingY : containerMainSize - paddingX;
    const containerInnerMainSize = isRow ? containerMainSize - paddingX : containerCrossSize - paddingY;
    const lineCrossSizes = lines.map((line) => line.crossEnd - line.crossStart);
    const totalLineCrossSize = lineCrossSizes.reduce((sum, size) => sum + size, 0);
    const remainingCrossSpace = Math.max(0, containerInnerCrossSize - totalLineCrossSize);
    const { lineOffsets, lineSizes } = this.calculateCrossAxisDistribution(
      lines.length,
      remainingCrossSpace,
      lineCrossSizes,
      alignContent,
    );
    const lineCrossBase = isRow ? parentY + paddingTop : parentX + paddingLeft;
    let consumedCrossSize = 0;

    for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
      const line = lines[lineIndex];
      const lineMainSize = line.mainEnd - line.mainStart;
      const lineCrossSize = lineSizes[lineIndex];
      const remainingMainSpace = containerInnerMainSize - lineMainSize;
      const justifyOffsets = this.calculateJustifyOffsets(line.items.length, remainingMainSpace, style.justifyContent);
      const lineCrossPos = lineCrossBase + consumedCrossSize + lineOffsets[lineIndex];

      let itemMainPos = isRow ? parentX + paddingLeft : parentY + paddingTop;

      for (let i = 0; i < line.items.length; i++) {
        const item = line.items[i];
        const itemStyle = normalizeLayoutStyle({ ...DEFAULT_STYLE, ...item.style });
        const alignSelf = itemStyle.alignSelf ?? alignItems;

        const mainPos = itemMainPos + justifyOffsets[i];
        const itemCrossSize = isRow ? item.computed.height : item.computed.width;
        let crossOffset = 0;
        if (alignSelf === 'flex-end') {
          crossOffset = lineCrossSize - itemCrossSize;
        } else if (alignSelf === 'center') {
          crossOffset = (lineCrossSize - itemCrossSize) / 2;
        }

        if (isRow) {
          item.computed.left = isReverse ? mainPos - item.computed.width : mainPos;
          item.computed.top = lineCrossPos + crossOffset;
        } else {
          item.computed.left = lineCrossPos + crossOffset;
          item.computed.top = isReverse ? mainPos - item.computed.height : mainPos;
        }

        this.applyTransforms(item, itemStyle);
        itemMainPos += (isRow ? item.computed.width : item.computed.height) + gap;
      }

      consumedCrossSize += lineCrossSize;
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
      const childStyle = normalizeLayoutStyle({ ...DEFAULT_STYLE, ...child.style });
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
          const style = normalizeLayoutStyle({ ...DEFAULT_STYLE, ...item.style });
          const size = this.getChildMainSize(item, style);
          return sum + size;
        }, 0) +
        gap * Math.max(0, line.items.length - 1);

      line.crossStart = 0;
      line.crossEnd = Math.max(
        ...line.items.map((item) => {
          const style = normalizeLayoutStyle({ ...DEFAULT_STYLE, ...item.style });
          return this.getChildCrossSize(item, style);
        }),
      );
    }

    return lines;
  }

  private calculateLineLayout(
    line: FlexLine,
    containerStyle: LayoutStyles,
    isRow: boolean,
    availableMainSize: number,
    gap: number,
  ): void {
    const items = line.items;
    const alignItems = containerStyle.alignItems ?? 'stretch';
    const itemMainSizes = items.map((item) => {
      const itemStyle = normalizeLayoutStyle({ ...DEFAULT_STYLE, ...item.style });

      return this.getChildMainSize(item, itemStyle);
    });
    const totalMainSize = itemMainSizes.reduce((sum, size) => sum + size, 0);
    const totalGap = gap * Math.max(0, items.length - 1);
    const remainingSpace = availableMainSize - totalMainSize - totalGap;
    const flexGrowTotal = items.reduce((sum, item) => sum + this.getFlexGrow(item.style), 0);
    const flexShrinkTotal = items.reduce(
      (sum, item, index) => sum + this.getFlexShrink(item.style) * itemMainSizes[index],
      0,
    );
    const resolvedMainSizes = itemMainSizes.map((baseSize, index) => {
      if (remainingSpace > 0 && flexGrowTotal > 0) {
        return baseSize + (remainingSpace * this.getFlexGrow(items[index].style)) / flexGrowTotal;
      }

      if (remainingSpace < 0 && flexShrinkTotal > 0) {
        const shrinkWeight = this.getFlexShrink(items[index].style) * baseSize;
        return Math.max(0, baseSize + (remainingSpace * shrinkWeight) / flexShrinkTotal);
      }

      return baseSize;
    });
    const baseCrossSizes = items.map((item) => {
      const itemStyle = normalizeLayoutStyle({ ...DEFAULT_STYLE, ...item.style });

      return this.getChildCrossSize(item, itemStyle);
    });
    const lineCrossSize = baseCrossSizes.reduce((max, size) => Math.max(max, size), 0);

    for (let index = 0; index < items.length; index++) {
      const item = items[index];
      const itemStyle = normalizeLayoutStyle({ ...DEFAULT_STYLE, ...item.style });
      const alignSelf = itemStyle.alignSelf ?? alignItems;
      const itemMainSize = resolvedMainSizes[index];
      const itemCrossSize = alignSelf === 'stretch' ? lineCrossSize : baseCrossSizes[index];

      if (isRow) {
        item.computed.width = itemMainSize;
        item.computed.height = itemCrossSize;
      } else {
        item.computed.width = itemCrossSize;
        item.computed.height = itemMainSize;
      }
    }

    line.mainEnd = resolvedMainSizes.reduce((sum, size) => sum + size, 0) + totalGap;
    line.crossEnd = lineCrossSize;
  }

  private calculateJustifyOffsets(
    itemCount: number,
    remainingSpace: number,
    justifyContent: LayoutStyles['justifyContent'],
  ): number[] {
    const offsets: number[] = new Array(itemCount).fill(0);

    if (remainingSpace <= 0 || !justifyContent || justifyContent === 'flex-start') {
      return offsets;
    }

    switch (justifyContent) {
      case 'center': {
        const centerOffset = remainingSpace / 2;
        for (let i = 0; i < itemCount; i++) {
          offsets[i] = centerOffset;
        }
        break;
      }
      case 'flex-end': {
        for (let i = 0; i < itemCount; i++) {
          offsets[i] = remainingSpace;
        }
        break;
      }
      case 'space-between': {
        if (itemCount > 1) {
          const spaceBetween = remainingSpace / (itemCount - 1);
          for (let i = 0; i < itemCount; i++) {
            offsets[i] = i * spaceBetween;
          }
        } else {
          offsets[0] = remainingSpace / 2;
        }
        break;
      }
      case 'space-around': {
        const spaceAround = remainingSpace / itemCount;
        for (let i = 0; i < itemCount; i++) {
          offsets[i] = spaceAround / 2 + i * spaceAround;
        }
        break;
      }
      case 'space-evenly': {
        const spaceEvenly = remainingSpace / (itemCount + 1);
        for (let i = 0; i < itemCount; i++) {
          offsets[i] = spaceEvenly * (i + 1);
        }
        break;
      }
    }

    return offsets;
  }

  private getChildMainSize(child: FlexNode, style: LayoutStyles): number {
    const flexBasis = style.flexBasis ?? 'auto';

    if (flexBasis !== 'auto') {
      return typeof flexBasis === 'number'
        ? flexBasis
        : resolveNumberValue(flexBasis, this.getParentMainAxisSize(style));
    }

    if (style.width !== undefined && style.width !== 'auto') {
      return resolveDimension(style.width, this.context.width) ?? child.computed.width ?? 0;
    }
    if (style.height !== undefined && style.height !== 'auto') {
      return resolveDimension(style.height, this.context.height) ?? child.computed.height ?? 0;
    }

    return child.computed.width || child.computed.height || 0;
  }

  private getChildCrossSize(child: FlexNode, style: LayoutStyles): number {
    const isRow = style.flexDirection === 'row' || style.flexDirection === 'row-reverse';

    if (isRow) {
      return style.height !== undefined && typeof style.height === 'number'
        ? style.height
        : (child.computed.height ?? 0);
    }
    return style.width !== undefined && style.width !== 'auto'
      ? (resolveDimension(style.width, this.context.width) ?? child.computed.width ?? 0)
      : (child.computed.width ?? 0);
  }

  private calculateAbsoluteLayout(
    node: FlexNode,
    parentWidth: number,
    parentHeight: number,
    parentX: number,
    parentY: number,
  ): void {
    const style = normalizeLayoutStyle({ ...DEFAULT_STYLE, ...node.style });

    const width = resolveDimension(style.width, parentWidth) ?? node.computed.width ?? 0;
    const height = resolveDimension(style.height, parentHeight) ?? node.computed.height ?? 0;

    let x = parentX;
    let y = parentY;

    if (style.left !== undefined) {
      const resolved = resolveNumberValue(style.left, parentWidth);
      x = parentX + resolved;
    }
    if (style.right !== undefined) {
      const resolved = resolveNumberValue(style.right, parentWidth);
      x = parentX + parentWidth - width - resolved;
    }
    if (style.top !== undefined) {
      const resolved = resolveNumberValue(style.top, parentHeight);
      y = parentY + resolved;
    }
    if (style.bottom !== undefined) {
      const resolved = resolveNumberValue(style.bottom, parentHeight);
      y = parentY + parentHeight - height - resolved;
    }

    node.computed.width = width;
    node.computed.height = height;
    node.computed.left = x;
    node.computed.top = y;
    this.applyTransforms(node, style);
  }

  private applyContainerSize(node: FlexNode, width: number, height: number): void {
    const style = normalizeLayoutStyle({ ...DEFAULT_STYLE, ...node.style });

    if (style.width === 'auto' || style.width === 'intrinsic') {
      const childrenWidth = node.children.reduce((sum, child) => sum + child.computed.width, 0);
      node.computed.width = Math.max(width, childrenWidth);
    }
    if (style.height === 'auto' || style.height === 'intrinsic') {
      const childrenHeight = node.children.reduce((sum, child) => sum + child.computed.height, 0);
      node.computed.height = Math.max(height, childrenHeight);
    }
  }

  private applyTransforms(node: FlexNode, style: LayoutStyles): void {
    const containerWidth = node.computed.width;
    const containerHeight = node.computed.height;

    if (containerWidth === 0 || containerHeight === 0) {
      return;
    }

    const origin = this.resolveTransformOrigin(style.transformOrigin, containerWidth, containerHeight);
    node.target.pivot.set(origin.x, origin.y);
    node.computed.left += origin.x;
    node.computed.top += origin.y;
  }

  private getFlexGrow(style: LayoutStyles): number {
    const normalized = normalizeLayoutStyle({ ...DEFAULT_STYLE, ...style });

    return normalized.flexGrow ?? 0;
  }

  private getFlexShrink(style: LayoutStyles): number {
    const normalized = normalizeLayoutStyle({ ...DEFAULT_STYLE, ...style });

    return normalized.flexShrink ?? 1;
  }

  private getParentMainAxisSize(style: LayoutStyles): number {
    const isRow = style.flexDirection === 'row' || style.flexDirection === 'row-reverse';

    return isRow ? this.context.width : this.context.height;
  }

  private calculateCrossAxisDistribution(
    lineCount: number,
    remainingSpace: number,
    lineSizes: number[],
    alignContent: LayoutStyles['alignContent'],
  ): { lineOffsets: number[]; lineSizes: number[] } {
    const offsets = new Array(lineCount).fill(0);
    const stretchedLineSizes = [...lineSizes];

    if (remainingSpace <= 0 || !alignContent || alignContent === 'flex-start') {
      return { lineOffsets: offsets, lineSizes: stretchedLineSizes };
    }

    switch (alignContent) {
      case 'center': {
        offsets.fill(remainingSpace / 2);
        break;
      }
      case 'flex-end': {
        offsets.fill(remainingSpace);
        break;
      }
      case 'space-between': {
        if (lineCount > 1) {
          const gap = remainingSpace / (lineCount - 1);

          for (let i = 0; i < lineCount; i++) {
            offsets[i] = gap * i;
          }
        }
        break;
      }
      case 'space-around': {
        const gap = remainingSpace / lineCount;

        for (let i = 0; i < lineCount; i++) {
          offsets[i] = gap / 2 + gap * i;
        }
        break;
      }
      case 'space-evenly': {
        const gap = remainingSpace / (lineCount + 1);

        for (let i = 0; i < lineCount; i++) {
          offsets[i] = gap * (i + 1);
        }
        break;
      }
      case 'stretch': {
        const extra = remainingSpace / lineCount;

        for (let i = 0; i < lineCount; i++) {
          stretchedLineSizes[i] += extra;
          offsets[i] = i === 0 ? 0 : offsets[i - 1] + stretchedLineSizes[i - 1] - lineSizes[i - 1];
        }
        break;
      }
    }

    return { lineOffsets: offsets, lineSizes: stretchedLineSizes };
  }

  private resolveTransformOrigin(
    value: PositionSpecifier | undefined,
    width: number,
    height: number,
  ): { x: number; y: number } {
    if (value === undefined) {
      return { x: 0, y: 0 };
    }

    if (value === 'center') {
      return { x: width / 2, y: height / 2 };
    }

    const parts = `${value}`.trim().split(/\s+/);
    const [rawX, rawY = rawX] = parts;

    return {
      x: this.resolvePositionValue(rawX, width),
      y: this.resolvePositionValue(rawY, height),
    };
  }

  private resolvePositionValue(value: string, size: number): number {
    switch (value) {
      case 'left':
      case 'top':
        return 0;
      case 'center':
        return size / 2;
      case 'right':
      case 'bottom':
        return size;
      default:
        return resolveNumberValue(value as `${number}%`, size);
    }
  }
}

export const flexEngine = new FlexEngine();

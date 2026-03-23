import type { TextNodeProps } from 'pixora';

export function createTextStyle(color: string, fontSize: number, weight = 'bold'): Partial<TextNodeProps> {
  return {
    style: {
      color,
      fontFamily: 'Orbitron, sans-serif',
      fontSize,
      fontWeight: weight as 'bold' | 'normal' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900',
    },
  };
}

export function createMonoTextStyle(color: string, fontSize: number): Partial<TextNodeProps> {
  return {
    style: {
      color,
      fontFamily: 'JetBrains Mono, monospace',
      fontSize,
    },
  };
}

export function createCenteredTextStyle(color: string, fontSize: number, weight = 'bold'): Partial<TextNodeProps> {
  return {
    anchor: { x: 0.5, y: 0 },
    ...createTextStyle(color, fontSize, weight),
  };
}

export function createCenteredMonoTextStyle(color: string, fontSize: number): Partial<TextNodeProps> {
  return {
    anchor: { x: 0.5, y: 0 },
    ...createMonoTextStyle(color, fontSize),
  };
}

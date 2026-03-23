import { TextNodeProps } from 'pixora';

export const createTextStyle = (color: string, fontSize: number, weight = 'bold'): Partial<TextNodeProps> => ({
  style: {
    color,
    fontFamily: 'Orbitron, sans-serif',
    fontSize,
    fontWeight: weight as 'bold' | 'normal' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900',
  },
});

export const createMonoTextStyle = (color: string, fontSize: number): Partial<TextNodeProps> => ({
  style: {
    color,
    fontFamily: 'JetBrains Mono, monospace',
    fontSize,
  },
});

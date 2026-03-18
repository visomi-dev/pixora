export function centeredBoxX(viewportWidth: number, width: number): number {
  return Math.round(viewportWidth / 2 - width / 2);
}

export function centeredTextX(viewportWidth: number, text: string, size: number, widthFactor = 0.56): number {
  return Math.round(viewportWidth / 2 - (text.length * size * widthFactor) / 2);
}

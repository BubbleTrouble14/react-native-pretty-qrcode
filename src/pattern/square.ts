export const drawSquareCell = (
  x: number,
  y: number,
  cellSize: number,
  isFilled: boolean
): string => {
  if (isFilled) {
    return `M${x},${y}h${cellSize}v${cellSize}h-${cellSize}z`;
  }
  return '';
};

export const qrMatrixToSquarePath = (
  matrix: boolean[][],
  size: number
): string => {
  const cellSize = size / matrix.length;
  let path = '';

  for (let row = 0; row < matrix.length; row++) {
    for (let col = 0; col < matrix[row]!.length; col++) {
      const x = col * cellSize;
      const y = row * cellSize;
      path += drawSquareCell(x, y, cellSize, !!matrix[row]![col]);
    }
  }

  return path;
};

export default qrMatrixToSquarePath;

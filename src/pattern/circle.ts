export const drawCircleCell = (
  x: number,
  y: number,
  cellSize: number,
  isFilled: boolean
): string => {
  if (isFilled) {
    const radius = cellSize / 2;
    const centerX = x + radius;
    const centerY = y + radius;
    return `M${centerX},${centerY}m-${radius},0a${radius},${radius} 0 1,0 ${cellSize},0a${radius},${radius} 0 1,0 -${cellSize},0`;
  }
  return '';
};

export const qrMatrixToCirclePath = (
  matrix: boolean[][],
  size: number
): string => {
  const cellSize = size / matrix.length;
  let path = '';

  for (let row = 0; row < matrix.length; row++) {
    for (let col = 0; col < matrix[row]!.length; col++) {
      const x = col * cellSize;
      const y = row * cellSize;
      path += drawCircleCell(x, y, cellSize, !!matrix[row]![col]);
    }
  }

  return path;
};

export default qrMatrixToCirclePath;

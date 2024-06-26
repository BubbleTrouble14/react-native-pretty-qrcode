import qrcodegen from '@ribpay/qr-code-generator';
import React from 'react';
import type { ViewProps } from 'react-native';
import { Image, View } from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';
import { cutOutImage, generateQRMatrix, removeQRCodeEyes } from './utils';

type QRCodeProps = {
  value: string | Readonly<Array<number>>;
  errorCorrection?: keyof typeof qrcodegen.QrCode.Ecc;
  size?: number;
  backgroundColor?: string;
  foregroundColor?: string;
  quietZone?: number;
  logo?: string;
  logoSize?: number;
  logoMargin?: number;
  shape: 'square' | 'circle' | 'merged';
  gradient?: {
    start: string;
    end: string;
  };
  imagePadding?: number;
  useCustomEyes?: boolean;
  eyeColor?: string;
} & ViewProps;

type Orientation = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

const generateRotatedPath = (
  x: number,
  y: number,
  width: number,
  height: number,
  orientation: Orientation,
  curveIntensity: number = 1
): string => {
  const clampedIntensity = Math.max(0, Math.min(1, curveIntensity));
  const curveRadius = (Math.min(width, height) / 2) * (1 - clampedIntensity);

  const paths = {
    'top-left': `M ${x} ${y} L ${x} ${y + height} Q ${x + curveRadius} ${y + curveRadius} ${x + width} ${y}`,
    'top-right': `M ${x + width} ${y} L ${x + width} ${y + height} Q ${x + width - curveRadius} ${y + curveRadius} ${x} ${y}`,
    'bottom-left': `M ${x} ${y + height} L ${x + width} ${y + height} Q ${x + curveRadius} ${y + height - curveRadius} ${x} ${y}`,
    'bottom-right': `M ${x + width} ${y + height} L ${x} ${y + height} Q ${x + width - curveRadius} ${y + height - curveRadius} ${x + width} ${y}`,
  };

  return paths[orientation] || '';
};

const isFilled = (matrix: boolean[][], row: number, col: number): boolean => {
  return (
    row >= 0 &&
    row < matrix.length &&
    col >= 0 &&
    matrix[row] !== undefined &&
    col < matrix[row]!.length &&
    !!matrix[row]![col]
  );
};

type CellType = [number, number];

const getCellType = (
  matrix: boolean[][],
  row: number,
  col: number
): string[] => {
  const adjacentCellsArr: CellType[] = [
    [row - 1, col],
    [row, col - 1],
    [row, col + 1],
    [row + 1, col],
  ];
  const adjacentCells = adjacentCellsArr.map(([r, c]: [number, number]) =>
    isFilled(matrix, r, c)
  );

  const [top, left, right, bottom] = adjacentCells;
  const types: string[] = [];

  if (top && bottom && !left && !right) types.push('vertical-edge');
  if (left && right && !top && !bottom) types.push('horizontal-edge');
  if (top && bottom && left && right) types.push('filled');

  if (!isFilled(matrix, row, col)) {
    if (right && bottom && isFilled(matrix, row + 1, col + 1))
      types.push('concave-top-left');
    if (left && bottom && isFilled(matrix, row + 1, col - 1))
      types.push('concave-top-right');
    if (right && top && isFilled(matrix, row - 1, col + 1))
      types.push('concave-bottom-left');
    if (left && top && isFilled(matrix, row - 1, col - 1))
      types.push('concave-bottom-right');
  } else {
    if (!left && !top) types.push('corner-top-left');
    if (!right && !top) types.push('corner-top-right');
    if (!left && !bottom) types.push('corner-bottom-left');
    if (!right && !bottom) types.push('corner-bottom-right');
  }

  return types.length ? types : ['unknown'];
};

const drawFilledCell = (
  x: number,
  y: number,
  cellSize: number,
  cellTypes: string[],
  cornerRadius: number
): string => {
  let cellPath = `M${x},${y}`;

  if (cellTypes.includes('corner-top-left')) {
    cellPath += `M${x},${y + cornerRadius}q0,${-cornerRadius} ${cornerRadius},${-cornerRadius}`;
  } else {
    cellPath += `M${x},${y}`;
  }

  cellPath += `h${cellSize - (cellTypes.includes('corner-top-left') ? cornerRadius : 0) - (cellTypes.includes('corner-top-right') ? cornerRadius : 0)}`;
  cellPath += cellTypes.includes('corner-top-right')
    ? `q${cornerRadius},0 ${cornerRadius},${cornerRadius}`
    : '';
  cellPath += `v${cellSize - (cellTypes.includes('corner-top-right') ? cornerRadius : 0) - (cellTypes.includes('corner-bottom-right') ? cornerRadius : 0)}`;
  cellPath += cellTypes.includes('corner-bottom-right')
    ? `q0,${cornerRadius} ${-cornerRadius},${cornerRadius}`
    : '';
  cellPath += `h${-cellSize + (cellTypes.includes('corner-bottom-right') ? cornerRadius : 0) + (cellTypes.includes('corner-bottom-left') ? cornerRadius : 0)}`;
  cellPath += cellTypes.includes('corner-bottom-left')
    ? `q${-cornerRadius},0 ${-cornerRadius},${-cornerRadius}`
    : '';
  cellPath += `v${-cellSize + (cellTypes.includes('corner-bottom-left') ? cornerRadius : 0) + (cellTypes.includes('corner-top-left') ? cornerRadius : 0)}`;

  return cellPath;
};

const drawEmptyCell = (
  x: number,
  y: number,
  cellSize: number,
  cellTypes: string[]
): string => {
  let cellPath = '';
  const halfCellSize = cellSize / 2;

  if (cellTypes.includes('concave-top-left')) {
    cellPath += generateRotatedPath(
      x + halfCellSize,
      y + halfCellSize,
      halfCellSize,
      halfCellSize,
      'bottom-right'
    );
  }
  if (cellTypes.includes('concave-top-right')) {
    cellPath += generateRotatedPath(
      x,
      y + halfCellSize,
      halfCellSize,
      halfCellSize,
      'bottom-left'
    );
  }
  if (cellTypes.includes('concave-bottom-left')) {
    cellPath += generateRotatedPath(
      x + halfCellSize,
      y,
      halfCellSize,
      halfCellSize,
      'top-right'
    );
  }
  if (cellTypes.includes('concave-bottom-right')) {
    cellPath += generateRotatedPath(
      x,
      y,
      halfCellSize,
      halfCellSize,
      'top-left'
    );
  }

  return cellPath;
};

const qrMatrixToPath = (matrix: boolean[][], size: number): string => {
  const cellSize = size / matrix.length;
  const cornerRadius = cellSize / 2;
  let path = '';

  for (let row = 0; row < matrix.length; row++) {
    if (matrix[row] === undefined) continue;
    for (let col = 0; col < matrix[row]!.length; col++) {
      const x = col * cellSize;
      const y = row * cellSize;
      const cellTypes = getCellType(matrix, row, col);

      if (isFilled(matrix, row, col)) {
        path += drawFilledCell(x, y, cellSize, cellTypes, cornerRadius);
      } else {
        path += drawEmptyCell(x, y, cellSize, cellTypes);
      }
    }
  }

  return path;
};

const QRCode: React.FC<QRCodeProps> = ({
  value,
  errorCorrection = 'MEDIUM',
  size = 200,
  backgroundColor = '#FFFFFF',
  foregroundColor = '#000000',
  quietZone = 2,
  logo,
  logoSize = 100,
  logoMargin = 2,
  imagePadding = 10,
  gradient,
  useCustomEyes = true,
  eyeColor = foregroundColor,
  shape = 'square',
  ...props
}) => {
  const matrix = generateQRMatrix(value, errorCorrection);
  const matrixWithoutEyes = useCustomEyes ? removeQRCodeEyes(matrix) : matrix;
  const pathWithImageCutOut = cutOutImage(
    matrixWithoutEyes,
    size,
    logoSize,
    logoSize,
    10
  );
  const path = qrMatrixToPath(pathWithImageCutOut, size);
  const logoPosition = (size - logoSize) / 2;

  return (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size}>
        <Rect x={0} y={0} width={size} height={size} fill={backgroundColor} />
        <Path d={path} fill={foregroundColor} />
      </Svg>
      {logo && (
        <View
          style={{
            backgroundColor: 'red',
            position: 'absolute',
            top: logoPosition,
            left: logoPosition,
            width: logoSize,
            height: logoSize,
          }}
        />
      )}
    </View>
  );
};

export default QRCode;

// <Image
//   source={{ uri: logo }}
//   style={{
// position: 'absolute',
// top: logoPosition,
// left: logoPosition,
// width: logoSize,
// height: logoSize,
//   }}
// />

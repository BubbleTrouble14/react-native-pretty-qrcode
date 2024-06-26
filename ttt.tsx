import qrcodegen from '@ribpay/qr-code-generator';
import React from 'react';
import type { ViewProps } from 'react-native';
import { View } from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';

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

// import './test';

function drawQRCode(matrix) {
  const filled = '██';
  const empty = '  ';

  for (let row of matrix) {
    let line = '';
    for (let cell of row) {
      line += cell ? filled : empty;
    }
    console.log(line);
  }
}

function generateRotatedPath(
  x,
  y,
  width,
  height,
  orientation,
  curveIntensity = 1
) {
  // Ensure curveIntensity is between 0 and 1
  curveIntensity = Math.max(0, Math.min(1, curveIntensity));

  // Invert the curveIntensity (1 becomes 0, 0 becomes 1)
  const invertedIntensity = 1 - curveIntensity;

  // Calculate the actual curve radius based on the inverted intensity
  const curveRadius = (Math.min(width, height) / 2) * invertedIntensity;

  let path;

  switch (orientation) {
    case 'top-left':
      path = `M ${x} ${y} L ${x} ${y + height} Q ${x + curveRadius} ${y + curveRadius} ${x + width} ${y}`;
      break;
    case 'top-right':
      path = `M ${x + width} ${y} L ${x + width} ${y + height} Q ${x + width - curveRadius} ${y + curveRadius} ${x} ${y}`;
      break;
    case 'bottom-left':
      path = `M ${x} ${y + height} L ${x + width} ${y + height} Q ${x + curveRadius} ${y + height - curveRadius} ${x} ${y}`;
      break;
    case 'bottom-right':
      path = `M ${x + width} ${y + height} L ${x} ${y + height} Q ${x + width - curveRadius} ${y + height - curveRadius} ${x + width} ${y}`;
      break;
    default:
      throw new Error(
        'Invalid orientation. Use "top-left", "top-right", "bottom-right", or "bottom-left".'
      );
  }

  return path;
}

function qrMatrixToPath(matrix, size) {
  let path = '';
  const cellSize = size / matrix.length; // Automatically determine cell size

  const filled = (x, y, cellSize) =>
    `M${x} ${y}h${cellSize}v${cellSize}h-${cellSize}Z`;

  const isFilled = (row, col) => {
    return (
      row >= 0 &&
      row < matrix.length &&
      col >= 0 &&
      col < matrix[row].length &&
      matrix[row][col]
    );
  };

  const getType = (row, col) => {
    const topLeft = isFilled(row - 1, col - 1);
    const top = isFilled(row - 1, col);
    const topRight = isFilled(row - 1, col + 1);
    const left = isFilled(row, col - 1);
    const right = isFilled(row, col + 1);
    const bottomLeft = isFilled(row + 1, col - 1);
    const bottom = isFilled(row + 1, col);
    const bottomRight = isFilled(row + 1, col + 1);

    if (top && bottom && !left && !right) return 'vertical-edge';
    if (left && right && !top && !bottom) return 'horizontal-edge';

    if (top && bottom && left && right) return 'filled';

    // Check for concave corners
    if (!isFilled(row, col)) {
      if (right && bottom && isFilled(row + 1, col + 1)) {
        return 'concave-top-left';
      } else if (left && bottom && isFilled(row + 1, col - 1)) {
        return 'concave-top-right';
      } else if (right && top && isFilled(row - 1, col + 1)) {
        return 'concave-bottom-left';
      } else if (left && top && isFilled(row - 1, col - 1)) {
        return 'concave-bottom-right';
      }
    } else {
      if (!left && !top) {
        return 'corner-top-left';
      } else if (!right && !top) {
        return 'corner-top-right';
      } else if (!left && !bottom) {
        return 'corner-bottom-left';
      } else if (!right && !bottom) {
        return 'corner-bottom-right';
      }
    }
    return 'unknown';
  };

  for (let row = 0; row < matrix.length; row++) {
    let rowLog = '';
    for (let col = 0; col < matrix[row].length; col++) {
      if (matrix[row][col]) {
        rowLog += '█';
      } else {
        rowLog += ' ';
      }
    }
    console.log(rowLog); // Log the entire row
  }

  const cornerRadius = cellSize / 2;

  for (let row = 0; row < matrix.length; row++) {
    for (let col = 0; col < matrix[row].length; col++) {
      const x = col * cellSize;
      const y = row * cellSize;
      const cellType = getType(row, col);
      switch (cellType) {
        case 'concave-top-left': {
          path += generateRotatedPath(
            x + cellSize / 2,
            y + cellSize / 2,
            cellSize / 2,
            cellSize / 2,
            'bottom-right'
          );
          break;
        }
        case 'concave-top-right': {
          path += generateRotatedPath(
            x,
            y + cellSize / 2,
            cellSize / 2,
            cellSize / 2,
            'bottom-left'
          );
          break;
        }
        case 'concave-bottom-left': {
          path += generateRotatedPath(
            x + cellSize / 2,
            y,
            cellSize / 2,
            cellSize / 2,
            'top-right'
          );
          break;
        }
        case 'concave-bottom-right': {
          path += generateRotatedPath(
            x,
            y,
            cellSize / 2,
            cellSize / 2,
            'top-left'
          );
          break;
        }
      }
      console.log(
        `Cell at (${row}, ${col}) with value ${matrix[row][col]} is a ${cellType}`
      );
      if (matrix[row][col]) {
        // // Handle top-left corner specially
        if (cellType === 'corner-top-left') {
          path += `M${x},${y + cornerRadius}q0,${-cornerRadius} ${cornerRadius},${-cornerRadius}`;
        } else {
          path += `M${x},${y}`;
        }
        path += `h${cellSize - (cellType === 'corner-top-left' ? cornerRadius : 0) - (cellType === 'corner-top-right' ? cornerRadius : 0)}`;
        path +=
          cellType === 'corner-top-right'
            ? `q${cornerRadius},0 ${cornerRadius},${cornerRadius}`
            : '';
        path += `v${cellSize - (cellType === 'corner-top-right' ? cornerRadius : 0) - (cellType === 'corner-bottom-right' ? cornerRadius : 0)}`;
        path +=
          cellType === 'corner-bottom-right'
            ? `q0,${cornerRadius} ${-cornerRadius},${cornerRadius}`
            : '';
        path += `h${-cellSize + (cellType === 'corner-bottom-right' ? cornerRadius : 0) + (cellType === 'corner-bottom-left' ? cornerRadius : 0)}`;
        path +=
          cellType === 'corner-bottom-left'
            ? `q${-cornerRadius},0 ${-cornerRadius},${-cornerRadius}`
            : '';
        path += `v${-cellSize + (cellType === 'corner-bottom-left' ? cornerRadius : 0) + (cellType === 'corner-top-left' ? cornerRadius : 0)}`;
        // switch (cellType) {
        //   case 'corner-top-left':
        //     path += `M${x + cornerRadius},${y} q-${cornerRadius},0 -${cornerRadius},${cornerRadius}`;
        //     path += `V${y + cellSize} H${x + cellSize} V${y}`;
        //     path += `H${x + cornerRadius}`;
        //     break;
        //   case 'corner-top-right':
        //     path += `M${x},${y} H${x + cellSize - cornerRadius} q${cornerRadius},0 ${cornerRadius},${cornerRadius}`;
        //     path += `V${y + cellSize} H${x} V${y}`;
        //     break;
        //   case 'corner-bottom-left':
        //     path += `M${x + cornerRadius},${y + cellSize} q-${cornerRadius},0 -${cornerRadius},-${cornerRadius}`;
        //     path += `V${y} H${x + cellSize} V${y + cellSize}`;
        //     path += `H${x + cornerRadius}`;
        //     break;
        //   case 'corner-bottom-right':
        //     path += `M${x},${y + cellSize} H${x + cellSize - cornerRadius} q${cornerRadius},0 ${cornerRadius},-${cornerRadius}`;
        //     path += `V${y} H${x} V${y + cellSize}`;
        //     break;
        //   default:
        //     path += `M${x},${y} H${x + cellSize} V${y + cellSize} H${x} V${y}`;
        //     break;
        // }
        // if (cellType === 'corner-top-left') {
        //   path += `M${x},${y + cornerRadius}q0,${-cornerRadius} ${cornerRadius},${-cornerRadius}`;
        // }
        // path += filled(x, y, cellSize);
      }
    }
  }

  console.log(path);

  return path;
}

// function qrMatrixToPath(matrix, size) {
//   let pathData = '';
//   const cellSize = size / matrix.length; // Automatically determine cell size
//   const filled = (x, y, cellSize) =>
//     `M${x} ${y}h${cellSize}v${cellSize}h-${cellSize}Z`;

//   for (let row = 0; row < matrix.length; row++) {
//     for (let col = 0; col < matrix[row].length; col++) {
//       if (matrix[row][col]) {
//         pathData += filled(col * cellSize, row * cellSize, cellSize);
//       }
//     }
//   }

//   return pathData;
// }

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
  useCustomEyes = false,
  eyeColor = foregroundColor,
  shape = 'square',
  ...props
}) => {
  const QRC = qrcodegen.QrCode;
  const qr =
    typeof value === 'string'
      ? QRC.encodeText(value, QRC.Ecc[errorCorrection])
      : QRC.encodeBinary(
          value as Readonly<Array<number>>,
          QRC.Ecc[errorCorrection]
        );

  const matrix: boolean[][] = Array.from({ length: qr.size }, (_, y) =>
    Array.from({ length: qr.size }, (_, x) => qr.getModule(x, y))
  );

  console.log('\n--------------------------------------------------\n');
  console.log('\n');

  // const matrix = [
  //   [true, true, true, true],
  //   [true, false, false, true],
  //   [true, false, false, true],
  //   [true, true, true, true],
  // ];

  // const matrix = [
  //   [false, true, true, false],
  //   [true, true, true, true],
  //   [true, true, true, true],
  //   [false, true, true, false],
  // ];

  console.log(matrix.length);

  drawQRCode(matrix, size / matrix.length);

  return (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size}>
        <Rect x={0} y={0} width={size} height={size} fill={backgroundColor} />
        <Path d={qrMatrixToPath(matrix, size)} />
      </Svg>
    </View>
  );
};

export default QRCode;

import qrcodegen from '@ribpay/qr-code-generator';

export const generateQRMatrix = (
  value: string | Readonly<Array<number>>,
  errorCorrection: keyof typeof qrcodegen.QrCode.Ecc
): boolean[][] => {
  const QRC = qrcodegen.QrCode;
  const qr =
    typeof value === 'string'
      ? QRC.encodeText(value, QRC.Ecc[errorCorrection])
      : QRC.encodeBinary(value, QRC.Ecc[errorCorrection]);

  return Array.from({ length: qr.size }, (_, y) =>
    Array.from({ length: qr.size }, (_, x) => qr.getModule(x, y))
  );
};

export const removeQRCodeEyes = (matrix: boolean[][]): boolean[][] => {
  if (matrix.length < 7) return matrix; // QR code must be at least 21x21

  const size = matrix.length;
  const eyeSize = 7; // QR code eyes are 7x7

  // Create a copy of the matrix
  const newMatrix = matrix.map((row) => [...row]);

  // Function to remove an eye
  const removeEye = (topX: number, topY: number) => {
    for (let y = topY; y < topY + eyeSize; y++) {
      for (let x = topX; x < topX + eyeSize; x++) {
        newMatrix[y]![x] = false;
      }
    }
  };

  // Remove top-left eye
  removeEye(0, 0);

  // Remove top-right eye
  removeEye(size - eyeSize, 0);

  // Remove bottom-left eye
  removeEye(0, size - eyeSize);

  return newMatrix;
};

export const cutOutImage = (
  matrix: boolean[][],
  qrCodeSize: number,
  imageWidth: number,
  imageHeight: number,
  imagePadding: number
): boolean[][] => {
  const matrixSize = matrix.length;
  const cellSize = qrCodeSize / matrixSize;

  const cutoutWidth = imageWidth + imagePadding;
  const cutoutHeight = imageHeight + imagePadding;

  console.log('QR Code Size', qrCodeSize);
  console.log('Image Width', imageWidth);
  console.log('Cell size', cellSize.toFixed(2));

  const startX = Math.floor((qrCodeSize / 2 - cutoutWidth / 2) / cellSize);
  const startY = Math.floor((qrCodeSize / 2 - cutoutHeight / 2) / cellSize);
  const endX = Math.ceil((qrCodeSize / 2 + cutoutWidth / 2) / cellSize);
  const endY = Math.ceil((qrCodeSize / 2 + cutoutHeight / 2) / cellSize);

  console.log('Start X', startX);
  console.log('Start Y', startY);
  console.log('End X', endX);
  console.log('End Y', endY);

  const newMatrix = matrix.map((row) => [...row]);

  for (let y = Math.max(0, startY); y < Math.min(endY, matrixSize); y++) {
    for (let x = Math.max(0, startX); x < Math.min(endX, matrixSize); x++) {
      newMatrix[y][x] = false;
    }
  }

  return newMatrix; // Return newMatrix instead of the original matrix
};

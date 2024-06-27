import qrcodegen from '@ribpay/qr-code-generator';
import React from 'react';
import type { ViewProps } from 'react-native';
import { View } from 'react-native';
import Svg, {
  Defs,
  G,
  LinearGradient,
  Path,
  Rect,
  Stop,
  Text,
} from 'react-native-svg';
import Eye from './Eye';
import {
  qrMatrixToCirclePath,
  qrMatrixToRoundedPath,
  qrMatrixToSquarePath,
} from './pattern';
import {
  calculateEyePositions,
  cutOutImage,
  generateQRMatrix,
  removeQRCodeEyes,
} from './utils';

type QRCodeProps = {
  value: string | Readonly<Array<number>>;
  errorCorrection?: keyof typeof qrcodegen.QrCode.Ecc;
  size?: number;
  backgroundColor?: string;
  foregroundColor?: string;
  borderRadius?: number;
  quietZone?: number;
  logo?: string;
  logoWidth?: number;
  logoHeight?: number;
  logoMargin?: number;
  pattern: 'rounded' | 'classic' | 'dots';
  gradient?: {
    start: string;
    end: string;
  };
  imagePadding?: number;
  useCustomEyes?: boolean;
  eyeColor?: string;
} & ViewProps;

const QRCode: React.FC<QRCodeProps> = ({
  value,
  errorCorrection = 'MEDIUM',
  size = 200,
  backgroundColor = '#FFFFFF',
  foregroundColor = '#000000',
  borderRadius = 0,
  quietZone = 4,
  logo,
  logoWidth = 100,
  logoHeight = 100,
  logoMargin = 2,
  imagePadding = 10,
  gradient,
  useCustomEyes = false,
  eyeColor = foregroundColor,
  pattern = 'classic',
}) => {
  const matrix = generateQRMatrix(value, errorCorrection);
  const matrixWithoutEyes = useCustomEyes ? removeQRCodeEyes(matrix) : matrix;

  const qrCodeSize = size - quietZone * 2;

  const pathWithImageCutOut = logo
    ? cutOutImage(matrixWithoutEyes, qrCodeSize, logoWidth, logoHeight, 10)
    : matrixWithoutEyes;

  let path: string;
  switch (pattern) {
    case 'rounded':
      path = qrMatrixToRoundedPath(pathWithImageCutOut, qrCodeSize);
      break;
    case 'classic':
      path = qrMatrixToSquarePath(pathWithImageCutOut, qrCodeSize);
      break;
    case 'dots':
      path = qrMatrixToCirclePath(pathWithImageCutOut, qrCodeSize);
      break;
    default:
      path = qrMatrixToRoundedPath(pathWithImageCutOut, qrCodeSize);
  }

  const logoXPosition = (qrCodeSize - logoWidth) / 2 + quietZone;
  const logoYPosition = (qrCodeSize - logoHeight) / 2 + quietZone;

  const eyes = calculateEyePositions(matrix, qrCodeSize);

  return (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size}>
        <Rect
          width="100%"
          height="100%"
          fill={backgroundColor}
          rx={borderRadius}
          ry={borderRadius}
        />
        <Defs>
          {gradient && (
            <LinearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor={gradient.start} />
              <Stop offset="100%" stopColor={gradient.end} />
            </LinearGradient>
          )}
        </Defs>

        <G transform={`translate(${quietZone},${quietZone})`}>
          <Path d={path} fill={gradient ? 'url(#grad)' : foregroundColor} />
          {useCustomEyes && (
            <>
              <Eye
                fillColor={gradient ? 'url(#grad)' : foregroundColor}
                size={eyes.size}
                x={eyes.topLeft.x + quietZone}
                y={eyes.topLeft.y + quietZone}
              />
              <Eye
                fillColor={gradient ? 'url(#grad)' : foregroundColor}
                size={eyes.size}
                x={eyes.bottomLeft.x + quietZone}
                y={eyes.bottomLeft.y + quietZone}
              />
              <Eye
                fillColor={gradient ? 'url(#grad)' : foregroundColor}
                size={eyes.size}
                x={eyes.topRight.x + quietZone}
                y={eyes.topRight.y + quietZone}
              />
            </>
          )}
        </G>

        {logo && (
          <Text
            x={logoXPosition}
            y={logoYPosition + 15}
            fontSize={20}
            // textAnchor="middle"
          >
            Hello, SVG Text!
          </Text>
          // <Text
          //   fill="black"
          //   fontSize="20"
          //   fontWeight="bold"
          // x={logoXPosition}
          // y={logoYPosition}
          // >
          //   Hello, SVG Text!
          // </Text>

          // <SvgImage
          // x={logoXPosition}
          // y={logoYPosition}
          // width={logoWidth}
          // height={logoHeight}
          //   href={logo}
          //   preserveAspectRatio="xMidYMid slice"
          //   clipPath="url(#clipCircle)"
          // />
        )}
      </Svg>
    </View>
  );
};

export default QRCode;

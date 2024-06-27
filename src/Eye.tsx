import React from 'react';
import { Path, G } from 'react-native-svg';

interface CustomEyeProps {
  x?: number;
  y?: number;
  size: number;
  fillColor: string;
}

const Eye = ({ x = 0, y = 0, size, fillColor }: CustomEyeProps) => (
  <G transform={`scale(${size / 40})`} x={x} y={y}>
    <Path
      clipRule="evenodd"
      d="M0 12C0 5.37258 5.37258 0 12 0H28C34.6274 0 40 5.37258 40 12V28C40 34.6274 34.6274 40 28 40H12C5.37258 40 0 34.6274 0 28V12ZM28 6.27451H12C8.8379 6.27451 6.27451 8.8379 6.27451 12V28C6.27451 31.1621 8.8379 33.7255 12 33.7255H28C31.1621 33.7255 33.7255 31.1621 33.7255 28V12C33.7255 8.8379 31.1621 6.27451 28 6.27451Z"
      fill={fillColor}
      fillRule="evenodd"
    />
    <Path
      d="M11 17C11 13.6863 13.6863 11 17 11H23C26.3137 11 29 13.6863 29 17V23C29 26.3137 26.3137 29 23 29H17C13.6863 29 11 26.3137 11 23V17Z"
      fill={fillColor}
    />
  </G>
);

export default Eye;

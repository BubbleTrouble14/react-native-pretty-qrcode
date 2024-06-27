import * as React from 'react';

import { StyleSheet, View } from 'react-native';
import QRCode from 'react-native-pretty-qrcode';
// import QRCode from '../../src/index';

export default function App() {
  const [result, setResult] = React.useState<number | undefined>();

  return (
    <View style={styles.container}>
      <QRCode
        errorCorrection="HIGH"
        size={400}
        value={'I love React Native!'}
        // backgroundColor="#d9d9d9"
        foregroundColor="#000000"
        quietZone={20}
        logo="https://img.freepik.com/free-photo/photo-delicious-hamburger-isolated-white-background_125540-3378.jpg"
        logoWidth={140}
        logoHeight={20}
        logoMargin={4}
        pattern="rounded"
        // useCustomEyes
        // squareRadius={10}
        // gradient={{ start: '#6a1b9a', end: '#ff53f6' }}
      />
      {/* <SkiaQrCode value={'dfsdfsdf'} pathStyle="stroke" size={400}></SkiaQrCode> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  box: {
    width: 60,
    height: 60,
    marginVertical: 20,
  },
});

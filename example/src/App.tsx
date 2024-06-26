import * as React from 'react';

import { StyleSheet, View, Text } from 'react-native';
import QRCode from 'react-native-pretty-qrcode';
// import QRCode from '../../src/index';

export default function App() {
  const [result, setResult] = React.useState<number | undefined>();

  return (
    <View style={styles.container}>
      <QRCode
        errorCorrection="LOW"
        size={400}
        value={'I Love u Isabela'}
        backgroundColor="#d9d9d9"
        foregroundColor="#000000"
        shape="merged"
        quietZone={1}
        logo="https://img.freepik.com/free-photo/photo-delicious-hamburger-isolated-white-background_125540-3378.jpg"
        logoSize={65}
        logoMargin={4}
        // useCustomEyes
        // squareRadius={10}
        // gradient={{ start: '#6a1b9a', end: '#53ffcb' }}
      />
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

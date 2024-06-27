import { Picker } from '@react-native-picker/picker';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import QRCode from 'react-native-pretty-qrcode';

const App: React.FC = () => {
  const [value, setValue] = useState('I love React Native!');
  const [size, setSize] = useState(400);
  const [foregroundColor, setForegroundColor] = useState('#000000');
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [quietZone, setQuietZone] = useState(20);
  const [logo, setLogo] = useState(
    'https://img.freepik.com/free-photo/photo-delicious-hamburger-isolated-white-background_125540-3378.jpg'
  );
  const [logoWidth, setLogoWidth] = useState(140);
  const [logoHeight, setLogoHeight] = useState(20);
  const [pattern, setPattern] = useState<'rounded' | 'classic' | 'dots'>(
    'rounded'
  );

  return (
    <View style={styles.container}>
      <View style={styles.qrcodeContainer}>
        <QRCode
          errorCorrection="HIGH"
          size={size}
          value={value}
          foregroundColor={foregroundColor}
          backgroundColor={backgroundColor}
          quietZone={quietZone}
          logo={logo}
          logoWidth={logoWidth}
          logoHeight={logoHeight}
          logoMargin={4}
          pattern={pattern}
          borderRadius={10}
        />
      </View>
      <ScrollView style={styles.controlPanel}>
        <Text style={styles.heading}>Customize Your QR Code</Text>
        <View style={styles.inputGroup}>
          <Text>Value:</Text>
          <TextInput
            style={styles.input}
            value={value}
            onChangeText={setValue}
          />
        </View>
        <View style={styles.inputGroup}>
          <Text>Size:</Text>
          <TextInput
            style={styles.input}
            value={size.toString()}
            onChangeText={(text) => setSize(Number(text))}
            keyboardType="numeric"
          />
        </View>
        <View style={styles.inputGroup}>
          <Text>Foreground Color:</Text>
          <TextInput
            style={styles.input}
            value={foregroundColor}
            onChangeText={setForegroundColor}
          />
        </View>
        <View style={styles.inputGroup}>
          <Text>Background Color:</Text>
          <TextInput
            style={styles.input}
            value={backgroundColor}
            onChangeText={setBackgroundColor}
          />
        </View>
        <View style={styles.inputGroup}>
          <Text>Quiet Zone:</Text>
          <TextInput
            style={styles.input}
            value={quietZone.toString()}
            onChangeText={(text) => setQuietZone(Number(text))}
            keyboardType="numeric"
          />
        </View>
        <View style={styles.inputGroup}>
          <Text>Logo URL:</Text>
          <TextInput style={styles.input} value={logo} onChangeText={setLogo} />
        </View>
        <View style={styles.inputGroup}>
          <Text>Logo Width:</Text>
          <TextInput
            style={styles.input}
            value={logoWidth.toString()}
            onChangeText={(text) => setLogoWidth(Number(text))}
            keyboardType="numeric"
          />
        </View>
        <View style={styles.inputGroup}>
          <Text>Logo Height:</Text>
          <TextInput
            style={styles.input}
            value={logoHeight.toString()}
            onChangeText={(text) => setLogoHeight(Number(text))}
            keyboardType="numeric"
          />
        </View>
        <View style={styles.inputGroup}>
          <Text>Pattern:</Text>
          <Picker
            selectedValue={pattern}
            onValueChange={(itemValue) => setPattern(itemValue)}
            style={styles.picker}
          >
            <Picker.Item label="Rounded" value="rounded" />
            <Picker.Item label="Dots" value="dots" />
            <Picker.Item label="Classic" value="classic" />
          </Picker>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
  },
  qrcodeContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  controlPanel: {
    width: 300,
    padding: 20,
    backgroundColor: 'white',
  },
  heading: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  inputGroup: {
    marginBottom: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 5,
    marginTop: 5,
  },
  picker: {
    marginTop: 5,
  },
});

export default App;

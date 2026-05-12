import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { CameraView } from './src/components/CameraView';

export default function App() {
  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <CameraView />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
});

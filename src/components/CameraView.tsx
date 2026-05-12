import React, { useEffect } from 'react';
import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { Camera, useCameraDevice, useCameraPermission } from 'react-native-vision-camera';
import { Canvas, Fill, Shader, Skia } from '@shopify/react-native-skia';
import { useSharedValue, withRepeat, withTiming, Easing, useDerivedValue } from 'react-native-reanimated';
import { FILM_GRAIN_SHADER } from '../shaders/FilmGrainShader';

const grainShader = Skia.RuntimeEffect.Make(FILM_GRAIN_SHADER);

export const CameraView = () => {
  const { hasPermission, requestPermission } = useCameraPermission();
  const device = useCameraDevice('back');
  const { width, height } = useWindowDimensions();

  // Valore condiviso per l'animazione della grana
  const time = useSharedValue(0);

  useEffect(() => {
    if (!hasPermission) {
      requestPermission();
    }
    
    // Anima il tempo all'infinito per cambiare il seme del rumore a 60 FPS
    time.value = withRepeat(
      withTiming(100, { duration: 100000, easing: Easing.linear }),
      -1,
      false
    );
  }, [hasPermission]);

  // Crea gli uniforms per lo shader in modo reattivo
  const uniforms = useDerivedValue(() => {
    return {
      time: time.value,
      resolution: [width, height]
    };
  }, [width, height]);

  if (!hasPermission) {
    return (
      <View style={styles.center}>
        <Text style={styles.text}>Richiesta permessi fotocamera...</Text>
      </View>
    );
  }

  if (device == null) {
    return (
      <View style={styles.center}>
        <Text style={styles.text}>Fotocamera non trovata</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Fotocamera Nativa (sotto) a 60 FPS */}
      <Camera
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={true}
      />
      
      {/* Skia Canvas trasparente per la grana (sopra) */}
      <Canvas style={StyleSheet.absoluteFill} pointerEvents="none">
        {/* Il blendMode 'overlay' mescola la grana realisticamente con i colori sottostanti */}
        <Fill blendMode="overlay">
          {grainShader && (
            <Shader source={grainShader} uniforms={uniforms} />
          )}
        </Fill>
      </Canvas>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  text: {
    color: '#fff',
    fontSize: 16,
  }
});

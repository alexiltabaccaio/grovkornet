import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Camera, useCameraDevice, useCameraPermission, useSkiaFrameProcessor } from 'react-native-vision-camera';
import { Skia, BlendMode } from '@shopify/react-native-skia';
import { useSharedValue, withRepeat, withTiming, Easing } from 'react-native-reanimated';
import { useSharedValue as useWCSharedValue } from 'react-native-worklets-core';
import { FILM_GRAIN_SHADER } from '../shaders/FilmGrainShader';
import { VerticalSliders } from './VerticalSliders';
import { Footer } from './Footer';

const grainShader = Skia.RuntimeEffect.Make(FILM_GRAIN_SHADER);

export const CameraView = () => {
  const { hasPermission, requestPermission } = useCameraPermission();
  const device = useCameraDevice('back');
  const [activeTab, setActiveTab] = React.useState<'grain' | 'saturation'>('grain');

  // Stati condivisi (UI Thread) per massime performance
  const grainEnabled = useSharedValue(false);
  const grainIntensity = useSharedValue(0.5);
  const saturation = useSharedValue(1.0);
  const time = useSharedValue(0);

  // Stati condivisi per il Frame Processor (Worklets Core Thread)
  const wcGrainEnabled = useWCSharedValue(false);
  const wcGrainIntensity = useWCSharedValue(0.5);
  const wcSaturation = useWCSharedValue(1.0);

  useEffect(() => {
    if (!hasPermission) {
      requestPermission();
    }

    // Anima il tempo all'infinito per la grana
    time.value = withRepeat(
      withTiming(100, { duration: 100000, easing: Easing.linear }),
      -1,
      false
    );
  }, [hasPermission]);

  // Il Frame Processor esegue il codice ad ogni singolo frame video sulla GPU
  const frameProcessor = useSkiaFrameProcessor((frame) => {
    'worklet';

    const paint = Skia.Paint();
    const s = wcSaturation.value;

    // Matrice di colore per controllare la saturazione
    const R = 0.2126;
    const G = 0.7152;
    const B = 0.0722;

    const colorMatrix = [
      R + (1 - R) * s, G - G * s, B - B * s, 0, 0,
      R - R * s, G + (1 - G) * s, B - B * s, 0, 0,
      R - R * s, G - G * s, B + (1 - B) * s, 0, 0,
      0, 0, 0, 1, 0,
    ];

    const filter = Skia.ImageFilter.MakeColorFilter(
      Skia.ColorFilter.MakeMatrix(colorMatrix),
      null
    );
    paint.setImageFilter(filter);

    // Disegna il frame nativo applicando il filtro colore
    frame.render(paint);

    // Se la grana è attiva, disegnala direttamente sopra al frame
    if (wcGrainEnabled.value && grainShader) {
      const grainPaint = Skia.Paint();

      // Passa gli uniform al file shader: [time, resolution.x, resolution.y]
      // Usiamo il modulo per evitare che il tempo diventi un numero troppo grande 
      // (i float in GLSL perdono precisione e rompono il rumore se superano i milioni)
      const now = typeof Date !== 'undefined' ? (Date.now() % 100000) / 1000.0 : 0;
      const shaderUniforms = [now, frame.width, frame.height, wcGrainIntensity.value];
      grainPaint.setShader(grainShader.makeShader(shaderUniforms));
      grainPaint.setBlendMode(BlendMode.Overlay);

      frame.drawRect(Skia.XYWHRect(0, 0, frame.width, frame.height), grainPaint);
    }
  }, []);

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
      {/* Fotocamera Nativa con Skia Frame Processor integrato */}
      <Camera
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={true}
        pixelFormat="rgb"
        frameProcessor={frameProcessor}
      />

      {/* Slider Verticali Laterali */}
      <VerticalSliders
        grainIntensity={grainIntensity}
        saturation={saturation}
        activeTab={activeTab}
        onGrainIntensityChange={(val) => { wcGrainIntensity.value = val; }}
        onSaturationChange={(val) => { wcSaturation.value = val; }}
      />

      {/* Footer semplificato */}
      <Footer
        enabled={grainEnabled}
        onGrainToggle={(val) => { wcGrainEnabled.value = val; }}
        onTabChange={(tab) => setActiveTab(tab)}
      />
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
  },
});

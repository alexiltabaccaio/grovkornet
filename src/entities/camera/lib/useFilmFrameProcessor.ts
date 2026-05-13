import { useSkiaFrameProcessor } from 'react-native-vision-camera';
import { Skia, BlendMode } from '@shopify/react-native-skia';
import { Worklets, useSharedValue as useWCSharedValue } from 'react-native-worklets-core';
import { UBER_FILM_SHADER } from '../../../shared/shaders/UberFilmShader';

// --- UBER SHADER INITIALIZATION ---
// Compilato globalmente per evitare riallocazioni ad ogni frame.
// In caso di errore di compilazione o minificazione (spesso in Release), 
// 'filmRuntimeEffect' sarà null.
const filmRuntimeEffect = Skia.RuntimeEffect.Make(UBER_FILM_SHADER);

if (!filmRuntimeEffect) {
  console.error("FAILED TO COMPILE UBER_FILM_SHADER. Check for syntax errors or minification issues in release builds.");
}

interface UseFilmFrameProcessorProps {
  wcGrainEnabled: { value: boolean };
  wcGrainIntensity: { value: number };
  wcSaturation: { value: number };
  wcContrast: { value: number };
  wcChromaticAberration: { value: number };
  onDebugUpdate?: (fps: number, resolution: string) => void;
}

export const useFilmFrameProcessor = ({
  wcGrainEnabled,
  wcGrainIntensity,
  wcSaturation,
  wcContrast,
  wcChromaticAberration,
  onDebugUpdate,
}: UseFilmFrameProcessorProps) => {
  const lastFrameTime = useWCSharedValue(0);
  const lastLogTime = useWCSharedValue(0);
  const framesCount = useWCSharedValue(0);

  return useSkiaFrameProcessor((frame) => {
    'worklet';

    const now = performance.now();
    
    // Accumuliamo il conteggio dei frame
    framesCount.value += 1;

    // Aggiorniamo la UI ogni 500ms con una media reale
    if (now - lastLogTime.value >= 500 && onDebugUpdate) {
      const actualFps = Math.round((framesCount.value * 1000) / (now - lastLogTime.value));
      onDebugUpdate(actualFps, `${frame.width}x${frame.height}`);
      lastLogTime.value = now;
      framesCount.value = 0; // reset
    }

    if (!filmRuntimeEffect) {
      // Fallback a pass-through se lo shader fallisce la compilazione in release
      return;
    }

    const paint = Skia.Paint();
    
    // Creiamo il builder per passare gli uniform
    const builder = Skia.RuntimeShaderBuilder(filmRuntimeEffect);
    
    // Seed del tempo per la grana (limitato per precisione float)
    const timeSeed = typeof Date !== 'undefined' ? (Date.now() % 10000) / 1000.0 : 0.0;
    
    builder.setUniform('resolution', [frame.width, frame.height]);
    builder.setUniform('time', [timeSeed]);
    builder.setUniform('saturation', [wcSaturation.value]);
    builder.setUniform('contrast', [wcContrast.value]);
    builder.setUniform('aberrationIntensity', [wcChromaticAberration.value]);
    builder.setUniform('grainIntensity', [wcGrainIntensity.value]);
    builder.setUniform('grainEnabled', [wcGrainEnabled.value ? 1.0 : 0.0]);

    // Usiamo null come childShaderName perché c'è un solo `uniform shader` nel codice
    const runtimeShader = Skia.ImageFilter.MakeRuntimeShader(builder, null, null);

    if (runtimeShader) {
      paint.setImageFilter(runtimeShader);
    }

    frame.render(paint);
  }, []);
};

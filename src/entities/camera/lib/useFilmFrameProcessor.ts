import { useSkiaFrameProcessor } from 'react-native-vision-camera';
import { Skia } from '@shopify/react-native-skia';
import { UBER_FILM_SHADER } from '@shared/shaders/UberFilmShader';
import { SHADER_TIME_MODULO, SHADER_TIME_DIVISOR } from '@shared/constants/videoProcessing';

const uberEffect = Skia.RuntimeEffect.Make(UBER_FILM_SHADER);

interface UseFilmFrameProcessorProps {
  wcGrainEnabled: { value: boolean };
  wcGrainIntensity: { value: number };
  wcSaturation: { value: number };
  wcContrast: { value: number };
  wcChromaticAberration: { value: number };
}

export const useFilmFrameProcessor = ({
  wcGrainEnabled,
  wcGrainIntensity,
  wcSaturation,
  wcContrast,
  wcChromaticAberration,
}: UseFilmFrameProcessorProps) => {
  return useSkiaFrameProcessor((frame) => {
    'worklet';

    const paint = Skia.Paint();
    
    if (uberEffect) {
      const builder = Skia.RuntimeShaderBuilder(uberEffect);
      
      // Basic Uniforms
      builder.setUniform('resolution', [frame.width, frame.height]);
      const now = typeof Date !== 'undefined' ? (Date.now() % SHADER_TIME_MODULO) / SHADER_TIME_DIVISOR : 0;
      builder.setUniform('time', [now]);
      
      // Color & Effect Uniforms
      builder.setUniform('saturation', [wcSaturation.value]);
      builder.setUniform('contrast', [wcContrast.value]);
      builder.setUniform('aberrationIntensity', [wcChromaticAberration.value]);
      builder.setUniform('grainIntensity', [wcGrainIntensity.value]);
      builder.setUniform('grainEnabled', [wcGrainEnabled.value ? 1.0 : 0.0]);
      
      // Apply the Uber Shader as an ImageFilter
      const shader = Skia.ImageFilter.MakeRuntimeShader(builder, 'image', null);
      if (shader) {
        paint.setImageFilter(shader);
      }
    }

    // Single rendering pass
    frame.render(paint);
  }, []);
};

import { useSkiaFrameProcessor } from 'react-native-vision-camera';
import { Skia, BlendMode } from '@shopify/react-native-skia';
import { FILM_GRAIN_SHADER } from '../shaders/FilmGrainShader';
import { COLOR_MATRIX_CONSTANTS } from '../constants/videoFilters';

const grainShader = Skia.RuntimeEffect.Make(FILM_GRAIN_SHADER);

interface UseFilmFrameProcessorProps {
  wcGrainEnabled: { value: boolean };
  wcGrainIntensity: { value: number };
  wcSaturation: { value: number };
}

export const useFilmFrameProcessor = ({
  wcGrainEnabled,
  wcGrainIntensity,
  wcSaturation,
}: UseFilmFrameProcessorProps) => {
  return useSkiaFrameProcessor((frame) => {
    'worklet';

    const paint = Skia.Paint();
    const s = wcSaturation.value;

    const { R, G, B } = COLOR_MATRIX_CONSTANTS;

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

    frame.render(paint);

    if (wcGrainEnabled.value && grainShader) {
      const grainPaint = Skia.Paint();
      const now = typeof Date !== 'undefined' ? (Date.now() % 100000) / 1000.0 : 0;
      const shaderUniforms = [now, frame.width, frame.height, wcGrainIntensity.value];
      
      grainPaint.setShader(grainShader.makeShader(shaderUniforms));
      grainPaint.setBlendMode(BlendMode.Overlay);

      frame.drawRect(Skia.XYWHRect(0, 0, frame.width, frame.height), grainPaint);
    }
  }, []);
};

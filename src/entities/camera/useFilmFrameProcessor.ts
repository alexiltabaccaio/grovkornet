import { useSkiaFrameProcessor } from 'react-native-vision-camera';
import { Skia, BlendMode } from '@shopify/react-native-skia';
import { FILM_GRAIN_SHADER } from '@shared/shaders/FilmGrainShader';
import { COLOR_MATRIX_CONSTANTS } from '@shared/constants/videoProcessing';

const grainShader = Skia.RuntimeEffect.Make(FILM_GRAIN_SHADER);

interface UseFilmFrameProcessorProps {
  wcGrainEnabled: { value: boolean };
  wcGrainIntensity: { value: number };
  wcSaturation: { value: number };
  wcContrast: { value: number };
}

export const useFilmFrameProcessor = ({
  wcGrainEnabled,
  wcGrainIntensity,
  wcSaturation,
  wcContrast,
}: UseFilmFrameProcessorProps) => {
  return useSkiaFrameProcessor((frame) => {
    'worklet';

    const paint = Skia.Paint();
    const s = wcSaturation.value;
    const c = wcContrast.value;

    const { R, G, B } = COLOR_MATRIX_CONSTANTS;

    const saturationMatrix = [
      R + (1 - R) * s, G - G * s, B - B * s, 0, 0,
      R - R * s, G + (1 - G) * s, B - B * s, 0, 0,
      R - R * s, G - G * s, B + (1 - B) * s, 0, 0,
      0, 0, 0, 1, 0,
    ];

    const t = 0.5 * (1.0 - c);
    const contrastMatrix = [
      c, 0, 0, 0, t,
      0, c, 0, 0, t,
      0, 0, c, 0, t,
      0, 0, 0, 1, 0,
    ];

    const saturationFilter = Skia.ImageFilter.MakeColorFilter(
      Skia.ColorFilter.MakeMatrix(saturationMatrix),
      null
    );

    const contrastFilter = Skia.ImageFilter.MakeColorFilter(
      Skia.ColorFilter.MakeMatrix(contrastMatrix),
      null
    );

    // Compose filters: inner filter first (saturation), then outer (contrast)
    // We compose if there's an API, but since MakeCompose exists in Skia:
    if (Skia.ImageFilter.MakeCompose) {
      paint.setImageFilter(Skia.ImageFilter.MakeCompose(contrastFilter, saturationFilter));
    } else {
      // Fallback if MakeCompose isn't available (though it is in RN Skia)
      // We can chain ColorFilters
      const combinedColorFilter = Skia.ColorFilter.MakeCompose(
        Skia.ColorFilter.MakeMatrix(contrastMatrix),
        Skia.ColorFilter.MakeMatrix(saturationMatrix)
      );
      paint.setImageFilter(Skia.ImageFilter.MakeColorFilter(combinedColorFilter, null));
    }

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

import { useSkiaFrameProcessor } from 'react-native-vision-camera';
import { Skia, BlendMode } from '@shopify/react-native-skia';
import { Worklets, useSharedValue as useWCSharedValue } from 'react-native-worklets-core';

// --- PRE-ALLOCATED STATIC FILTERS FOR PERFORMANCE ---
// Allocare oggetti Skia a 60 FPS dentro il Worklet causa Out Of Memory (Schermo Nero)
const rMatrix = [1,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,1,0];
const gMatrix = [0,0,0,0,0, 0,1,0,0,0, 0,0,0,0,0, 0,0,0,1,0];
const bMatrix = [0,0,0,0,0, 0,0,0,0,0, 0,0,1,0,0, 0,0,0,1,0];

const rColorFilterBase = Skia.ColorFilter.MakeMatrix(rMatrix);
const gColorFilterBase = Skia.ColorFilter.MakeMatrix(gMatrix);
const bColorFilterBase = Skia.ColorFilter.MakeMatrix(bMatrix);

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
    
    // --- 1. Saturation & Contrast (ColorMatrix) ---
    const s = wcSaturation.value;
    const c = wcContrast.value;
    
    const sr = (1 - s) * 0.2126;
    const sg = (1 - s) * 0.7152;
    const sb = (1 - s) * 0.0722;
    
    const satMatrix = [
      sr + s, sg,     sb,     0, 0,
      sr,     sg + s, sb,     0, 0,
      sr,     sg,     sb + s, 0, 0,
      0,      0,      0,      1, 0,
    ];
    
    const t = (1 - c) * 0.5; // Offset per contrasto normalizzato in Skia (0..1)
    const conMatrix = [
      c, 0, 0, 0, t,
      0, c, 0, 0, t,
      0, 0, c, 0, t,
      0, 0, 0, 1, 0,
    ];
    
    // Creiamo i filtri nativi
    const satFilter = Skia.ColorFilter.MakeMatrix(satMatrix);
    const conFilter = Skia.ColorFilter.MakeMatrix(conMatrix);
    
    // Combiniamo i filtri colore
    const composedColorFilter = Skia.ColorFilter.MakeCompose(conFilter, satFilter);
    let finalImageFilter = Skia.ImageFilter.MakeColorFilter(composedColorFilter, null);
    
    // --- 2. Chromatic Aberration (Linear Offset) ---
    // Manteniamo il range ridotto (3.0) come richiesto, ma applichiamo un microscopico
    // "freno" prima del limite massimo. La GPU va in crash se riceve un numero 
    // matematicamente perfetto alla fine del range (triggera un bug interno di Skia).
    const safeAberration = Math.min(wcChromaticAberration.value, 1.999);
    const caAmount = safeAberration * 3.0 + 0.001; // Evitiamo sempre gli interi esatti
    
    if (caAmount > 0.1) {
      // Usiamo i filtri base pre-allocati per isolare i canali senza consumare memoria extra
      const rFilter = Skia.ImageFilter.MakeColorFilter(rColorFilterBase, finalImageFilter);
      const gFilter = Skia.ImageFilter.MakeColorFilter(gColorFilterBase, finalImageFilter);
      const bFilter = Skia.ImageFilter.MakeColorFilter(bColorFilterBase, finalImageFilter);
      
      // Spostiamo Rosso a sinistra e Blu a destra
      const rOffset = Skia.ImageFilter.MakeOffset(-caAmount, 0, rFilter);
      const bOffset = Skia.ImageFilter.MakeOffset(caAmount, 0, bFilter);
      
      // Fondiamo i canali
      const rgBlend = Skia.ImageFilter.MakeBlend(BlendMode.Screen, rOffset, gFilter);
      finalImageFilter = Skia.ImageFilter.MakeBlend(BlendMode.Screen, bOffset, rgBlend);
    }
    
    // --- 3. Film Grain (Native High-Contrast B&W Noise) ---
    if (wcGrainEnabled.value) {
      // Velocità massima: usiamo direttamente i millisecondi (salti ampi) per far 'friggere' il rumore come vero TV static
      const timeSeed = typeof Date !== 'undefined' ? (Date.now() % 100000) : 0;
      
      const noiseShader = Skia.Shader.MakeFractalNoise(
        0.5, 0.5, 
        1,        
        timeSeed,
        0, 0
      );
      
      const noiseFilter = Skia.ImageFilter.MakeShader(noiseShader, null);
      
      // Aumentiamo il contrasto da 5.0 a 8.0 per una "distorsione" più violenta al massimo
      const noiseContrast = 8.0; 
      const t = (1 - noiseContrast) * 0.5; 
      // Permettiamo all'intensità di sforare 1.0 per distruggere completamente l'immagine
      const grainInt = wcGrainIntensity.value * 2.0; 
      
      // Pesi di luminanza per convertire il rumore a colori in puro BIANCO E NERO
      const lr = 0.2126 * noiseContrast;
      const lg = 0.7152 * noiseContrast;
      const lb = 0.0722 * noiseContrast;
      
      const sharpNoiseMatrix = [
        lr, lg, lb, 0, t, // Canale Rosso = Media B&W
        lr, lg, lb, 0, t, // Canale Verde = Media B&W
        lr, lg, lb, 0, t, // Canale Blu = Media B&W
        0,  0,  0,  grainInt, 0, // Alpha controllata dall'intensità
      ];
      
      const sharpNoiseFilter = Skia.ImageFilter.MakeColorFilter(
        Skia.ColorFilter.MakeMatrix(sharpNoiseMatrix), 
        noiseFilter
      );
      
      finalImageFilter = Skia.ImageFilter.MakeBlend(BlendMode.Overlay, finalImageFilter, sharpNoiseFilter);
    }

    if (finalImageFilter) {
      paint.setImageFilter(finalImageFilter);
    }

    frame.render(paint);
  }, []);
};

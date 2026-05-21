import { SharedValue } from 'react-native-reanimated';

export interface FilmCapabilities {
  availableNoiseReductionModes?: number[];
  availableEdgeModes?: number[];
}

interface FilmState {
  grainIntensity: SharedValue<number>;
  grainChroma: SharedValue<number>;
  grainSize: SharedValue<number>;
  grainEnabled: SharedValue<boolean>;
  saturation: SharedValue<number>;
  contrast: SharedValue<number>;
  chromaticAberration: SharedValue<number>;
  aberrationDirection: SharedValue<number>;
  noiseReductionAuto: SharedValue<boolean>;
  noiseReductionMode: SharedValue<number>;
  sharpening: SharedValue<number>;
  bloomEnabled: SharedValue<boolean>;
  bloomIntensity: SharedValue<number>;
  temperature: SharedValue<number>;
  tint: SharedValue<number>;
  temperatureAuto: SharedValue<boolean>;
  capabilities?: FilmCapabilities;
}

interface FilmActions {
  setGrainIntensity: (value: number) => void;
  setGrainChroma: (value: number) => void;
  setGrainSize: (value: number) => void;
  setSaturation: (value: number) => void;
  setContrast: (value: number) => void;
  setChromaticAberration: (value: number) => void;
  setAberrationDirection: (value: number) => void;
  setGrainEnabled: (value: boolean) => void;
  setNoiseReductionAuto: (value: boolean) => void;
  setNoiseReductionMode: (mode: number) => void;
  setSharpening: (value: number) => void;
  setBloomEnabled: (value: boolean) => void;
  setBloomIntensity: (value: number) => void;
  setTemperature: (value: number) => void;
  setTint: (value: number) => void;
  setTemperatureAuto: (value: boolean) => void;
  setCapabilities?: (capabilities: FilmCapabilities) => void;
  resetEffect: (effect: string) => void;
}

export interface FilmStore extends FilmState, FilmActions {}

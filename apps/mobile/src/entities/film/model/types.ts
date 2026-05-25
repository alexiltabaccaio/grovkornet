import { SharedValue } from 'react-native-reanimated';

export interface FilmCapabilities {
  availableNoiseReductionModes?: number[];
  availableEdgeModes?: number[];
}

interface FilmState {
  grainIntensity: SharedValue<number>;
  grainChroma: SharedValue<number>;
  grainSize: SharedValue<number>;
  grainSpeed: SharedValue<number>;
  grainEnabled: SharedValue<boolean>;
  saturation: SharedValue<number>;
  contrast: SharedValue<number>;
  chromaticAberration: SharedValue<number>;
  aberrationDirection: SharedValue<number>;
  aberrationInvert: SharedValue<boolean>;
  noiseReductionAuto: SharedValue<boolean>;
  noiseReductionMode: SharedValue<number>;
  sharpening: SharedValue<number>;
  bloomEnabled: SharedValue<boolean>;
  bloomIntensity: SharedValue<number>;
  temperature: SharedValue<number>;
  tint: SharedValue<number>;
  temperatureAuto: SharedValue<boolean>;
  satRed: SharedValue<number>;
  satOrange: SharedValue<number>;
  satYellow: SharedValue<number>;
  satGreen: SharedValue<number>;
  satCyan: SharedValue<number>;
  satBlue: SharedValue<number>;
  satPurple: SharedValue<number>;
  satMagenta: SharedValue<number>;
  boundMagentaRed: SharedValue<number>;
  boundRedOrange: SharedValue<number>;
  boundOrangeYellow: SharedValue<number>;
  boundYellowGreen: SharedValue<number>;
  boundGreenCyan: SharedValue<number>;
  boundCyanBlue: SharedValue<number>;
  boundBluePurple: SharedValue<number>;
  boundPurpleMagenta: SharedValue<number>;
  capabilities?: FilmCapabilities;
}

interface FilmActions {
  setGrainIntensity: (value: number) => void;
  setGrainChroma: (value: number) => void;
  setGrainSize: (value: number) => void;
  setGrainSpeed: (value: number) => void;
  setSaturation: (value: number) => void;
  setContrast: (value: number) => void;
  setChromaticAberration: (value: number) => void;
  setAberrationDirection: (value: number) => void;
  setAberrationInvert: (value: boolean) => void;
  setGrainEnabled: (value: boolean) => void;
  setNoiseReductionAuto: (value: boolean) => void;
  setNoiseReductionMode: (mode: number) => void;
  setSharpening: (value: number) => void;
  setBloomEnabled: (value: boolean) => void;
  setBloomIntensity: (value: number) => void;
  setTemperature: (value: number) => void;
  setTint: (value: number) => void;
  setTemperatureAuto: (value: boolean) => void;
  setSatRed: (value: number) => void;
  setSatOrange: (value: number) => void;
  setSatYellow: (value: number) => void;
  setSatGreen: (value: number) => void;
  setSatCyan: (value: number) => void;
  setSatBlue: (value: number) => void;
  setSatPurple: (value: number) => void;
  setSatMagenta: (value: number) => void;
  setBoundMagentaRed: (value: number) => void;
  setBoundRedOrange: (value: number) => void;
  setBoundOrangeYellow: (value: number) => void;
  setBoundYellowGreen: (value: number) => void;
  setBoundGreenCyan: (value: number) => void;
  setBoundCyanBlue: (value: number) => void;
  setBoundBluePurple: (value: number) => void;
  setBoundPurpleMagenta: (value: number) => void;
  setCapabilities?: (capabilities: FilmCapabilities) => void;
  resetEffect: (effect: string) => void;
}

export interface FilmStore extends FilmState, FilmActions {}

import { SharedValue } from 'react-native-reanimated';

export interface FilmCapabilities {
  availableNoiseReductionModes?: number[];
  availableEdgeModes?: number[];
}

interface FilmState {
  // @@GEN_STATE_START@@
  saturation: SharedValue<number>;
  contrast: SharedValue<number>;
  grainIntensity: SharedValue<number>;
  grainChroma: SharedValue<number>;
  grainSize: SharedValue<number>;
  grainSpeed: SharedValue<number>;
  temperature: SharedValue<number>;
  tint: SharedValue<number>;
  bloomIntensity: SharedValue<number>;
  chromaticAberration: SharedValue<number>;
  aberrationDirection: SharedValue<number>;
  sharpening: SharedValue<number>;
  satRed: SharedValue<number>;
  satOrange: SharedValue<number>;
  satYellow: SharedValue<number>;
  satGreen: SharedValue<number>;
  satCyan: SharedValue<number>;
  satBlue: SharedValue<number>;
  satPurple: SharedValue<number>;
  satMagenta: SharedValue<number>;
  aberrationInvert: SharedValue<boolean>;
  boundMagentaRed: SharedValue<number>;
  boundRedOrange: SharedValue<number>;
  boundOrangeYellow: SharedValue<number>;
  boundYellowGreen: SharedValue<number>;
  boundGreenCyan: SharedValue<number>;
  boundCyanBlue: SharedValue<number>;
  boundBluePurple: SharedValue<number>;
  boundPurpleMagenta: SharedValue<number>;
  grainRoughness: SharedValue<number>;
  grainEnabled: SharedValue<boolean>;
  bloomEnabled: SharedValue<boolean>;
  noiseReductionMode: SharedValue<number>;
  noiseReductionAuto: SharedValue<boolean>;
  temperatureAuto: SharedValue<boolean>;
  isSelfieCamera: SharedValue<boolean>;
  // @@GEN_STATE_END@@
  capabilities?: FilmCapabilities;
}

interface FilmActions {
  // @@GEN_ACTIONS_START@@
  setSaturation: (value: number) => void;
  setContrast: (value: number) => void;
  setGrainIntensity: (value: number) => void;
  setGrainChroma: (value: number) => void;
  setGrainSize: (value: number) => void;
  setGrainSpeed: (value: number) => void;
  setTemperature: (value: number) => void;
  setTint: (value: number) => void;
  setBloomIntensity: (value: number) => void;
  setChromaticAberration: (value: number) => void;
  setAberrationDirection: (value: number) => void;
  setSharpening: (value: number) => void;
  setSatRed: (value: number) => void;
  setSatOrange: (value: number) => void;
  setSatYellow: (value: number) => void;
  setSatGreen: (value: number) => void;
  setSatCyan: (value: number) => void;
  setSatBlue: (value: number) => void;
  setSatPurple: (value: number) => void;
  setSatMagenta: (value: number) => void;
  setAberrationInvert: (value: boolean) => void;
  setBoundMagentaRed: (value: number) => void;
  setBoundRedOrange: (value: number) => void;
  setBoundOrangeYellow: (value: number) => void;
  setBoundYellowGreen: (value: number) => void;
  setBoundGreenCyan: (value: number) => void;
  setBoundCyanBlue: (value: number) => void;
  setBoundBluePurple: (value: number) => void;
  setBoundPurpleMagenta: (value: number) => void;
  setGrainRoughness: (value: number) => void;
  setGrainEnabled: (value: boolean) => void;
  setBloomEnabled: (value: boolean) => void;
  setNoiseReductionMode: (mode: number) => void;
  setNoiseReductionAuto: (value: boolean) => void;
  setTemperatureAuto: (value: boolean) => void;
  setIsSelfieCamera: (value: boolean) => void;
  // @@GEN_ACTIONS_END@@
  setCapabilities?: (capabilities: FilmCapabilities) => void;
  resetEffect: (effect: string) => void;
}

export interface FilmStore extends FilmState, FilmActions {}

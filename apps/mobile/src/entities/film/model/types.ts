import { SharedValue } from 'react-native-reanimated';
import { ParameterType } from '../../system/model/types';

export interface FilmCapabilities {
  availableNoiseReductionModes?: number[];
  availableEdgeModes?: number[];
}

interface FilmState {
  // @@GEN_STATE_START@@
  noiseReductionMode: SharedValue<number>;
  noiseReductionAuto: SharedValue<boolean>;
  temperatureAuto: SharedValue<boolean>;
  isSelfieCamera: SharedValue<boolean>;
  saturation: SharedValue<number>;
  contrast: SharedValue<number>;
  grainIntensity: SharedValue<number>;
  grainChroma: SharedValue<number>;
  grainSize: SharedValue<number>;
  grainSpeed: SharedValue<number>;
  vignetteIntensity: SharedValue<number>;
  chromaShift: SharedValue<number>;
  temperature: SharedValue<number>;
  tint: SharedValue<number>;
  bloomIntensity: SharedValue<number>;
  chromaticAberration: SharedValue<number>;
  chromaShiftDirection: SharedValue<number>;
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
  blackLevel: SharedValue<number>;
  highlights: SharedValue<number>;
  pivot: SharedValue<number>;
  contrastAuto: SharedValue<boolean>;
  blackLevelAuto: SharedValue<boolean>;
  highlightsAuto: SharedValue<boolean>;
  pivotAuto: SharedValue<boolean>;
  pixelationFactor: SharedValue<number>;
  tapeJitter: SharedValue<number>;
  scanlines: SharedValue<number>;
  chromaShiftInvert: SharedValue<boolean>;
  hue: SharedValue<number>;
  hueRed: SharedValue<number>;
  hueOrange: SharedValue<number>;
  hueYellow: SharedValue<number>;
  hueGreen: SharedValue<number>;
  hueCyan: SharedValue<number>;
  hueBlue: SharedValue<number>;
  huePurple: SharedValue<number>;
  hueMagenta: SharedValue<number>;
  scanlinesHorizontal: SharedValue<boolean>;
  scanlinesMode: SharedValue<number>;
  scanlinesDensity: SharedValue<number>;
  // @@GEN_STATE_END@@
  capabilities?: FilmCapabilities;
}

interface FilmActions {
  // @@GEN_ACTIONS_START@@
  setNoiseReductionMode: (mode: number) => void;
  setNoiseReductionAuto: (value: boolean) => void;
  setTemperatureAuto: (value: boolean) => void;
  setIsSelfieCamera: (value: boolean) => void;
  setSaturation: (value: number) => void;
  setContrast: (value: number) => void;
  setGrainIntensity: (value: number) => void;
  setGrainChroma: (value: number) => void;
  setGrainSize: (value: number) => void;
  setGrainSpeed: (value: number) => void;
  setVignetteIntensity: (value: number) => void;
  setChromaShift: (value: number) => void;
  setTemperature: (value: number) => void;
  setTint: (value: number) => void;
  setBloomIntensity: (value: number) => void;
  setChromaticAberration: (value: number) => void;
  setChromaShiftDirection: (value: number) => void;
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
  setBlackLevel: (value: number) => void;
  setHighlights: (value: number) => void;
  setPivot: (value: number) => void;
  setContrastAuto: (value: boolean) => void;
  setBlackLevelAuto: (value: boolean) => void;
  setHighlightsAuto: (value: boolean) => void;
  setPivotAuto: (value: boolean) => void;
  setPixelationFactor: (value: number) => void;
  setTapeJitter: (value: number) => void;
  setScanlines: (value: number) => void;
  setChromaShiftInvert: (value: boolean) => void;
  setHue: (value: number) => void;
  setHueRed: (value: number) => void;
  setHueOrange: (value: number) => void;
  setHueYellow: (value: number) => void;
  setHueGreen: (value: number) => void;
  setHueCyan: (value: number) => void;
  setHueBlue: (value: number) => void;
  setHuePurple: (value: number) => void;
  setHueMagenta: (value: number) => void;
  setScanlinesHorizontal: (value: boolean) => void;
  setScanlinesMode: (value: number) => void;
  setScanlinesDensity: (value: number) => void;
  // @@GEN_ACTIONS_END@@
  setCapabilities?: (capabilities: FilmCapabilities) => void;
  resetEffect: (effect: string) => void;
  resetParameter: (param: ParameterType) => boolean;
}

export interface FilmStore extends FilmState, FilmActions {}

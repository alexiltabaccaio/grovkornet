
/**
 * Serialized Look & Feel parameters from FilmStore
 */
export interface FilmPresetPayload {
  // @@GEN_FILM_PAYLOAD_START@@
  saturation: number;
  contrast: number;
  grainIntensity: number;
  grainChroma: number;
  grainSize: number;
  grainSpeed: number;
  vignetteIntensity: number;
  chromaShift: number;
  temperature: number;
  tint: number;
  bloomIntensity: number;
  chromaticAberration: number;
  chromaShiftDirection: number;
  sharpening: number;
  satRed: number;
  satOrange: number;
  satYellow: number;
  satGreen: number;
  satCyan: number;
  satBlue: number;
  satPurple: number;
  satMagenta: number;
  aberrationInvert: boolean;
  boundMagentaRed: number;
  boundRedOrange: number;
  boundOrangeYellow: number;
  boundYellowGreen: number;
  boundGreenCyan: number;
  boundCyanBlue: number;
  boundBluePurple: number;
  boundPurpleMagenta: number;
  grainRoughness: number;
  grainEnabled: boolean;
  bloomEnabled: boolean;
  noiseReductionMode: number;
  noiseReductionAuto: boolean;
  temperatureAuto: boolean;
  blackLevel: number;
  highlights: number;
  pivot: number;
  contrastAuto: boolean;
  blackLevelAuto: boolean;
  highlightsAuto: boolean;
  pivotAuto: boolean;
  pixelationFactor: number;
  tapeJitter: number;
  scanlines: number;
  chromaShiftInvert: boolean;
  // @@GEN_FILM_PAYLOAD_END@@
}

/**
 * Serialized Exposure parameters from BodyStore
 */
export interface BodyPresetPayload {
  iso: number;
  ev: number;
  shutterSpeed: number;
  isoAuto: boolean;
  shutterSpeedAuto: boolean;
  evAuto: boolean;
}

export interface PresetPayload {
  film: FilmPresetPayload;
  body: BodyPresetPayload;
}

export interface Preset {
  id: string;
  name: string;
  payload: PresetPayload;
  isFavorite: boolean;
  inQuickSelect: boolean;
  createdAt: number;
  thumbnailUri?: string;
}



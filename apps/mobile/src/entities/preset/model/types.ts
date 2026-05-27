import { FilmStore } from '../../film/model/types';
import { BodyStore } from '../../body/model/types';

/**
 * Serialized Look & Feel parameters from FilmStore
 */
export interface FilmPresetPayload {
  saturation: number;
  contrast: number;
  grainIntensity: number;
  grainChroma: number;
  grainSize: number;
  grainSpeed: number;
  temperature: number;
  tint: number;
  bloomIntensity: number;
  chromaticAberration: number;
  aberrationDirection: number;
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
  grainEnabled: boolean;
  bloomEnabled: boolean;
  noiseReductionMode: number;
  noiseReductionAuto: boolean;
  temperatureAuto: boolean;
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

// ==========================================
// TypeScript Exhaustiveness Guards
// ==========================================

type FilmActionsKeys =
  | 'setSaturation'
  | 'setContrast'
  | 'setGrainIntensity'
  | 'setGrainChroma'
  | 'setGrainSize'
  | 'setGrainSpeed'
  | 'setTemperature'
  | 'setTint'
  | 'setBloomIntensity'
  | 'setChromaticAberration'
  | 'setAberrationDirection'
  | 'setSharpening'
  | 'setSatRed'
  | 'setSatOrange'
  | 'setSatYellow'
  | 'setSatGreen'
  | 'setSatCyan'
  | 'setSatBlue'
  | 'setSatPurple'
  | 'setSatMagenta'
  | 'setAberrationInvert'
  | 'setBoundMagentaRed'
  | 'setBoundRedOrange'
  | 'setBoundOrangeYellow'
  | 'setBoundYellowGreen'
  | 'setBoundGreenCyan'
  | 'setBoundCyanBlue'
  | 'setBoundBluePurple'
  | 'setBoundPurpleMagenta'
  | 'setGrainEnabled'
  | 'setBloomEnabled'
  | 'setNoiseReductionMode'
  | 'setNoiseReductionAuto'
  | 'setTemperatureAuto'
  | 'setCapabilities'
  | 'resetEffect';

type FilmExcludedKeys = 'capabilities';

type IsFilmStoreFullyCategorized = Exclude<
  keyof FilmStore,
  keyof FilmPresetPayload | FilmActionsKeys | FilmExcludedKeys
> extends never
  ? true
  : never;

// This will trigger a TypeScript error if any key in FilmStore state is added without being categorized
const _assertFilmStoreCategorized: IsFilmStoreFullyCategorized = true;

type BodyActionsKeys =
  | 'setDebugInfo'
  | 'setIso'
  | 'setEv'
  | 'setShutterSpeed'
  | 'setIsoAuto'
  | 'setShutterSpeedAuto'
  | 'setEvAuto'
  | 'setTorchState'
  | 'setTorchStrength'
  | 'setAspectRatio'
  | 'setResolutionSetting'
  | 'setFpsSetting'
  | 'setPreviewIn4k'
  | 'setCapabilities';

type BodyExcludedKeys =
  | 'fps'
  | 'hwFps'
  | 'resolution'
  | 'torchState'
  | 'torchStrength'
  | 'aspectRatio'
  | 'resolutionSetting'
  | 'fpsSetting'
  | 'previewIn4k'
  | 'capabilities';

type IsBodyStoreFullyCategorized = Exclude<
  keyof BodyStore,
  keyof BodyPresetPayload | BodyActionsKeys | BodyExcludedKeys
> extends never
  ? true
  : never;

// This will trigger a TypeScript error if any key in BodyStore state is added without being categorized
const _assertBodyStoreCategorized: IsBodyStoreFullyCategorized = true;

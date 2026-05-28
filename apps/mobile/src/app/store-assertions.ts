import { FilmStore } from '@entities/film';
import { BodyStore } from '@entities/body';
import { FilmPresetPayload, BodyPresetPayload } from '@entities/preset';

// ============================================================================
// TypeScript Exhaustiveness Guards
// Ensures that every key in FilmStore and BodyStore is accounted for.
// Located in app layer to avoid cross-slice entity imports.
// ============================================================================

type FilmActionsKeys =
  | 'setSaturation'
  | 'setContrast'
  | 'setGrainIntensity'
  | 'setGrainChroma'
  | 'setGrainSize'
  | 'setGrainSpeed'
  | 'setGrainRoughness'
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
  | 'setForce4k60fpsCrop'
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
  | 'force4k60fpsCrop'
  | 'capabilities';

type IsBodyStoreFullyCategorized = Exclude<
  keyof BodyStore,
  keyof BodyPresetPayload | BodyActionsKeys | BodyExcludedKeys
> extends never
  ? true
  : never;

// This will trigger a TypeScript error if any key in BodyStore state is added without being categorized
const _assertBodyStoreCategorized: IsBodyStoreFullyCategorized = true;

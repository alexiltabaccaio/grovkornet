import { ModuleType, ParameterType } from '@entities/system';
import {
  TEXTURE_PARAMETERS,
  COLOR_PARAMETERS,
  TONE_PARAMETERS,
  ARTIFACTS_PARAMETERS,
  DETAILS_PARAMETERS,
  PROCESSING_PARAMETERS,
} from '@features/sections/film';
import {
  EXPOSURE_PARAMETERS,
  CAPTURE_PARAMETERS,
  LIGHTING_PARAMETERS,
} from '@features/sections/body';
import { OPTICS_PARAMETERS, OPTICAL_EFFECTS_PARAMETERS } from '@features/sections/lens';

export const MODULE_PARAMETERS: Record<Exclude<ModuleType, 'preferences' | 'presets' | 'theme' | 'debug' | 'none'>, ParameterType[]> = {
  texture: TEXTURE_PARAMETERS,
  details: DETAILS_PARAMETERS,
  color: COLOR_PARAMETERS,
  tone: TONE_PARAMETERS,
  artifacts: ARTIFACTS_PARAMETERS,
  exposure: EXPOSURE_PARAMETERS,
  optics: OPTICS_PARAMETERS,
  optical_effects: OPTICAL_EFFECTS_PARAMETERS,
  lighting: LIGHTING_PARAMETERS,
  processing: PROCESSING_PARAMETERS,
  capture: CAPTURE_PARAMETERS,
};

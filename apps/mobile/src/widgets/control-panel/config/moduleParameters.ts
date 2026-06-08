import { ModuleType, ParameterType } from '@entities/system';
import {
  TEXTURE_PARAMETERS,
  COLOR_PARAMETERS,
  TONE_PARAMETERS,
  ARTIFACTS_PARAMETERS,
  DETAILS_PARAMETERS,
} from '@features/film-controls';
import {
  EXPOSURE_PARAMETERS,
  CAPTURE_PARAMETERS,
  LIGHTING_PARAMETERS,
  PROCESSING_PARAMETERS,
} from '@features/body-controls';
import { OPTICS_PARAMETERS } from '@features/lens-controls';

export const MODULE_PARAMETERS: Record<Exclude<ModuleType, 'preferences' | 'presets' | 'theme' | 'debug' | 'none'>, ParameterType[]> = {
  texture: TEXTURE_PARAMETERS,
  details: DETAILS_PARAMETERS,
  color: COLOR_PARAMETERS,
  tone: TONE_PARAMETERS,
  artifacts: ARTIFACTS_PARAMETERS,
  exposure: EXPOSURE_PARAMETERS,
  optics: OPTICS_PARAMETERS,
  lighting: LIGHTING_PARAMETERS,
  processing: PROCESSING_PARAMETERS,
  capture: CAPTURE_PARAMETERS,
};

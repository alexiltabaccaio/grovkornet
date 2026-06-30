import React from 'react';
import { ParameterType } from '@entities/system';
import { GenericParameterModule } from '@features/system-controls';

interface OpticalEffectsModuleProps {
  handlePressWithDouble: (param: ParameterType, action: () => void) => void;
}

export const OPTICAL_EFFECTS_PARAMETERS: ParameterType[] = [
  'chromatic_aberration',
  'lens_distortion',
  'vignette',
  'bloom',
  'halation',
];

export const OpticalEffectsModule = React.memo(({ handlePressWithDouble }: OpticalEffectsModuleProps) => {
  return (
    <GenericParameterModule
      parameters={OPTICAL_EFFECTS_PARAMETERS}
      handlePressWithDouble={handlePressWithDouble}
    />
  );
});

OpticalEffectsModule.displayName = 'OpticalEffectsModule';

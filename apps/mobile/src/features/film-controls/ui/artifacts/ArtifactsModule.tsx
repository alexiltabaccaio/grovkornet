import React from 'react';
import { ParameterType } from '@entities/system';
import { GenericParameterModule } from '@features/system-controls';

interface ArtifactsModuleProps {
  handlePressWithDouble: (param: ParameterType, action: () => void) => void;
}

export const ARTIFACTS_PARAMETERS: ParameterType[] = [
  'chromatic_aberration',
  'bloom',
  'vignette',
  'chroma_shift',
  'tape_jitter',
  'lens_distortion',
];

export const ArtifactsModule = React.memo(({ handlePressWithDouble }: ArtifactsModuleProps) => {
  return (
    <GenericParameterModule
      parameters={ARTIFACTS_PARAMETERS}
      handlePressWithDouble={handlePressWithDouble}
    />
  );
});

ArtifactsModule.displayName = 'ArtifactsModule';

import React from 'react';
import { ParameterType } from '@entities/system';
import { GenericParameterModule } from '@features/system-controls';

interface ArtifactsModuleProps {
  handlePressWithDouble: (param: ParameterType, action: () => void) => void;
}

export const ARTIFACTS_PARAMETERS: ParameterType[] = [
  'chroma_shift',
  'tape_jitter',
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

import React from 'react';
import { ParameterType } from '@entities/system';
import { GenericParameterModule } from '@entities/system';

interface ProcessingModuleProps {
  handlePressWithDouble: (param: ParameterType, action: () => void) => void;
}

const PROCESSING_PARAMETERS: ParameterType[] = ['noise_reduction', 'sharpening'];

export const ProcessingModule = React.memo(({ handlePressWithDouble }: ProcessingModuleProps) => {
  return (
    <GenericParameterModule
      parameters={PROCESSING_PARAMETERS}
      handlePressWithDouble={handlePressWithDouble}
    />
  );
});

ProcessingModule.displayName = 'ProcessingModule';

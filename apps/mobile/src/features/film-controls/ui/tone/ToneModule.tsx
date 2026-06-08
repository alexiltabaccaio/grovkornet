import React from 'react';
import { ParameterType } from '@entities/system';
import { GenericParameterModule } from '@entities/system';

interface ToneModuleProps {
  handlePressWithDouble: (param: ParameterType, action: () => void) => void;
}

export const TONE_PARAMETERS: ParameterType[] = ['contrast', 'blackLevel', 'highlights'];

export const ToneModule = React.memo(({ handlePressWithDouble }: ToneModuleProps) => {
  return (
    <GenericParameterModule
      parameters={TONE_PARAMETERS}
      handlePressWithDouble={handlePressWithDouble}
    />
  );
});

ToneModule.displayName = 'ToneModule';

import React from 'react';
import { ParameterType } from '@entities/system';
import { GenericParameterModule } from '@entities/system';

interface DetailsModuleProps {
  handlePressWithDouble: (param: ParameterType, action: () => void) => void;
}

export const DETAILS_PARAMETERS: ParameterType[] = ['sharpening'];

export const DetailsModule = React.memo(({ handlePressWithDouble }: DetailsModuleProps) => {
  return (
    <GenericParameterModule
      parameters={DETAILS_PARAMETERS}
      handlePressWithDouble={handlePressWithDouble}
    />
  );
});

DetailsModule.displayName = 'DetailsModule';

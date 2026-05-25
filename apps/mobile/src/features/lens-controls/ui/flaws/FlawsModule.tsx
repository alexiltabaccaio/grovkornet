import React from 'react';
import { ParameterType } from '@entities/system';
import { GenericParameterModule } from '@entities/system';


interface FlawsModuleProps {
  handlePressWithDouble: (param: ParameterType, action: () => void) => void;
}

const FLAWS_PARAMETERS: ParameterType[] = ['chromatic_aberration', 'bloom'];

export const FlawsModule = ({ handlePressWithDouble }: FlawsModuleProps) => {
  return (
    <GenericParameterModule
      parameters={FLAWS_PARAMETERS}
      handlePressWithDouble={handlePressWithDouble}
    />
  );
};

FlawsModule.whyDidYouRender = true;


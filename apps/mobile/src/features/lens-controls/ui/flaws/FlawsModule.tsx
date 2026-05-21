import React from 'react';
import { ParameterType } from '@entities/system';
import { GenericParameterModule } from '@entities/system';


interface FlawsModuleProps {
  handlePressWithDouble: (param: ParameterType, action: () => void) => void;
}

export const FlawsModule = ({ handlePressWithDouble }: FlawsModuleProps) => {
  return (
    <GenericParameterModule
      parameters={['chromatic_aberration', 'bloom']}
      handlePressWithDouble={handlePressWithDouble}
    />
  );
};

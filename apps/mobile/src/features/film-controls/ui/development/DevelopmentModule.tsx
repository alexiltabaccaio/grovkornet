import React from 'react';
import { ParameterType } from '@entities/system';
import { GenericParameterModule } from '@entities/system';


interface DevelopmentModuleProps {
  handlePressWithDouble: (param: ParameterType, action: () => void) => void;
}

export const DevelopmentModule = ({ handlePressWithDouble }: DevelopmentModuleProps) => {
  return (
    <GenericParameterModule
      parameters={['saturation', 'contrast', 'temperature', 'tint']}
      handlePressWithDouble={handlePressWithDouble}
    />
  );
};

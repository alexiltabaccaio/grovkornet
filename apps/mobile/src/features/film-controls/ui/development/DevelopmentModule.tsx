import React from 'react';
import { ParameterType } from '@entities/system';
import { GenericParameterModule } from '@entities/system';


interface DevelopmentModuleProps {
  handlePressWithDouble: (param: ParameterType, action: () => void) => void;
}

const DEVELOPMENT_PARAMETERS: ParameterType[] = ['saturation', 'contrast', 'temperature', 'tint'];

export const DevelopmentModule = ({ handlePressWithDouble }: DevelopmentModuleProps) => {
  return (
    <GenericParameterModule
      parameters={DEVELOPMENT_PARAMETERS}
      handlePressWithDouble={handlePressWithDouble}
    />
  );
};

DevelopmentModule.whyDidYouRender = true;


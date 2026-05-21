import React from 'react';
import { ParameterType } from '@entities/system';
import { GenericParameterModule } from '@entities/system';


interface TextureModuleProps {
  handlePressWithDouble: (param: ParameterType, action: () => void) => void;
}

export const TextureModule = ({ handlePressWithDouble }: TextureModuleProps) => {
  return (
    <GenericParameterModule
      parameters={['grain', 'sharpening', 'noise_reduction']}
      handlePressWithDouble={handlePressWithDouble}
    />
  );
};

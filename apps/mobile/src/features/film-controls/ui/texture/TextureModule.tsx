import React from 'react';
import { ParameterType } from '@entities/system';
import { GenericParameterModule } from '@entities/system';


interface TextureModuleProps {
  handlePressWithDouble: (param: ParameterType, action: () => void) => void;
}

const TEXTURE_PARAMETERS: ParameterType[] = ['grain'];

export const TextureModule = ({ handlePressWithDouble }: TextureModuleProps) => {
  return (
    <GenericParameterModule
      parameters={TEXTURE_PARAMETERS}
      handlePressWithDouble={handlePressWithDouble}
    />
  );
};

// TextureModule.whyDidYouRender = true;


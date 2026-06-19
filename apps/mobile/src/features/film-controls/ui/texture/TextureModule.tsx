import React from 'react';
import { ParameterType } from '@entities/system';
import { GenericParameterModule } from '@entities/system';


interface TextureModuleProps {
  handlePressWithDouble: (param: ParameterType, action: () => void) => void;
}

export const TEXTURE_PARAMETERS: ParameterType[] = ['grain', 'scanlines', 'pixelation'];

export const TextureModule = React.memo(({ handlePressWithDouble }: TextureModuleProps) => {
  return (
    <GenericParameterModule
      parameters={TEXTURE_PARAMETERS}
      handlePressWithDouble={handlePressWithDouble}
    />
  );
});

// TextureModule.whyDidYouRender = true;

TextureModule.displayName = 'TextureModule';

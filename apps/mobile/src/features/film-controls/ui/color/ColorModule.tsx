import React from 'react';
import { ParameterType } from '@entities/system';
import { GenericParameterModule } from '@entities/system';


interface ColorModuleProps {
  handlePressWithDouble: (param: ParameterType, action: () => void) => void;
}

const COLOR_PARAMETERS: ParameterType[] = ['saturation', 'temperature', 'tint'];

export const ColorModule = React.memo(({ handlePressWithDouble }: ColorModuleProps) => {
  return (
    <GenericParameterModule
      parameters={COLOR_PARAMETERS}
      handlePressWithDouble={handlePressWithDouble}
    />
  );
});

ColorModule.displayName = 'ColorModule';

import React from 'react';
import { ParameterType } from '@entities/system';
import { GenericParameterModule } from '@features/system-controls';


interface ColorModuleProps {
  handlePressWithDouble: (param: ParameterType, action: () => void) => void;
}

export const COLOR_PARAMETERS: ParameterType[] = ['temperature', 'tint', 'saturation', 'hue'];

export const ColorModule = React.memo(({ handlePressWithDouble }: ColorModuleProps) => {
  return (
    <GenericParameterModule
      parameters={COLOR_PARAMETERS}
      handlePressWithDouble={handlePressWithDouble}
    />
  );
});

ColorModule.displayName = 'ColorModule';

import React from 'react';
import { ParameterType } from '@entities/system';
import { GenericParameterModule } from '@entities/system';


interface ExposureModuleProps {
  handlePressWithDouble: (param: ParameterType, action: () => void) => void;
}

const EXPOSURE_PARAMETERS: ParameterType[] = ['ev', 'iso', 'shutter_speed'];

export const ExposureModule = ({ handlePressWithDouble }: ExposureModuleProps) => {
  return (
    <GenericParameterModule
      parameters={EXPOSURE_PARAMETERS}
      handlePressWithDouble={handlePressWithDouble}
    />
  );
};

// ExposureModule.whyDidYouRender = true;


import React from 'react';
import { ParameterType } from '@shared/types/camera';
import { GenericParameterModule } from '@entities/system';


interface ExposureModuleProps {
  handlePressWithDouble: (param: ParameterType, action: () => void) => void;
}

export const ExposureModule = ({ handlePressWithDouble }: ExposureModuleProps) => {
  return (
    <GenericParameterModule
      parameters={['iso', 'shutter_speed', 'ev']}
      handlePressWithDouble={handlePressWithDouble}
    />
  );
};

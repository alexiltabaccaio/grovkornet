import React from 'react';
import { ParameterType } from '@entities/system';
import { GenericParameterModule } from '@entities/system';


interface CaptureModuleProps {
  handlePressWithDouble: (param: ParameterType, action: () => void) => void;
}

export const CaptureModule = ({ handlePressWithDouble }: CaptureModuleProps) => {
  return (
    <GenericParameterModule
      parameters={['aspect_ratio', 'resolution_setting', 'fps_setting']}
      handlePressWithDouble={handlePressWithDouble}
    />
  );
};

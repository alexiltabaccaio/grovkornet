import React from 'react';
import { ParameterType } from '@entities/system';
import { GenericParameterModule } from '@entities/system';


interface CaptureModuleProps {
  handlePressWithDouble: (param: ParameterType, action: () => void) => void;
}

const CAPTURE_PARAMETERS: ParameterType[] = ['aspect_ratio', 'resolution_setting', 'fps_setting'];

export const CaptureModule = ({ handlePressWithDouble }: CaptureModuleProps) => {
  return (
    <GenericParameterModule
      parameters={CAPTURE_PARAMETERS}
      handlePressWithDouble={handlePressWithDouble}
    />
  );
};

import React from 'react';
import { ParameterType } from '@entities/system';
import { GenericParameterModule } from '@features/system-controls';


interface CaptureModuleProps {
  handlePressWithDouble: (param: ParameterType, action: () => void) => void;
}

export const CAPTURE_PARAMETERS: ParameterType[] = ['aspect_ratio', 'resolution_setting', 'fps_setting'];

export const CaptureModule = React.memo(({ handlePressWithDouble }: CaptureModuleProps) => {
  return (
    <GenericParameterModule
      parameters={CAPTURE_PARAMETERS}
      handlePressWithDouble={handlePressWithDouble}
    />
  );
});

// CaptureModule.whyDidYouRender = true;

CaptureModule.displayName = 'CaptureModule';

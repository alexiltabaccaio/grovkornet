import React from 'react';
import { GenericParameterModule } from '@features/system-controls';
import { ParameterType } from '@entities/system';

const DEBUG_PARAMETERS: (ParameterType | { id: ParameterType; labelKey: string })[] = [
  { id: 'ui_overlay', labelKey: 'parameters.ui_overlay' },
  { id: 'temperature_test', labelKey: 'parameters.temperature_test' },
  { id: 'developer_options', labelKey: 'parameters.developer_options' },
];

export const DebugModule = () => {
  if (!__DEV__) {
    return null;
  }
  return (
    <GenericParameterModule
      parameters={DEBUG_PARAMETERS}
    />
  );
};

DebugModule.displayName = 'DebugModule';

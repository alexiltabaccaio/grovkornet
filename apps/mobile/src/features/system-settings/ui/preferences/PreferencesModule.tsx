import React from 'react';
import { GenericParameterModule } from '@features/system-controls';


import { ParameterType } from '@entities/system';

const PREFERENCES_PARAMETERS: (ParameterType | { id: ParameterType, labelKey: string })[] = [
  'language',
  { id: 'vibration', labelKey: 'parameters.vibration' },
];

export const PreferencesModule = () => {
  return (
    <GenericParameterModule
      parameters={PREFERENCES_PARAMETERS}
    />
  );
};

// PreferencesModule.whyDidYouRender = true;


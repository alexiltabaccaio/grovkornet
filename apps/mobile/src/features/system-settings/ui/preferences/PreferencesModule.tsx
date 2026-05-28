import React from 'react';
import { GenericParameterModule } from '@entities/system';


import { ParameterType } from '@entities/system';

const PREFERENCES_PARAMETERS: (ParameterType | { id: ParameterType, labelKey: string })[] = [
  'language',
  { id: 'vibration', labelKey: 'parameters.vibration' },
  ...(__DEV__ ? [{ id: 'debug' as const, labelKey: 'modules.debug' }] : []),
];

export const PreferencesModule = () => {
  return (
    <GenericParameterModule
      parameters={PREFERENCES_PARAMETERS}
    />
  );
};

PreferencesModule.whyDidYouRender = true;


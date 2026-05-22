import React from 'react';
import { GenericParameterModule } from '@entities/system';


export const PreferencesModule = () => {
  return (
    <GenericParameterModule
      parameters={[
        'language',
        ...(__DEV__ ? [{ id: 'debug' as const, labelKey: 'modules.debug' }] : []),
      ]}
    />
  );
};

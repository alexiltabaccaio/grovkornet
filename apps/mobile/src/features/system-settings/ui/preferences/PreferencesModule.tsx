import React from 'react';
import { GenericParameterModule } from '@entities/system';


export const PreferencesModule = () => {
  return (
    <GenericParameterModule
      parameters={[
        'language',
        { id: 'debug', labelKey: 'modules.debug' },
      ]}
    />
  );
};

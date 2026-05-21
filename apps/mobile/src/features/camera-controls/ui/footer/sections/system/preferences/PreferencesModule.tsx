import React from 'react';
import { GenericParameterModule } from '@features/camera-controls/ui/footer/components/GenericParameterModule';

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

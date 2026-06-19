import React, { useMemo } from 'react';
import { useShallow } from 'zustand/shallow';
import { useLensStore } from '@entities/lens';
import { ParameterType } from '@entities/system';
import { GenericParameterModule, ParameterConfig } from '@features/system-controls';


export const OPTICS_PARAMETERS: ParameterType[] = ['camera_selection', 'focus'];

interface OpticsModuleProps {
  handlePressWithDouble: (param: ParameterType, action: () => void) => void;
}

export const OpticsModule = React.memo(({ handlePressWithDouble }: OpticsModuleProps) => {
  const { capabilities } = useLensStore(
    useShallow(s => ({
      capabilities: s.capabilities,
    }))
  );

  const parameters = useMemo((): (ParameterType | ParameterConfig)[] => {
    return [
      {
        id: 'camera_selection',
        labelKey: 'parameters.lens',
        visible: capabilities.availableCameras.length > 0,
      },
      {
        id: 'focus',
        visible: true,
      },
    ];
  }, [capabilities.availableCameras.length]);

  return (
    <GenericParameterModule
      parameters={parameters}
      handlePressWithDouble={handlePressWithDouble}
    />
  );
});

// OpticsModule.whyDidYouRender = true;

OpticsModule.displayName = 'OpticsModule';

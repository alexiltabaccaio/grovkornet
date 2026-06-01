import React, { useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useLensStore } from '@entities/lens';
import { ParameterType } from '@entities/system';
import { GenericParameterModule, ParameterConfig } from '@entities/system';


interface OpticsModuleProps {
  handlePressWithDouble: (param: ParameterType, action: () => void) => void;
}

export const OpticsModule = ({ handlePressWithDouble }: OpticsModuleProps) => {
  const { capabilities } = useLensStore(
    useShallow(s => ({
      capabilities: s.capabilities,
    }))
  );

  const parameters = useMemo(() => {
    const list: (ParameterType | ParameterConfig)[] = [];
    if (capabilities.availableCameras.length > 0) {
      list.push({
        id: 'camera_selection',
        labelKey: 'parameters.lens',
      });
    }
    list.push('focus');
    list.push('vignette');
    return list;
  }, [capabilities.availableCameras.length]);

  return (
    <GenericParameterModule
      parameters={parameters}
      handlePressWithDouble={handlePressWithDouble}
    />
  );
};

// OpticsModule.whyDidYouRender = true;


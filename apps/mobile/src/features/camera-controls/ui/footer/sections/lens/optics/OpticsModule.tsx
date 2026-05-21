import React, { useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useHardwareStore } from '@features/camera-controls/model/useHardwareStore';
import { ParameterType } from '@shared/types/camera';
import { GenericParameterModule, ParameterConfig } from '@features/camera-controls/ui/footer/components/GenericParameterModule';

interface OpticsModuleProps {
  handlePressWithDouble: (param: ParameterType, action: () => void) => void;
}

export const OpticsModule = ({ handlePressWithDouble }: OpticsModuleProps) => {
  const { capabilities } = useHardwareStore(
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
    return list;
  }, [capabilities.availableCameras.length]);

  return (
    <GenericParameterModule
      parameters={parameters}
      handlePressWithDouble={handlePressWithDouble}
    />
  );
};

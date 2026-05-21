import React from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useHardwareStore } from '@features/camera-controls/model/useHardwareStore';
import { ParameterType } from '@shared/types/camera';
import { GenericParameterModule } from '@features/camera-controls/ui/footer/components/GenericParameterModule';

interface LightingModuleProps {
  handlePressWithDouble: (param: ParameterType, action: () => void) => void;
}

export const LightingModule = ({ handlePressWithDouble }: LightingModuleProps) => {
  const { capabilities } = useHardwareStore(
    useShallow(s => ({
      capabilities: s.capabilities,
    }))
  );

  if (!capabilities.hasTorch) return null;

  return (
    <GenericParameterModule
      parameters={['torch']}
      handlePressWithDouble={handlePressWithDouble}
    />
  );
};

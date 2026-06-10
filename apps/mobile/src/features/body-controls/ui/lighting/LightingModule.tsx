import React, { useMemo } from 'react';
import { useShallow } from 'zustand/shallow';
import { useBodyStore } from '@entities/body';
import { ParameterType } from '@entities/system';
import { GenericParameterModule, ParameterConfig } from '@entities/system';


export const LIGHTING_PARAMETERS: ParameterType[] = ['torch'];

interface LightingModuleProps {
  handlePressWithDouble: (param: ParameterType, action: () => void) => void;
}

export const LightingModule = ({ handlePressWithDouble }: LightingModuleProps) => {
  const { capabilities } = useBodyStore(
    useShallow(s => ({
      capabilities: s.capabilities,
    }))
  );

  const parameters = useMemo((): (ParameterType | ParameterConfig)[] => {
    return [
      {
        id: 'torch',
        visible: !!capabilities.hasTorch,
      },
    ];
  }, [capabilities.hasTorch]);

  return (
    <GenericParameterModule
      parameters={parameters}
      handlePressWithDouble={handlePressWithDouble}
    />
  );
};

// LightingModule.whyDidYouRender = true;


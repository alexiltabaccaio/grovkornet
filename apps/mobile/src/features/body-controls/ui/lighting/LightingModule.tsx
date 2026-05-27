import React from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useBodyStore } from '@entities/body';
import { ParameterType } from '@entities/system';
import { GenericParameterModule } from '@entities/system';


interface LightingModuleProps {
  handlePressWithDouble: (param: ParameterType, action: () => void) => void;
}

const LIGHTING_PARAMETERS: ParameterType[] = ['torch'];

export const LightingModule = ({ handlePressWithDouble }: LightingModuleProps) => {
  const { capabilities } = useBodyStore(
    useShallow(s => ({
      capabilities: s.capabilities,
    }))
  );

  if (!capabilities.hasTorch) return null;

  return (
    <GenericParameterModule
      parameters={LIGHTING_PARAMETERS}
      handlePressWithDouble={handlePressWithDouble}
    />
  );
};

LightingModule.whyDidYouRender = true;


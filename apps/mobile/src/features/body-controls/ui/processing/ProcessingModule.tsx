import React, { useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useFilmStore } from '@entities/film';
import { ParameterType } from '@entities/system';
import { GenericParameterModule, ParameterConfig } from '@entities/system';

interface ProcessingModuleProps {
  handlePressWithDouble: (param: ParameterType, action: () => void) => void;
}

export const ProcessingModule = React.memo(({ handlePressWithDouble }: ProcessingModuleProps) => {
  const { capabilities } = useFilmStore(
    useShallow(s => ({
      capabilities: s.capabilities,
    }))
  );

  const parameters = useMemo((): (ParameterType | ParameterConfig)[] => {
    const hasNoiseReduction = capabilities?.availableNoiseReductionModes && capabilities.availableNoiseReductionModes.length > 0;
    return [
      {
        id: 'noise_reduction',
        visible: !!hasNoiseReduction,
      },
    ];
  }, [capabilities?.availableNoiseReductionModes]);

  return (
    <GenericParameterModule
      parameters={parameters}
      handlePressWithDouble={handlePressWithDouble}
    />
  );
});

ProcessingModule.displayName = 'ProcessingModule';

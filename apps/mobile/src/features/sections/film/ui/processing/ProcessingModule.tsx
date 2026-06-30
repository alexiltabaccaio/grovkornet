import React, { useMemo, useCallback } from 'react';
import { useShallow } from 'zustand/shallow';
import { useFilmStore } from '@entities/film';
import { ParameterType, useControlPanelStore, ConnectedParameter } from '@entities/system';
import { GenericParameterModule, ParameterConfig } from '@shared/ui';

export const PROCESSING_PARAMETERS: ParameterType[] = ['noise_reduction'];

interface ProcessingModuleProps {
  handlePressWithDouble: (param: ParameterType, action: () => void) => void;
}

export const ProcessingModule = React.memo(({ handlePressWithDouble }: ProcessingModuleProps) => {
  const { capabilities } = useFilmStore(
    useShallow(s => ({
      capabilities: s.capabilities,
    }))
  );

  const { activeParameter, setActiveParameter } = useControlPanelStore(
    useShallow((s) => ({
      activeParameter: s.activeParameter,
      setActiveParameter: s.setActiveParameter,
    }))
  );

  const parameters = useMemo((): (ParameterType | ParameterConfig<ParameterType>)[] => {
    const hasNoiseReduction = capabilities?.availableNoiseReductionModes && capabilities.availableNoiseReductionModes.length > 0;
    return [
      {
        id: 'noise_reduction',
        visible: !!hasNoiseReduction,
      },
    ];
  }, [capabilities?.availableNoiseReductionModes]);

  const renderItem = useCallback((id: ParameterType, label: string) => (
    <ConnectedParameter
      id={id}
      label={label}
      variant="text"
      handlePressWithDouble={handlePressWithDouble}
      disableGestures={true}
    />
  ), [handlePressWithDouble]);

  return (
    <GenericParameterModule<ParameterType>
      parameters={parameters}
      activeParameter={activeParameter}
      setActiveParameter={setActiveParameter}
      renderItem={renderItem}
      handlePressWithDouble={handlePressWithDouble}
    />
  );
});

ProcessingModule.displayName = 'ProcessingModule';


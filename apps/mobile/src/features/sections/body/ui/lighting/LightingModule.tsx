import React, { useMemo, useCallback } from 'react';
import { useShallow } from 'zustand/shallow';
import { useBodyStore } from '@entities/body';
import { ParameterType, useControlPanelStore, ConnectedParameter } from '@entities/system';
import { GenericParameterModule, ParameterConfig } from '@shared/ui';


export const LIGHTING_PARAMETERS: ParameterType[] = ['torch'];

interface LightingModuleProps {
  handlePressWithDouble: (param: ParameterType, action: () => void) => void;
}

export const LightingModule = React.memo(({ handlePressWithDouble }: LightingModuleProps) => {
  const { capabilities } = useBodyStore(
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
    return [
      {
        id: 'torch',
        visible: !!capabilities.hasTorch,
      },
    ];
  }, [capabilities.hasTorch]);

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

LightingModule.displayName = 'LightingModule';


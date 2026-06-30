import React, { useCallback } from 'react';
import { ParameterType, useControlPanelStore, ConnectedParameter } from '@entities/system';
import { GenericParameterModule, ParameterConfig } from '@shared/ui';
import { useShallow } from 'zustand/shallow';

const DEBUG_PARAMETERS: (ParameterType | ParameterConfig<ParameterType>)[] = [
  { id: 'ui_overlay', labelKey: 'parameters.ui_overlay' },
  { id: 'temperature_test', labelKey: 'parameters.temperature_test' },
  { id: 'developer_options', labelKey: 'parameters.developer_options' },
];

export const DebugModule = () => {
  const { activeParameter, setActiveParameter } = useControlPanelStore(
    useShallow((s) => ({
      activeParameter: s.activeParameter,
      setActiveParameter: s.setActiveParameter,
    }))
  );

  const renderItem = useCallback((id: ParameterType, label: string) => (
    <ConnectedParameter
      id={id}
      label={label}
      variant="text"
      disableGestures={true}
    />
  ), []);

  if (!__DEV__) {
    return null;
  }

  return (
    <GenericParameterModule<ParameterType>
      parameters={DEBUG_PARAMETERS}
      activeParameter={activeParameter}
      setActiveParameter={setActiveParameter}
      renderItem={renderItem}
    />
  );
};

DebugModule.displayName = 'DebugModule';


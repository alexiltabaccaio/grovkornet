import React, { useCallback } from 'react';
import { ParameterType, useControlPanelStore, ConnectedParameter } from '@entities/system';
import { GenericParameterModule, ParameterConfig } from '@shared/ui';
import { useShallow } from 'zustand/shallow';

const PREFERENCES_PARAMETERS: (ParameterType | ParameterConfig<ParameterType>)[] = [
  'language',
  { id: 'vibration', labelKey: 'parameters.vibration' },
  { id: 'stabilization_mode', labelKey: 'parameters.stabilizationMode' },
];

const PreferencesModuleComponent = () => {
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

  return (
    <GenericParameterModule<ParameterType>
      parameters={PREFERENCES_PARAMETERS}
      activeParameter={activeParameter}
      setActiveParameter={setActiveParameter}
      renderItem={renderItem}
    />
  );
};



export const PreferencesModule = React.memo(PreferencesModuleComponent);

import React, { useMemo, useCallback } from 'react';
import { useShallow } from 'zustand/shallow';
import { useLensStore } from '@entities/lens';
import { ParameterType, useControlPanelStore, ConnectedParameter } from '@entities/system';
import { GenericParameterModule, ParameterConfig } from '@shared/ui';

export const OPTICS_PARAMETERS: ParameterType[] = ['camera_selection', 'focus'];

interface OpticsModuleProps {
  handlePressWithDouble: (param: ParameterType, action: () => void) => void;
}

export const OpticsModule = React.memo(({ handlePressWithDouble }: OpticsModuleProps) => {
  const { capabilities } = useLensStore(
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
        id: 'camera_selection',
        labelKey: 'parameters.lens',
        visible: capabilities.availableCameras.length > 0,
      },
      {
        id: 'focus',
        visible: true,
      },
    ];
  }, [capabilities.availableCameras.length]);

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

OpticsModule.displayName = 'OpticsModule';


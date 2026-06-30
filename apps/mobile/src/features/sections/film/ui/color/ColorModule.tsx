import React, { useCallback } from 'react';
import { ParameterType, useControlPanelStore, ConnectedParameter } from '@entities/system';
import { GenericParameterModule } from '@shared/ui';
import { useShallow } from 'zustand/shallow';

interface ColorModuleProps {
  handlePressWithDouble: (param: ParameterType, action: () => void) => void;
}

export const COLOR_PARAMETERS: ParameterType[] = ['temperature', 'tint', 'saturation', 'hue'];

export const ColorModule = React.memo(({ handlePressWithDouble }: ColorModuleProps) => {
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
      handlePressWithDouble={handlePressWithDouble}
      disableGestures={true}
    />
  ), [handlePressWithDouble]);

  return (
    <GenericParameterModule<ParameterType>
      parameters={COLOR_PARAMETERS}
      activeParameter={activeParameter}
      setActiveParameter={setActiveParameter}
      renderItem={renderItem}
      handlePressWithDouble={handlePressWithDouble}
    />
  );
});

ColorModule.displayName = 'ColorModule';


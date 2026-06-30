import React, { useCallback } from 'react';
import { ParameterType, useControlPanelStore, ConnectedParameter } from '@entities/system';
import { GenericParameterModule } from '@shared/ui';
import { useShallow } from 'zustand/shallow';

interface ToneModuleProps {
  handlePressWithDouble: (param: ParameterType, action: () => void) => void;
}

export const TONE_PARAMETERS: ParameterType[] = ['contrast', 'blackLevel', 'highlights'];

export const ToneModule = React.memo(({ handlePressWithDouble }: ToneModuleProps) => {
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
      parameters={TONE_PARAMETERS}
      activeParameter={activeParameter}
      setActiveParameter={setActiveParameter}
      renderItem={renderItem}
      handlePressWithDouble={handlePressWithDouble}
    />
  );
});

ToneModule.displayName = 'ToneModule';


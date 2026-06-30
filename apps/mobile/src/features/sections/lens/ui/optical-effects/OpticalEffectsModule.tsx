import React, { useCallback } from 'react';
import { ParameterType, useControlPanelStore, ConnectedParameter } from '@entities/system';
import { GenericParameterModule } from '@shared/ui';
import { useShallow } from 'zustand/shallow';

interface OpticalEffectsModuleProps {
  handlePressWithDouble: (param: ParameterType, action: () => void) => void;
}

export const OPTICAL_EFFECTS_PARAMETERS: ParameterType[] = [
  'chromatic_aberration',
  'lens_distortion',
  'vignette',
  'bloom',
  'halation',
];

export const OpticalEffectsModule = React.memo(({ handlePressWithDouble }: OpticalEffectsModuleProps) => {
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
      parameters={OPTICAL_EFFECTS_PARAMETERS}
      activeParameter={activeParameter}
      setActiveParameter={setActiveParameter}
      renderItem={renderItem}
      handlePressWithDouble={handlePressWithDouble}
    />
  );
});

OpticalEffectsModule.displayName = 'OpticalEffectsModule';


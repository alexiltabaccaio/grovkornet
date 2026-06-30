import React, { useCallback } from 'react';
import { ParameterType, useControlPanelStore, ConnectedParameter } from '@entities/system';
import { GenericParameterModule } from '@shared/ui';
import { useShallow } from 'zustand/shallow';

interface ArtifactsModuleProps {
  handlePressWithDouble: (param: ParameterType, action: () => void) => void;
}

export const ARTIFACTS_PARAMETERS: ParameterType[] = [
  'chroma_shift',
  'tape_jitter',
  'chroma_bleed',
];

export const ArtifactsModule = React.memo(({ handlePressWithDouble }: ArtifactsModuleProps) => {
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
      parameters={ARTIFACTS_PARAMETERS}
      activeParameter={activeParameter}
      setActiveParameter={setActiveParameter}
      renderItem={renderItem}
      handlePressWithDouble={handlePressWithDouble}
    />
  );
});

ArtifactsModule.displayName = 'ArtifactsModule';


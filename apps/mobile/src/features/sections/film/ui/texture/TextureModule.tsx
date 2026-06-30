import React, { useCallback } from 'react';
import { ParameterType, useControlPanelStore, ConnectedParameter } from '@entities/system';
import { GenericParameterModule } from '@shared/ui';
import { useShallow } from 'zustand/shallow';

interface TextureModuleProps {
  handlePressWithDouble: (param: ParameterType, action: () => void) => void;
}

export const TEXTURE_PARAMETERS: ParameterType[] = ['grain', 'scanlines', 'pixelation'];

export const TextureModule = React.memo(({ handlePressWithDouble }: TextureModuleProps) => {
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
      parameters={TEXTURE_PARAMETERS}
      activeParameter={activeParameter}
      setActiveParameter={setActiveParameter}
      renderItem={renderItem}
      handlePressWithDouble={handlePressWithDouble}
    />
  );
});

TextureModule.displayName = 'TextureModule';


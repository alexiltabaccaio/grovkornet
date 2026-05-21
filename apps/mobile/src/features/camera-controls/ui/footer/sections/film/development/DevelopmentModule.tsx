import React from 'react';
import { ParameterType } from '@shared/types/camera';
import { GenericParameterModule } from '@features/camera-controls/ui/footer/components/GenericParameterModule';

interface DevelopmentModuleProps {
  handlePressWithDouble: (param: ParameterType, action: () => void) => void;
}

export const DevelopmentModule = ({ handlePressWithDouble }: DevelopmentModuleProps) => {
  return (
    <GenericParameterModule
      parameters={['saturation', 'contrast', 'temperature', 'tint']}
      handlePressWithDouble={handlePressWithDouble}
    />
  );
};

import React from 'react';
import { ParameterType } from '@shared/types/camera';
import { GenericParameterModule } from '@features/camera-controls/ui/footer/components/GenericParameterModule';

interface FlawsModuleProps {
  handlePressWithDouble: (param: ParameterType, action: () => void) => void;
}

export const FlawsModule = ({ handlePressWithDouble }: FlawsModuleProps) => {
  return (
    <GenericParameterModule
      parameters={['chromatic_aberration', 'bloom']}
      handlePressWithDouble={handlePressWithDouble}
    />
  );
};

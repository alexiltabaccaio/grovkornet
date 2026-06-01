import React from 'react';
import { ParameterType } from '@entities/system';
import { GenericParameterModule } from '@entities/system';

interface FlawsModuleProps {
  handlePressWithDouble: (param: ParameterType, action: () => void) => void;
}

const FLAWS_PARAMETERS: ParameterType[] = ['chroma_shift', 'tape_jitter', 'scanlines', 'pixelation'];

export const FlawsModule = React.memo(({ handlePressWithDouble }: FlawsModuleProps) => {
  return (
    <GenericParameterModule
      parameters={FLAWS_PARAMETERS}
      handlePressWithDouble={handlePressWithDouble}
    />
  );
});

FlawsModule.displayName = 'FlawsModule';

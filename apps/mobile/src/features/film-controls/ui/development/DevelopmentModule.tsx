import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ParameterType } from '@entities/system';
import { GenericParameterModule } from '@entities/system';


interface DevelopmentModuleProps {
  handlePressWithDouble: (param: ParameterType, action: () => void) => void;
}

const DEVELOPMENT_PARAMETERS: ParameterType[] = ['saturation', 'contrast', 'temperature', 'tint'];

export const DevelopmentModule = React.memo(({ handlePressWithDouble }: DevelopmentModuleProps) => {
  return (
    <GenericParameterModule
      parameters={DEVELOPMENT_PARAMETERS}
      handlePressWithDouble={handlePressWithDouble}
    />
  );
});

DevelopmentModule.displayName = 'DevelopmentModule';

(DevelopmentModule as any).whyDidYouRender = true;


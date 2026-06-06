import React from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import { UiOverlayPanel } from './UiOverlayPanel';
import { TemperatureTestPanel } from './TemperatureTestPanel';
import { DeveloperOptionsPanel } from './DeveloperOptionsPanel';
import { ParameterType } from '@entities/system';

interface DebugPanelsProps {
  parameter: ParameterType;
  animatedStyle?: StyleProp<ViewStyle>;
}

export const DebugPanels = ({ parameter, animatedStyle }: DebugPanelsProps) => {
  if (!__DEV__) {
    return null;
  }
  switch (parameter) {
    case 'ui_overlay':
      return <UiOverlayPanel animatedStyle={animatedStyle} />;
    case 'temperature_test':
      return <TemperatureTestPanel animatedStyle={animatedStyle} />;
    case 'developer_options':
      return <DeveloperOptionsPanel animatedStyle={animatedStyle} />;
    default:
      return null;
  }
};

DebugPanels.displayName = 'DebugPanels';

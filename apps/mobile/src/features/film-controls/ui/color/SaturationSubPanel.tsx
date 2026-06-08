import React from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import { SelectiveColorSubPanel } from './SelectiveColorSubPanel';

interface SaturationSubPanelProps {
  animatedStyle?: StyleProp<ViewStyle>;
}

export const SaturationSubPanel = ({
  animatedStyle
}: SaturationSubPanelProps) => {
  return <SelectiveColorSubPanel type="saturation" animatedStyle={animatedStyle} />;
};

import React from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import { SelectiveColorSubPanel } from './SelectiveColorSubPanel';

interface HueSubPanelProps {
  animatedStyle?: StyleProp<ViewStyle>;
}

export const HueSubPanel = ({
  animatedStyle
}: HueSubPanelProps) => {
  return <SelectiveColorSubPanel type="hue" animatedStyle={animatedStyle} />;
};

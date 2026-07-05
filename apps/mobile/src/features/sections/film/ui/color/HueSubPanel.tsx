import React from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import { SelectiveColorSubPanel } from './SelectiveColorSubPanel';

interface HueSubPanelProps {
  animatedStyle?: StyleProp<ViewStyle>;
}

const HueSubPanelComponent = ({
  animatedStyle
}: HueSubPanelProps) => {
  return <SelectiveColorSubPanel type="hue" animatedStyle={animatedStyle} />;
};

export const HueSubPanel = React.memo(HueSubPanelComponent);

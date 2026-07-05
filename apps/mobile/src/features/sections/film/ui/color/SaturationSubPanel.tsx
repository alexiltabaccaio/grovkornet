import React from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import { SelectiveColorSubPanel } from './SelectiveColorSubPanel';

interface SaturationSubPanelProps {
  animatedStyle?: StyleProp<ViewStyle>;
}

const SaturationSubPanelComponent = ({
  animatedStyle
}: SaturationSubPanelProps) => {
  return <SelectiveColorSubPanel type="saturation" animatedStyle={animatedStyle} />;
};

export const SaturationSubPanel = React.memo(SaturationSubPanelComponent);

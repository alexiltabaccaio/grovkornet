import React from 'react';
import { StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { useShallow } from 'zustand/react/shallow';
import { useUIStore } from '@features/camera-controls/model/useUIStore';
import { ParameterControl } from '@features/camera-controls/ui/footer/ParameterControl';
import { ParameterExtensionWrapper } from '@features/camera-controls/ui/footer/ParameterExtensionWrapper';

interface DebugSubPanelProps {
  parameterExtensionAnimatedStyle?: StyleProp<ViewStyle>;
}

export const DebugSubPanel = ({ parameterExtensionAnimatedStyle }: DebugSubPanelProps) => {
  const { isDebugEnabled, setIsDebugEnabled } = useUIStore(useShallow(state => ({
    isDebugEnabled: state.isDebugEnabled,
    setIsDebugEnabled: state.setIsDebugEnabled,
  })));

  return (
    <ParameterExtensionWrapper animatedStyle={parameterExtensionAnimatedStyle}>
      <ParameterControl
        label=""
        isActive={isDebugEnabled}
        hideDebugRectangles={true}
        onPress={() => setIsDebugEnabled(!isDebugEnabled)}
        variant="text"
        staticText={isDebugEnabled ? 'ON' : 'OFF'}
        isToggle={true}
      />
    </ParameterExtensionWrapper>
  );
};


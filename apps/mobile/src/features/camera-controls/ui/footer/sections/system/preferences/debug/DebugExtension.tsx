import React from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import { useShallow } from 'zustand/react/shallow';
import { useUIStore } from '@features/camera-controls/model/useUIStore';
import { ParameterControl } from '@features/camera-controls/ui/footer/components/ParameterControl';
import { ParameterExtensionWrapper } from '@features/camera-controls/ui/footer/components/ParameterExtensionWrapper';

interface DebugExtensionProps {
  parameterExtensionAnimatedStyle?: StyleProp<ViewStyle>;
}

export const DebugExtension = ({ parameterExtensionAnimatedStyle }: DebugExtensionProps) => {
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


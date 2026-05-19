import React from 'react';
import { StyleSheet, StyleProp, ViewStyle } from 'react-native';
import Animated from 'react-native-reanimated';
import { useShallow } from 'zustand/react/shallow';
import { useUIStore } from '@features/camera-controls/model/useUIStore';
import { ParameterControl } from '@features/camera-controls/ui/footer/ParameterControl';

interface DebugSubPanelProps {
  parameterExtensionAnimatedStyle?: StyleProp<ViewStyle>;
}

export const DebugSubPanel = ({ parameterExtensionAnimatedStyle }: DebugSubPanelProps) => {
  const { isDebugEnabled, setIsDebugEnabled } = useUIStore(useShallow(state => ({
    isDebugEnabled: state.isDebugEnabled,
    setIsDebugEnabled: state.setIsDebugEnabled,
  })));

  return (
    <Animated.View style={[styles.parameterExtensionContainer, parameterExtensionAnimatedStyle]}>
      <ParameterControl
        label=""
        isActive={isDebugEnabled}
        onPress={() => setIsDebugEnabled(!isDebugEnabled)}
        variant="text"
        staticText={isDebugEnabled ? 'ON' : 'OFF'}
        isToggle={true}
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  parameterExtensionContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
});

import React from 'react';
import { StyleSheet, StyleProp, ViewStyle, View } from 'react-native';
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
      <View style={[
        styles.debugWrapper,
        isDebugEnabled && { backgroundColor: 'rgba(0, 255, 0, 0.2)', borderWidth: 1, borderColor: 'green' }
      ]}>
        <ParameterControl
          label=""
          isActive={isDebugEnabled}
          hideDebugRectangles={true}
          onPress={() => setIsDebugEnabled(!isDebugEnabled)}
          variant="text"
          staticText={isDebugEnabled ? 'ON' : 'OFF'}
          isToggle={true}
        />
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  parameterExtensionContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    paddingTop: 5,
    paddingBottom: 5,
  },
  debugWrapper: {
    width: '100%',
    justifyContent: 'center',
  },
});

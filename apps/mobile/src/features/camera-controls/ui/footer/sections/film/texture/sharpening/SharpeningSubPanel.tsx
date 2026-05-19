import React from 'react';
import { StyleSheet, StyleProp, ViewStyle, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useShallow } from 'zustand/react/shallow';
import { useStylesStore } from '@features/camera-controls/model/useStylesStore';
import { ParameterControl } from '@features/camera-controls/ui/footer/ParameterControl';

interface SharpeningSubPanelProps {
  parameterExtensionAnimatedStyle?: StyleProp<ViewStyle>;
}

export const SharpeningSubPanel = ({ parameterExtensionAnimatedStyle }: SharpeningSubPanelProps) => {
  const { sharpening, setSharpening } = useStylesStore(useShallow(state => ({
    sharpening: state.sharpening,
    setSharpening: state.setSharpening,
  })));

  return (
    <View style={styles.container}>
      {/* Parameter Extension: Slider Nitidezza (sempre visibile a -35px) */}
      <Animated.View style={[styles.parameterExtensionContainer, parameterExtensionAnimatedStyle]}>
        <ParameterControl
          label=""
          isActive={true}
          onPress={() => {}}
          value={sharpening}
          minValue={0}
          maxValue={1}
          onChange={setSharpening}
          variant="slider"
          renderValue={true}
          valueFormatter={(v) => {
            'worklet';
            return `${Math.round(v * 100)}`;
          }}
          onReset={() => setSharpening(0)}
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
  },
  parameterExtensionContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
});

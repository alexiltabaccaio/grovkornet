import React from 'react';
import { StyleSheet, StyleProp, ViewStyle, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useShallow } from 'zustand/react/shallow';
import { useStylesStore } from '@features/camera-controls/model/useStylesStore';
import { ParameterControl } from '@features/camera-controls/ui/footer/ParameterControl';

interface SaturationSubPanelProps {
  parameterExtensionAnimatedStyle?: StyleProp<ViewStyle>;
}

export const SaturationSubPanel = ({ parameterExtensionAnimatedStyle }: SaturationSubPanelProps) => {
  const { saturation, setSaturation } = useStylesStore(useShallow(state => ({
    saturation: state.saturation,
    setSaturation: state.setSaturation,
  })));

  return (
    <View style={styles.container}>
      {/* Parameter Extension: Slider Saturazione con 0 al centro (valore 1.0) */}
      <Animated.View style={[styles.parameterExtensionContainer, parameterExtensionAnimatedStyle]}>
        <ParameterControl
          label=""
          isActive={true}
          onPress={() => {}}
          value={saturation}
          minValue={0}
          maxValue={2.0}
          centerValue={1.0}
          onChange={setSaturation}
          variant="slider"
          renderValue={true}
          valueFormatter={(v) => {
            'worklet';
            const val = Math.round((v - 1) * 100);
            return val > 0 ? `+${val}` : `${val}`;
          }}
          onReset={() => setSaturation(1.0)}
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
    marginTop: -35,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
});

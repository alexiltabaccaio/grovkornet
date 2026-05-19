import React from 'react';
import { StyleSheet, StyleProp, ViewStyle, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useShallow } from 'zustand/react/shallow';
import { useHardwareStore } from '@features/camera-controls/model/useHardwareStore';
import { ParameterControl } from '@features/camera-controls/ui/footer/ParameterControl';

interface TintSubPanelProps {
  parameterExtensionAnimatedStyle?: StyleProp<ViewStyle>;
}

const formatTint = (v: number) => {
  'worklet';
  const rounded = Math.round(v);
  return rounded > 0 ? `+${rounded}` : `${rounded}`;
};

export const TintSubPanel = ({ parameterExtensionAnimatedStyle }: TintSubPanelProps) => {
  const { tint, setTint, temperatureAuto, setTemperatureAuto } = useHardwareStore(useShallow(state => ({
    tint: state.tint,
    setTint: state.setTint,
    temperatureAuto: state.temperatureAuto,
    setTemperatureAuto: state.setTemperatureAuto,
  })));

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.parameterExtensionContainer, parameterExtensionAnimatedStyle]}>
        <ParameterControl
          label=""
          isActive={true}
          onPress={() => {}}
          value={tint}
          minValue={-100}
          maxValue={100}
          centerValue={0}
          onChange={setTint}
          variant="slider"
          isAuto={temperatureAuto}
          valueFormatter={formatTint}
          hideValueInAuto={true}
          autoValueText="AWB"
          onReset={() => setTemperatureAuto(true)}
          onToggleAuto={setTemperatureAuto}
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

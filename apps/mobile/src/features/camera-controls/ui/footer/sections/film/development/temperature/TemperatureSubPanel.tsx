import React from 'react';
import { StyleSheet, StyleProp, ViewStyle, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useShallow } from 'zustand/react/shallow';
import { useHardwareStore } from '@features/camera-controls/model/useHardwareStore';
import { ParameterControl } from '@features/camera-controls/ui/footer/ParameterControl';

interface TemperatureSubPanelProps {
  parameterExtensionAnimatedStyle?: StyleProp<ViewStyle>;
}

const formatTemperature = (v: number) => {
  'worklet';
  return `${Math.round(v)}K`;
};

export const TemperatureSubPanel = ({ parameterExtensionAnimatedStyle }: TemperatureSubPanelProps) => {
  const { temperature, setTemperature, temperatureAuto, setTemperatureAuto } = useHardwareStore(useShallow(state => ({
    temperature: state.temperature,
    setTemperature: state.setTemperature,
    temperatureAuto: state.temperatureAuto,
    setTemperatureAuto: state.setTemperatureAuto,
  })));

  return (
    <View style={styles.container}>
      {/* Parameter Extension: Slider Temperatura (sempre visibile a -35px) */}
      <Animated.View style={[styles.parameterExtensionContainer, parameterExtensionAnimatedStyle]}>
        <ParameterControl
          label=""
          isActive={true}
          onPress={() => {}}
          value={temperature}
          minValue={2000}
          maxValue={10000}
          onChange={setTemperature}
          variant="slider"
          isAuto={temperatureAuto}
          valueFormatter={formatTemperature}
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
